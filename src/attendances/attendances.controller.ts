import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from 'src/auth/jwt/current-user';
import { JwtGuard } from 'src/auth/jwt/jwt-guard';
import { AttendancesService } from './attendances.service';

@Controller('attendances')
@UseGuards(JwtGuard)
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Get()
  findAttendances(@CurrentUser() user: AuthUser) {
    return this.attendancesService.findAttendances(user.id)
  }
}
