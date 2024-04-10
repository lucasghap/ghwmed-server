import { Module } from '@nestjs/common';
import { OracleModule } from './oracle/oracle.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AttendancesModule } from './attendances/attendances.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [OracleModule, SchedulesModule, AttendancesModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
