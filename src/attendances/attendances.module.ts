import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prima.service';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';

@Module({
  controllers: [AttendancesController],
  providers: [AttendancesService, PrismaService]
})
export class AttendancesModule {}
