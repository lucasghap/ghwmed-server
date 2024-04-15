import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/oracle/oracle.service';

@Injectable()
export class PrescriptionsService {
  constructor(private oracle: OracleService){}

  async findByAttendanceId(attendanceId: number) {
    const prescriptions = await this.oracle.query(`
      SELECT 
        To_Char(dc.dh_criacao, 'dd/mm/yyyy') || ' ' || To_Char(dc.dh_criacao, 'hh24:mi') "date"
      ,su.ds_substancia "substance"
      ,decode(ap.tp_alergia, 'O','outros', 'A','Alimento', 'S', '(Substancia) Medicamento') "allergyType"
      ,Decode(ap.tp_severidade,'G','Grave', 'M','Moderada', 'L','Leve', 'D','Desconhecida') "severity"
      ,da.ds_observacao "observation"
        FROM pw_documento_clinico dc, pw_doc_alergia_pac da, pw_alergia_pac ap, substancia su
      WHERE dc.cd_documento_clinico = da.cd_documento_clinico
        AND da.cd_problema = ap.cd_problema
        AND ap.cd_substancia = su.cd_substancia
        and dc.cd_atendimento = :attendanceId
        ORDER BY dc.dh_criacao ASC
    `, {
      attendanceId
    })

    return prescriptions
  }
}
