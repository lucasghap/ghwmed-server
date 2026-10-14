import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt/jwt-guard';
import { LabExamsService } from './lab-exams.service';

@UseGuards(JwtGuard)
@Controller('lab-exams')
export class LabExamsController {
  constructor(private readonly labExamsService: LabExamsService) {}

  @Get('/attendances/:id')
  findByAttendanceId(@Param('id') id: string) {
    return this.labExamsService.findByAttendanceId(+id)
  }

  @Get('/requests/:id/report-source')
  findReportSource(@Param('id') id: string) {
    return this.labExamsService.findReportSource(+id)
  }
}
