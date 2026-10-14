import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { SetFirstPasswordDto } from './dto/set-first-password.dto';
import { PasswordsService } from './passwords.service';

@Controller('passwords')
export class PasswordsController {
  constructor(private readonly passwordsService: PasswordsService) {}

  @Post('/forgot')
  forgotPassword(@Body() createPasswordDto: ForgotPasswordDto) {
    return this.passwordsService.forgotPassword(createPasswordDto);
  }

  @Post('/first-access')
  @UsePipes(ZodValidationPipe)
  setFirstPassword(@Body() setFirstPasswordDto: SetFirstPasswordDto) {
    return this.passwordsService.setFirstPassword(setFirstPasswordDto);
  }
}
