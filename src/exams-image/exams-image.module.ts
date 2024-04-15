import { Module } from '@nestjs/common';
import { OracleService } from 'src/oracle/oracle.service';
import { ExamsImageController } from './exams-image.controller';
import { ExamsImageService } from './exams-image.service';

@Module({
  controllers: [ExamsImageController],
  providers: [ExamsImageService, OracleService]
})
export class ExamsImageModule {}
