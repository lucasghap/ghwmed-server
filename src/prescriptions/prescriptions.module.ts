import { Module } from '@nestjs/common';
import { OracleService } from 'src/oracle/oracle.service';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionsService } from './prescriptions.service';

@Module({
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService, OracleService]
})
export class PrescriptionsModule {}
