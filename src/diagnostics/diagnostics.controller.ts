import { Controller, Get, Param } from '@nestjs/common';
import { DiagnosticsService } from './diagnostics.service';

@Controller('diagnostics')
export class DiagnosticsController {
  constructor(private readonly diagnosticsService: DiagnosticsService) {}

  @Get('/attendances/:id')
  findByAttendanceId(@Param('id') id: string) {
    return this.diagnosticsService.findByAttendanceId(+id)
  }
}
