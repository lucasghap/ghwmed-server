import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/oracle/oracle.service';

@Injectable()
export class PrescriptionsService {
  constructor(private oracle: OracleService){}

  async fetchByAttendanceId(attendanceId: number) {
    const prescriptions = await this.oracle.query(`
      SELECT DISTINCT
        pm.cd_pre_med "id"
      ,pm.cd_atendimento cod_atendimento
      ,pm.dt_pre_med
      ,pm.hr_pre_med
      ,To_Char(pm.dt_pre_med, 'dd/mm/yyyy') || ' ' || To_Char(pm.hr_pre_med, 'hh24:mi') "date"
      ,te.ds_tip_esq "scheme"
      ,tp.ds_tip_presc "item"
      ,fa.ds_for_apl "applicationType"
      ,tf.ds_tip_fre "frequence"
      ,im.qt_itpre_med || ' ' || up.ds_unidade "quantity"
        FROM pre_med pm, itpre_med im,  tip_fre tf, tip_presc tp, tip_esq te, for_apl fa, uni_pro up
      WHERE pm.cd_pre_med = im.cd_pre_med
        AND im.cd_tip_fre = tf.cd_tip_fre
        AND im.cd_tip_presc = tp.cd_tip_presc
        AND im.cd_tip_esq = te.cd_tip_esq
        AND im.cd_for_apl = fa.cd_for_apl
        AND im.cd_uni_pro = up.cd_uni_pro (+)
        AND te.ds_tip_esq LIKE ('%MEDICAMEN%')
        AND pm.cd_atendimento = :attendanceId
        AND im.sn_cancelado = 'N'
        ORDER BY pm.dt_pre_med, pm.hr_pre_med
    `, {
      attendanceId
    })

    return prescriptions
  }
}
