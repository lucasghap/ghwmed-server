import { Module } from '@nestjs/common';
import { AttendancesModule } from './attendances/attendances.module';
import { AuthModule } from './auth/auth.module';
import { OracleModule } from './oracle/oracle.module';
import { SchedulesModule } from './schedules/schedules.module';
import { UsersModule } from './users/users.module';
import { DiagnosticsModule } from './diagnostics/diagnostics.module';

@Module({
  imports: [OracleModule, SchedulesModule, AttendancesModule, UsersModule, AuthModule, DiagnosticsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
