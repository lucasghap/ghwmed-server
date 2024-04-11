import { Module } from '@nestjs/common';
import { OracleService } from 'src/oracle/oracle.service';
import { PrismaService } from 'src/prima.service';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';

@Module({
  controllers: [AttendancesController],
  providers: [AttendancesService, OracleService, PrismaService]
})
export class AttendancesModule {}
