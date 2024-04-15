import { Controller, Get, Param } from '@nestjs/common';
import { AllergiesService } from './allergies.service';

@Controller('allergies')
export class AllergiesController {
  constructor(private readonly allergiesService: AllergiesService) {}

  @Get('/attendances/:id')
  findByAttendanceId(@Param('id') id: string) {
    return this.allergiesService.findByAttendanceId(+id)
  }
}
