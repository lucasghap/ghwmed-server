import { Body, Controller, Post } from '@nestjs/common';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { PasswordsService } from './passwords.service';

@Controller('passwords')
export class PasswordsController {
  constructor(private readonly passwordsService: PasswordsService) {}

  @Post('/forgot')
  forgotPassword(@Body() createPasswordDto: ForgotPasswordDto) {
    return this.passwordsService.forgotPassword(createPasswordDto);
  }
}
