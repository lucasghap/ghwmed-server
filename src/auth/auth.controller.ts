import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateAuthDto } from './dto/create-auth.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() credentials: CreateAuthDto) {
    return this.authService.create(credentials)
  }
}
