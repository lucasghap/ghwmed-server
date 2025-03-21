import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/oracle/oracle.service';
import { PrismaService } from 'src/prima.service';
import { FindSchedulesDto } from './dto/find-schedules.dto';

@Injectable()
export class SchedulesService {
  constructor(private oracle: OracleService, private prisma: PrismaService) {}

  getObject(schedule: any) {
    return {
      patientName: schedule.patientName,
      date: schedule.date,
      surgeryCenter: schedule.surgeryCenter,
      surgeryRoom: schedule.surgeryRoom,
      covenantName: schedule.covenantName,
      status: schedule.status,
      items: [
        {
          scheduleItem: schedule.scheduleItem,
          observation: schedule.observation,
          observationSurgery: schedule.observationSurgery,
        },
      ],
    };
  }

  async findSchedules({ initialDate, finalDate, userId }: FindSchedulesDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const schedules = await this.oracle.query(
      `
      SELECT 
        a.cd_it_agenda_central "id",
        to_char(a.hr_agenda, 'dd/mm/yyyy hh24:mi') "date",
        b.ds_item_agendamento "scheduleItem",
        a.nm_paciente "patientName",
        e.nm_convenio "covenantName",
        f.ds_multi_empresa "companyName",
        a.ds_observacao "observation",
        a.cd_atendimento "attendanceId",
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
      ORDER BY a.hr_agenda asc
    `,
      {
        initialDate,
        finalDate,
        cpf: user.cpf,
      },
    );

    return schedules;
  }

  async findSchedulesSurgeries({
    initialDate,
    finalDate,
    userId,
  }: FindSchedulesDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const schedules = await this.oracle.query(
      `
      SELECT DISTINCT
      A.CENTRO_CIRURGICO "surgeryCenter"
      ,A.SALA_CIRURGIA "surgeryRoom"
      ,to_char(A.DATA_AGENDA, 'dd/mm/yyyy hh24:mi') "date"
      ,A.PACIENTE "patientName"
      ,B.CONVENIO "covenantName"
      ,A.observacao_aviso "observation"
      ,B.CIRURGIA "scheduleItem"
      ,B.observacao_cirurgia "observationSurgery"
      ,A.DATA_AGENDA
      , 'scheduled' "status"
      FROM 
      (
      SELECT 
        a.cd_age_cir cod_agenda
      ,a.cd_aviso_cirurgia cod_aviso
      ,dt_inicio_age_cir data_agenda
      ,To_Char(a.vl_tempo_cirurgia, 'hh24:mi') tempo_cirurgia
      ,s.cd_cen_cir cod_centro_cirurgico
      ,c.ds_cen_cir centro_cirurgico
      ,s.cd_sal_cir cod_sala_cirurgia
      ,s.ds_sal_cir sala_cirurgia
      ,v.nm_paciente paciente
      ,v.vl_idade idade
      ,Decode(v.tp_sexo, 'M', 'Masculino', 'F', 'Feminino', 'I', 'Indeterminado') Sexo
      ,v.ds_obs_aviso observacao_aviso
      FROM 
        age_cir a
      ,sal_cir s
      ,cen_cir c
      ,aviso_cirurgia v
      WHERE a.cd_sal_cir = s.cd_sal_cir
        AND s.cd_cen_cir = c.cd_cen_cir
        AND a.cd_aviso_cirurgia = v.cd_aviso_cirurgia
        AND v.tp_situacao = 'G'
      ) A
      ,
      ( 
      SELECT 
        r.cd_aviso_cirurgia cod_aviso
      ,r.cd_convenio cod_convenio
      ,c.nm_convenio convenio
      ,r.cd_cirurgia cod_cirurgia
      ,g.ds_cirurgia cirurgia
      ,r.ds_observacao observacao_cirurgia
      ,p.cd_prestador cod_prestador
      ,t.nm_prestador prestador
        FROM cirurgia_aviso r, convenio c, cirurgia g, prestador_aviso p, prestador t
      WHERE r.cd_convenio = c.cd_convenio
        AND r.cd_cirurgia = g.cd_cirurgia
        AND r.cd_aviso_cirurgia = p.cd_aviso_cirurgia
        AND p.cd_prestador = t.cd_prestador
        AND t.nr_cpf_cgc = :cpf
        AND p.cd_ati_med = '01'
      ) B
      WHERE A.COD_AVISO = B.COD_AVISO
      AND to_date(to_char(a.data_agenda, 'YYYY-MM-DD'), 'YYYY-MM-DD')
      BETWEEN to_date(:initialDate, 'YYYY-MM-DD') AND to_date(:finalDate, 'YYYY-MM-DD')
      ORDER BY a.data_agenda
    `,
      {
        initialDate,
        finalDate,
        cpf: user.cpf,
      },
    );

    let schedulesGroup = [];

    schedules.forEach((schedule) => {
      const patientAndHourAlreadyAdded = schedulesGroup.some(
        (item) =>
          item.patientName === schedule.patientName &&
          item.date === schedule.date,
      );

      if (!patientAndHourAlreadyAdded) {
        schedulesGroup.push(this.getObject(schedule));
      } else {
        schedulesGroup = schedulesGroup.map((item) => {
          if (
            item.patientName === schedule.patientName &&
            item.date === schedule.date
          ) {
            item.items = [
              ...item.items,
              {
                scheduleItem: schedule.scheduleItem,
                observation: schedule.observation,
                observationSurgery: schedule.observationSurgery,
              },
            ];
          }

          return item;
        });
      }
    });

    return schedulesGroup;
  }

