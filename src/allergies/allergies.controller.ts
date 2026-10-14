import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt/jwt-guard';
import { AllergiesService } from './allergies.service';

@UseGuards(JwtGuard)
@Controller('allergies')
export class AllergiesController {
  constructor(private readonly allergiesService: AllergiesService) {}

  @Get('/attendances/:id')
  findByAttendanceId(@Param('id') id: string) {
    return this.allergiesService.findByAttendanceId(+id)
  }
}
