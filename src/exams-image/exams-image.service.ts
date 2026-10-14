import { Injectable, NotFoundException } from '@nestjs/common';
import { IntegrationStatus, IntegrationType } from '@prisma/client';
import { OracleService } from 'src/oracle/oracle.service';
import { PrismaService } from 'src/prima.service';

@Injectable()
export class ExamsImageService {
  constructor(
    private oracle: OracleService,
    private prisma: PrismaService,
  ) {}

  async findByAttendanceId(attendanceId: number) {
    const examsImage = await this.oracle.query(`
      SELECT 
        pr.cd_ped_rx "requestId"
      ,ip.cd_itped_rx "itemRequestId"
      ,To_Char(pr.dt_pedido, 'dd/mm/yyyy') || ' ' || To_Char(pr.hr_pedido, 'hh24:mi') "date"
      ,er.ds_exa_rx "examName"
      ,ip.sn_realizado "done"
      ,ip.cd_laudo "reportId"
        FROM dbamv.ped_rx pr, dbamv.itped_rx ip, dbamv.exa_rx er
      WHERE pr.cd_ped_rx = ip.cd_ped_rx
        AND ip.cd_exa_rx = er.cd_exa_rx
        AND pr.cd_atendimento = :attendanceId
    `, {
      attendanceId
    })

    return examsImage
  }

  private findActiveIntegration() {
    return this.prisma.integration.findFirst({
      where: { type: IntegrationType.IMAGE_EXAM, status: IntegrationStatus.ACTIVE },
      orderBy: { created_at: 'desc' },
    })
  }

  /** Only what the tab needs to pick its columns; URLs and tokens stay on the server. */
  async findIntegrationSettings() {
    const integration = await this.findActiveIntegration()

    return {
      configured: Boolean(integration),
      separateReport: Boolean(integration?.separate_report && integration.report_url),
    }
  }

  async findReportSource(itemRequestId: number) {
    const [item] = await this.oracle.query(`
      SELECT
        pr.cd_ped_rx "requestId"
      ,ip.cd_itped_rx "itemRequestId"
      ,pr.cd_atendimento "attendanceId"
      ,ip.cd_laudo "reportId"
        FROM dbamv.ped_rx pr, dbamv.itped_rx ip
      WHERE pr.cd_ped_rx = ip.cd_ped_rx
        AND ip.cd_itped_rx = :itemRequestId
    `, {
      itemRequestId
    })

    if (!item) {
      throw new NotFoundException('Exame não encontrado')
    }

    const integration = await this.findActiveIntegration()

    if (!integration) {
      throw new NotFoundException('Integração não configurada')
    }

    return {
      ...item,
      integration: {
        url: integration.url,
        response: integration.response,
        separate_report: integration.separate_report,
        report_url: integration.report_url,
        report_response: integration.report_response,
        ghapflow_integration: integration.ghapflow_integration,
      },
    }
  }
}
