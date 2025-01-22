import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
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
  create(@Body() createSchedulesAssistedDto: CreateSchedulesAssistedDto) {
    return this.schedulesAssistedsService.create(createSchedulesAssistedDto);
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
