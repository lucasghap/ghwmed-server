import { Module } from '@nestjs/common';
import { OracleModule } from './oracle/oracle.module';
import { SchedulesModule } from './schedules/schedules.module';

@Module({
  imports: [OracleModule, SchedulesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
