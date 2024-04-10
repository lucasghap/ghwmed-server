import { Module } from '@nestjs/common';
import { OracleService } from 'src/oracle/oracle.service';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService, OracleService]
})
export class SchedulesModule {}
