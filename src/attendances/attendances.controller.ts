import { Controller, Get } from '@nestjs/common';
import { AttendancesService } from './attendances.service';

@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Get()
  findAttendances() {
    return this.attendancesService.findAttendances()
  }
}
