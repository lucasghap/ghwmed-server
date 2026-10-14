import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt/jwt-guard';
import { PrescriptionsService } from './prescriptions.service';

@UseGuards(JwtGuard)
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Get('/attendances/:id')
  findByAttendanceId(@Param('id') id: string) {
    return this.prescriptionsService.fetchByAttendanceId(+id)
  }
}
