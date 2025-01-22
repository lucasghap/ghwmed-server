import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prima.service';
import { SchedulesAssistedsController } from './schedules-assisteds.controller';
import { SchedulesAssistedsService } from './schedules-assisteds.service';

@Module({
  controllers: [SchedulesAssistedsController],
  providers: [SchedulesAssistedsService, PrismaService],
})
export class SchedulesAssistedsModule {}
