import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prima.service';
import { LabExamsController } from './lab-exams.controller';
import { LabExamsService } from './lab-exams.service';

@Module({
  controllers: [LabExamsController],
  providers: [LabExamsService, PrismaService]
})
export class LabExamsModule {}
