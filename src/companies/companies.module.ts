import { Module } from '@nestjs/common';
import { OracleService } from 'src/oracle/oracle.service';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService, OracleService],
})
export class CompaniesModule {}
