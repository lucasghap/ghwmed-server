import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';

@Module({
  controllers: [],
  providers: [EmailsService],
})
export class EmailsModule {}