  async count(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const count = await this.oracle.query(
      `
      SELECT 
        'scheduled' "label",
      count(*) "amount"
        FROM it_agenda_central a,
          agenda_central b,
          prestador c
        WHERE a.cd_agenda_central = b.cd_agenda_central
        AND b.cd_prestador = c.cd_prestador
        AND a.nm_paciente IS NOT NULL
        AND c.nr_cpf_cgc = :cpf
        AND to_char(a.hr_agenda, 'YYYY-MM-DD') = to_char(sysdate, 'YYYY-MM-DD')
        
        UNION ALL

        select 
          'scheduled-surgeries' "label",
          count(*) "amount"
        from (
          SELECT DISTINCT
          A.CENTRO_CIRURGICO "surgeryCenter"
          ,A.SALA_CIRURGIA "surgeryRoom"
          ,to_char(A.DATA_AGENDA, 'dd/mm/yyyy hh24:mi') "date"
          ,A.PACIENTE "patientName"
          ,B.CONVENIO "covenantName"
          ,A.observacao_aviso "observation"
          ,B.CIRURGIA "scheduleItem"
          ,B.observacao_cirurgia "observationSurgery"
          ,A.DATA_AGENDA
          , 'scheduled' "status"
          FROM 
          (
          SELECT 
            a.cd_age_cir cod_agenda
          ,a.cd_aviso_cirurgia cod_aviso
          ,dt_inicio_age_cir data_agenda
          ,To_Char(a.vl_tempo_cirurgia, 'hh24:mi') tempo_cirurgia
          ,s.cd_cen_cir cod_centro_cirurgico
          ,c.ds_cen_cir centro_cirurgico
          ,s.cd_sal_cir cod_sala_cirurgia
          ,s.ds_sal_cir sala_cirurgia
          ,v.nm_paciente paciente
          ,v.vl_idade idade
          ,Decode(v.tp_sexo, 'M', 'Masculino', 'F', 'Feminino', 'I', 'Indeterminado') Sexo
          ,v.ds_obs_aviso observacao_aviso
          FROM 
            age_cir a
          ,sal_cir s
          ,cen_cir c
          ,aviso_cirurgia v
          WHERE a.cd_sal_cir = s.cd_sal_cir
            AND s.cd_cen_cir = c.cd_cen_cir
            AND a.cd_aviso_cirurgia = v.cd_aviso_cirurgia
            AND v.tp_situacao = 'G'
          ) A
          ,
          ( 
          SELECT 
            r.cd_aviso_cirurgia cod_aviso
          ,r.cd_convenio cod_convenio
          ,c.nm_convenio convenio
          ,r.cd_cirurgia cod_cirurgia
          ,g.ds_cirurgia cirurgia
          ,r.ds_observacao observacao_cirurgia
          ,p.cd_prestador cod_prestador
          ,t.nm_prestador prestador
            FROM cirurgia_aviso r, convenio c, cirurgia g, prestador_aviso p, prestador t
          WHERE r.cd_convenio = c.cd_convenio
            AND r.cd_cirurgia = g.cd_cirurgia
            AND r.cd_aviso_cirurgia = p.cd_aviso_cirurgia
            AND p.cd_prestador = t.cd_prestador
            AND t.nr_cpf_cgc = :cpf
            AND p.cd_ati_med = '01'
          ) B
          WHERE A.COD_AVISO = B.COD_AVISO
          AND to_char(a.data_agenda, 'YYYY-MM-DD') = to_char(sysdate, 'YYYY-MM-DD')
        )
        
        UNION ALL

        SELECT
          'attendances-internacao' "label",
          count(*) "amount"
          FROM atendime a, paciente p, prestador r, pro_fat x, convenio c, mov_int m, leito l, unid_int u, especialid e
        WHERE a.cd_paciente = p.cd_paciente
          AND a.cd_prestador = r.cd_prestador
          AND a.cd_pro_int = x.cd_pro_fat(+)
          AND a.cd_convenio = c.cd_convenio
          AND a.cd_atendimento = m.cd_atendimento
          AND m.cd_leito = l.cd_leito
          AND l.cd_unid_int = u.cd_unid_int
          AND a.cd_especialid = e.cd_especialid
          AND a.dt_alta IS NULL
          AND m.dt_lib_mov IS NULL
          AND a.tp_atendimento = 'I'
          AND r.NR_CPF_CGC  = :cpf
    `,
      {
        cpf: user.cpf,
      },
    );

    return count;
  }
}
