import { Controller, Get, Query } from '@nestjs/common';
import { FindSchedulesDto } from './dto/find-schedules.dto';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  findSchedules(@Query() queryFindSchedules: FindSchedulesDto) {
    const { initialDate, finalDate } = queryFindSchedules

    return this.schedulesService.findSchedules({
      initialDate,
      finalDate
    })
  }

  @Get('/surgeries')
  findSchedulesSurgeries(@Query() queryFindSchedules: FindSchedulesDto) {
    const { initialDate, finalDate } = queryFindSchedules

    return this.schedulesService.findSchedulesSurgeries({
      initialDate,
      finalDate
    })
  }
}
