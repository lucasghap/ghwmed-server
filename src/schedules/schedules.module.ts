import { Module } from '@nestjs/common';
import { OracleService } from 'src/oracle/oracle.service';
import { PrismaService } from 'src/prima.service';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService, OracleService, PrismaService]
})
export class SchedulesModule {}
