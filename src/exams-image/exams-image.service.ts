import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/oracle/oracle.service';

@Injectable()
export class ExamsImageService {
  constructor(private oracle: OracleService){}

  async findByAttendanceId(attendanceId: number) {
    const examsImage = await this.oracle.query(`
      SELECT 
        pr.cd_ped_rx "requestId"
      ,To_Char(pr.dt_pedido, 'dd/mm/yyyy') || ' ' || To_Char(pr.hr_pedido, 'hh24:mi') "date"
      ,er.ds_exa_rx "examName"
      ,ip.sn_realizado "done"
        FROM ped_rx pr, itped_rx ip, exa_rx er
      WHERE pr.cd_ped_rx = ip.cd_ped_rx
        AND ip.cd_exa_rx = er.cd_exa_rx
        AND pr.cd_atendimento = :attendanceId
    `, {
      attendanceId
    })

    return examsImage
  }
}
