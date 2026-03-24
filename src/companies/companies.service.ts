import { Injectable } from '@nestjs/common';
import { OracleService } from 'src/oracle/oracle.service';

@Injectable()
export class CompaniesService {
  constructor(private oracle: OracleService) {}

  async findActive() {
    const companies = await this.oracle.query(
      `
      SELECT
        cd_multi_empresa "multiCompanyId",
        ds_multi_empresa "name"
      FROM multi_empresas
      WHERE sn_ativo = 'S'
    `,
    );

    return companies;
  }
}
