import { Module } from '@nestjs/common';
import { EmailsService } from 'src/emails/emails.service';
import { PasswordsController } from './passwords.controller';
import { PasswordsService } from './passwords.service';

@Module({
  controllers: [PasswordsController],
  providers: [PasswordsService, EmailsService],
})
export class PasswordsModule {}
