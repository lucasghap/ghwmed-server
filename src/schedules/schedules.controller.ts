import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from 'src/auth/jwt/current-user';
import { JwtGuard } from 'src/auth/jwt/jwt-guard';
import { FindSchedulesDto } from './dto/find-schedules.dto';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
@UseGuards(JwtGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  findSchedules(
    @Query() queryFindSchedules: FindSchedulesDto,
    @CurrentUser() user: AuthUser,
  ) {
    const { initialDate, finalDate } = queryFindSchedules;

    return this.schedulesService.findSchedules({
      initialDate,
      finalDate,
      userId: user.id,
    });
  }

  @Get('/surgeries')
  findSchedulesSurgeries(
    @Query() queryFindSchedules: FindSchedulesDto,
    @CurrentUser() user: AuthUser,
  ) {
    const { initialDate, finalDate } = queryFindSchedules;

    return this.schedulesService.findSchedulesSurgeries({
      initialDate,
      finalDate,
      userId: user.id,
    });
  }

  @Get('/count')
  count(@CurrentUser() user: AuthUser) {
    return this.schedulesService.count(user.id);
  }
}
