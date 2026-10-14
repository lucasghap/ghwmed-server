import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt/jwt-guard';
import { MedicalRecordsService } from './medical-records.service';

@UseGuards(JwtGuard)
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get('/attendances/:id')
  findByAttendanceId(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('search') search?: string,
  ) {
    return this.medicalRecordsService.findByAttendanceId(+id, Number(page) || 1, search)
  }

  @Get('/documents/:id/report-source')
  findReportSource(@Param('id') id: string) {
    return this.medicalRecordsService.findReportSource(+id)
  }
}
