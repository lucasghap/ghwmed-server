import { Module } from '@nestjs/common';
import { ExamsImageController } from './exams-image.controller';
import { ExamsImageService } from './exams-image.service';

@Module({
  controllers: [ExamsImageController],
  providers: [ExamsImageService]
})
export class ExamsImageModule {}
