import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateAuthDto } from './dto/create-auth.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() { cpf, password, providerId }: CreateAuthDto) {
    return this.authService.create({ cpf, password, providerId })
  }
}
