import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthUser, CurrentUser } from 'src/auth/jwt/current-user';
import { JwtGuard } from 'src/auth/jwt/jwt-guard';
import { CreateSchedulesAssistedDto } from './dto/create-schedules-assisted.dto';
import { SchedulesAssistedsService } from './schedules-assisteds.service';

@Controller('schedules-assisteds')
@UseGuards(JwtGuard)
export class SchedulesAssistedsController {
  constructor(
    private readonly schedulesAssistedsService: SchedulesAssistedsService,
  ) {}

  @Post()
  create(
    @Body() createSchedulesAssistedDto: CreateSchedulesAssistedDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.schedulesAssistedsService.create({
      ...createSchedulesAssistedDto,
      userId: user.id,
    });
  }

  @Get('/schedules-mv/:id')
  findByScheduleMvId(@Param('id') id: string) {
    return this.schedulesAssistedsService.findByScheduleMvId(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schedulesAssistedsService.remove(id);
  }
}
