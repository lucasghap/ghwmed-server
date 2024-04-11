import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt/jwt-guard';
import { FindSchedulesDto } from './dto/find-schedules.dto';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
@UseGuards(JwtGuard)
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

  @Get('/count')
  count() {
    return this.schedulesService.count()
  }
}
