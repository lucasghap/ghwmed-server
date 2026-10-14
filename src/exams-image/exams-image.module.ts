import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prima.service';
import { ExamsImageController } from './exams-image.controller';
import { ExamsImageService } from './exams-image.service';

@Module({
  controllers: [ExamsImageController],
  providers: [ExamsImageService, PrismaService]
})
export class ExamsImageModule {}
