import { Module } from '@nestjs/common';
import { OracleService } from './oracle.service';

@Module({
  controllers: [],
  providers: [OracleService]
})
export class OracleModule {}
