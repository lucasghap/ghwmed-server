import { Module } from '@nestjs/common';
import { AllergiesModule } from './allergies/allergies.module';
import { AttendancesModule } from './attendances/attendances.module';
import { AuthModule } from './auth/auth.module';
import { DiagnosticsModule } from './diagnostics/diagnostics.module';
import { ExamsImageModule } from './exams-image/exams-image.module';
import { OracleModule } from './oracle/oracle.module';
import { SchedulesModule } from './schedules/schedules.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [OracleModule, SchedulesModule, AttendancesModule, UsersModule, AuthModule, DiagnosticsModule, AllergiesModule, ExamsImageModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
