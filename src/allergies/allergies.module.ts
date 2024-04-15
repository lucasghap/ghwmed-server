import { Module } from '@nestjs/common';
import { OracleService } from 'src/oracle/oracle.service';
import { AllergiesController } from './allergies.controller';
import { AllergiesService } from './allergies.service';

@Module({
  controllers: [AllergiesController],
  providers: [AllergiesService, OracleService]
})
export class AllergiesModule {}
