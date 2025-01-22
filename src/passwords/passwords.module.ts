import { Module } from '@nestjs/common';
import { EmailsService } from 'src/emails/emails.service';
import { PrismaService } from 'src/prima.service';
import { PasswordsController } from './passwords.controller';
import { PasswordsService } from './passwords.service';

@Module({
  controllers: [PasswordsController],
  providers: [PasswordsService, EmailsService, PrismaService],
})
export class PasswordsModule {}
