import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt/jwt-guard';
import { ExamsImageService } from './exams-image.service';

@UseGuards(JwtGuard)
@Controller('exams-image')
export class ExamsImageController {
  constructor(private readonly examsImageService: ExamsImageService) {}

  @Get('/attendances/:id')
  findByAttendanceId(@Param('id') id: string) {
    return this.examsImageService.findByAttendanceId(+id)
  }

  @Get('/integration')
  findIntegrationSettings() {
    return this.examsImageService.findIntegrationSettings()
  }

  @Get('/items/:id/report-source')
  findReportSource(@Param('id') id: string) {
    return this.examsImageService.findReportSource(+id)
  }
}
