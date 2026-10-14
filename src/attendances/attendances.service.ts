import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/oracle/oracle.service';
import { PrismaService } from 'src/prima.service';

@Injectable()
export class AttendancesService {
  constructor(private oracle: OracleService, private prisma: PrismaService) {}

  async findAttendances(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const attendances = await this.oracle.query(
      `
      SELECT
        a.cd_atendimento "id"
        ,c.nm_convenio "covenantName"
        ,p.nm_paciente "patientName"
        ,To_Char(p.dt_nascimento, 'dd/mm/yyyy') "birthDate"
        ,fn_idade(p.dt_nascimento, 'a A m M d D') "age"
        ,To_Char(a.dt_atendimento, 'dd/mm/yyyy') "date"
        -- ,r.cd_prestador
        -- ,r.nm_prestador
        ,e.ds_especialid "specialtyName"
        ,Nvl(Nvl(a.cd_pro_int, a.cd_procedimento), 'Não informado') "procedureId"
        ,Nvl(Nvl(x.ds_pro_fat, ps.ds_procedimento), 'Não informado') "procedureName"
        ,u.ds_unid_int "unitName"
        ,l.ds_leito "bedName"
        ,Trunc(SYSDATE - a.dt_atendimento) "hospitalizedDays"   
      FROM dbamv.atendime a, dbamv.paciente p, dbamv.prestador r, dbamv.pro_fat x, dbamv.convenio c, dbamv.mov_int m, dbamv.leito l, dbamv.unid_int u, dbamv.especialid e, dbamv.procedimento_sus ps
      WHERE a.cd_paciente = p.cd_paciente
        AND a.cd_prestador = r.cd_prestador
        AND a.cd_pro_int = x.cd_pro_fat(+)
        AND a.cd_procedimento = ps.cd_procedimento(+) 
        AND a.cd_convenio = c.cd_convenio                      
        AND a.cd_atendimento = m.cd_atendimento
        AND m.cd_leito = l.cd_leito
        AND l.cd_unid_int = u.cd_unid_int
        AND a.cd_especialid = e.cd_especialid
        AND a.dt_alta IS NULL
        AND m.dt_lib_mov IS NULL
        AND a.tp_atendimento = 'I'
        AND r.NR_CPF_CGC  = :cpf
      ORDER BY a.dt_atendimento
    `,
      {
        cpf: user.cpf,
      },
    );

    return attendances;
  }

  /**
   * Row counts of the attendance dialog tabs in a single round trip. Each
   * subquery mirrors the filters of the matching tab listing, so the counter
   * always equals the number of rows the tab shows.
   */
  async countTabs(attendanceId: number) {
    const [counts] = await this.oracle.query(
      `
      SELECT
        (SELECT COUNT(*)
           FROM dbamv.diagnostico_atendime a, dbamv.cid c
          WHERE a.cd_cid = c.cd_cid
            AND a.cd_atendimento = :attendanceId) "diagnostics"
      ,(SELECT COUNT(*)
           FROM dbamv.pw_documento_clinico dc, dbamv.pw_doc_alergia_pac da, dbamv.pw_alergia_pac ap, dbamv.substancia su
          WHERE dc.cd_documento_clinico = da.cd_documento_clinico
            AND da.cd_problema = ap.cd_problema
            AND ap.cd_substancia = su.cd_substancia
            AND dc.cd_atendimento = :attendanceId) "allergies"
      ,(SELECT COUNT(*)
           FROM dbamv.ped_rx pr, dbamv.itped_rx ip, dbamv.exa_rx er
          WHERE pr.cd_ped_rx = ip.cd_ped_rx
            AND ip.cd_exa_rx = er.cd_exa_rx
            AND pr.cd_atendimento = :attendanceId) "exams-image"
      ,(SELECT COUNT(DISTINCT pl.cd_ped_lab)
           FROM dbamv.ped_lab pl, dbamv.itped_lab ipl, dbamv.exa_lab el
          WHERE pl.cd_ped_lab = ipl.cd_ped_lab
            AND ipl.cd_exa_lab = el.cd_exa_lab
            AND pl.cd_atendimento = :attendanceId) "lab-exams"
      ,(SELECT COUNT(*) FROM (
          SELECT DISTINCT pm.cd_pre_med, pm.dt_pre_med, pm.hr_pre_med, te.ds_tip_esq, tp.ds_tip_presc,
                 fa.ds_for_apl, tf.ds_tip_fre, im.qt_itpre_med || ' ' || up.ds_unidade
            FROM dbamv.pre_med pm, dbamv.itpre_med im, dbamv.tip_fre tf, dbamv.tip_presc tp, dbamv.tip_esq te, dbamv.for_apl fa, dbamv.uni_pro up
           WHERE pm.cd_pre_med = im.cd_pre_med
             AND im.cd_tip_fre = tf.cd_tip_fre
             AND im.cd_tip_presc = tp.cd_tip_presc
             AND im.cd_tip_esq = te.cd_tip_esq
             AND im.cd_for_apl = fa.cd_for_apl
             AND im.cd_uni_pro = up.cd_uni_pro (+)
             AND te.ds_tip_esq LIKE ('%MEDICAMEN%')
             AND pm.cd_atendimento = :attendanceId
             AND im.sn_cancelado = 'N'
             AND pm.hr_pre_med >= SYSDATE - INTERVAL '1' DAY)) "prescriptions"
      ,(SELECT COUNT(*)
           FROM dbamv.pw_documento_clinico a, dbamv.pagu_objeto b
          WHERE a.cd_objeto = b.cd_objeto
            AND a.cd_atendimento = :attendanceId
            AND a.tp_status = 'ASSINADO') "medical-records"
      FROM dual
    `,
      { attendanceId },
    );

    return counts;
  }
}
