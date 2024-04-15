import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/oracle/oracle.service';

@Injectable()
export class DiagnosticsService {
  constructor(private oracle: OracleService){}

  async findByAttendanceId(attendanceId: number) {
    const diagnostics = await this.oracle.query(`
      SELECT 
        To_Char(a.dh_diagnostico, 'dd/mm/yyyy') || ' ' || To_Char(a.dh_diagnostico, 'hh24:mi') "date",
        a.cd_cid || ' ' || c.ds_cid "cid"
      FROM diagnostico_atendime a, cid c
      WHERE a.cd_cid = c.cd_cid
      AND a.cd_atendimento = :attendanceId
      ORDER BY a.dh_diagnostico
    `, {
      attendanceId
    })

    return diagnostics
  }
}
