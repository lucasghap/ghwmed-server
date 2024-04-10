import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/oracle/oracle.service';
import { FindSchedulesDto } from './dto/find-schedules.dto';

@Injectable()
export class SchedulesService {
  constructor(private oracle: OracleService){}

  async findSchedules({ initialDate, finalDate }: FindSchedulesDto) {
    const schedules = await this.oracle.query(`
      SELECT 
        a.cd_it_agenda_central "id",
        to_char(a.hr_agenda, 'dd/mm/yyyy hh:mm') "date",
        b.ds_item_agendamento "scheduleItem",
        a.nm_paciente "patientName",
        e.nm_convenio "covenantName",
        f.ds_multi_empresa "companyName",
        a.ds_observacao "observation",
        CASE 
          WHEN a.tp_situacao = 'C'
            THEN 'canceled'
              ELSE 'scheduled'
        END "status"
      FROM it_agenda_central a,
        item_agendamento b,
        agenda_central c,
        prestador d,
        convenio e,
        multi_empresas f
      WHERE a.cd_item_agendamento = b.cd_item_agendamento
      AND a.cd_agenda_central = c.cd_agenda_central
      AND c.cd_prestador = d.cd_prestador
      AND a.cd_convenio = e.cd_convenio
      AND c.cd_multi_empresa = f.cd_multi_empresa
      AND a.nm_paciente IS NOT NULL
      AND d.nr_cpf_cgc = :cpf
      AND to_date(to_char(a.hr_agenda, 'YYYY-MM-DD'), 'YYYY-MM-DD')
      BETWEEN to_date(:initialDate, 'YYYY-MM-DD') AND to_date(:finalDate, 'YYYY-MM-DD')
    `, {
      initialDate,
      finalDate,
      cpf: '05126632620'
    })

    return schedules
  }
}
