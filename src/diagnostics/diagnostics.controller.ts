import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt/jwt-guard';
import { DiagnosticsService } from './diagnostics.service';

@UseGuards(JwtGuard)
@Controller('diagnostics')
export class DiagnosticsController {
  constructor(private readonly diagnosticsService: DiagnosticsService) {}

  @Get('/attendances/:id')
  findByAttendanceId(@Param('id') id: string) {
    return this.diagnosticsService.findByAttendanceId(+id)
  }
}
