import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/oracle/oracle.service';
import { PrismaService } from 'src/prima.service';

@Injectable()
export class AttendancesService {
  constructor(private oracle: OracleService, private prisma: PrismaService){}

  async findAttendances(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    })

    const attendances = await this.oracle.query(`
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
      ,a.cd_pro_int "procedureId"
      ,x.ds_pro_fat "procedureName"
      ,u.ds_unid_int "unitName"
      ,l.ds_leito "bedName"
      ,Trunc(SYSDATE - a.dt_atendimento) "hospitalizedDays"
        FROM atendime a, paciente p, prestador r, pro_fat x, convenio c, mov_int m, leito l, unid_int u, especialid e
      WHERE a.cd_paciente = p.cd_paciente
        AND a.cd_prestador = r.cd_prestador
        AND a.cd_pro_int = x.cd_pro_fat
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
    `, {
      cpf: user.cpf
    })

    return attendances
  }
}
