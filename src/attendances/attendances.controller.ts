import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt/jwt-guard';
import { AttendancesService } from './attendances.service';

@Controller('attendances')
@UseGuards(JwtGuard)
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Get()
  findAttendances() {
    return this.attendancesService.findAttendances()
  }
}
