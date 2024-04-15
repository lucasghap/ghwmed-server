import { Module } from '@nestjs/common';
import { OracleService } from 'src/oracle/oracle.service';
import { DiagnosticsController } from './diagnostics.controller';
import { DiagnosticsService } from './diagnostics.service';

@Module({
  controllers: [DiagnosticsController],
  providers: [DiagnosticsService, OracleService]
})
export class DiagnosticsModule {}
