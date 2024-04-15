import { Controller, Get, Param } from '@nestjs/common';
import { ExamsImageService } from './exams-image.service';

@Controller('exams-image')
export class ExamsImageController {
  constructor(private readonly examsImageService: ExamsImageService) {}

  @Get('/attendances/:id')
  findByAttendanceId(@Param('id') id: string) {
    return this.examsImageService.findByAttendanceId(+id)
  }
}
