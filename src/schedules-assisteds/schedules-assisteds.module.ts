import { Module } from '@nestjs/common';
import { AdminModule } from 'src/admin/admin.module';
import { PrismaService } from 'src/prima.service';
import { SchedulesAssistedsController } from './schedules-assisteds.controller';
import { SchedulesAssistedsService } from './schedules-assisteds.service';

@Module({
  imports: [AdminModule],
  controllers: [SchedulesAssistedsController],
  providers: [SchedulesAssistedsService, PrismaService],
})
export class SchedulesAssistedsModule {}
