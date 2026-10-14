import { Injectable, NotFoundException } from '@nestjs/common';
import { IntegrationType } from '@prisma/client';
import { findActiveIntegration } from 'src/common/integrations/find-active-integration';
import { OracleService } from 'src/oracle/oracle.service';
import { PrismaService } from 'src/prima.service';

interface LabExamRow {
  requestId: number
  date: string
  providerName: string
  itemRequestId: number
  examName: string
  reportDate: string | null
}

@Injectable()
export class LabExamsService {
  constructor(
    private oracle: OracleService,
    private prisma: PrismaService,
  ) {}

  async findByAttendanceId(attendanceId: number) {
    const rows: LabExamRow[] = await this.oracle.query(`
      SELECT
        pl.cd_ped_lab "requestId"
      ,To_Char(pl.dt_pedido, 'dd/mm/yyyy') || ' ' || To_Char(pl.hr_ped_lab, 'hh24:mi') "date"
      ,p.nm_prestador "providerName"
      ,ipl.cd_itped_lab "itemRequestId"
      ,el.nm_exa_lab "examName"
      ,To_Char(ipl.dt_laudo, 'dd/mm/yyyy hh24:mi') "reportDate"
        FROM dbamv.ped_lab pl, dbamv.itped_lab ipl, dbamv.exa_lab el, dbamv.prestador p
      WHERE pl.cd_ped_lab = ipl.cd_ped_lab
        AND ipl.cd_exa_lab = el.cd_exa_lab
        AND pl.cd_prestador = p.cd_prestador(+)
        AND pl.cd_atendimento = :attendanceId
      ORDER BY pl.hr_ped_lab DESC, pl.cd_ped_lab DESC, ipl.cd_itped_lab ASC
    `, {
      attendanceId
    })

    const requests = new Map<number, {
      requestId: number
      date: string
      providerName: string
      reported: boolean
      exams: { itemRequestId: number; examName: string; reportDate: string | null }[]
    }>()

    for (const row of rows) {
      if (!requests.has(row.requestId)) {
        requests.set(row.requestId, {
          requestId: row.requestId,
          date: row.date,
          providerName: row.providerName,
          reported: false,
          exams: [],
        })
      }

      const request = requests.get(row.requestId)
      request.exams.push({
        itemRequestId: row.itemRequestId,
        examName: row.examName,
        reportDate: row.reportDate,
      })
      request.reported = request.reported || Boolean(row.reportDate)
    }

    return [...requests.values()]
  }

  async findReportSource(requestId: number) {
    const items: { itemRequestId: number; attendanceId: number }[] = await this.oracle.query(`
      SELECT ipl.cd_itped_lab "itemRequestId", pl.cd_atendimento "attendanceId"
        FROM dbamv.ped_lab pl, dbamv.itped_lab ipl
      WHERE pl.cd_ped_lab = ipl.cd_ped_lab
        AND pl.cd_ped_lab = :requestId
    `, {
      requestId
    })

    if (!items.length) {
      throw new NotFoundException(`Nenhum item encontrado para o pedido ${requestId}`)
    }

    const integration = await findActiveIntegration(this.prisma, IntegrationType.LAB_EXAM)

    return {
      requestId,
      attendanceId: items[0].attendanceId,
      itemRequestIds: items.map((item) => item.itemRequestId),
      integration,
    }
  }
}
