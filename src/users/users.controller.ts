import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from 'src/auth/jwt/current-user';
import { JwtGuard } from 'src/auth/jwt/jwt-guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() { name, cpf, email, password }: CreateUserDto) {
    return this.usersService.create({
      name,
      cpf,
      email,
      password
    });
  }

  @Get('/me')
  @UseGuards(JwtGuard)
  findMe(@CurrentUser() user: AuthUser) {
    return this.usersService.findById(user.id)
  }

  @Put()
  @UseGuards(JwtGuard)
  update(@CurrentUser() user: AuthUser, { name, cpf, email }: UpdateUserDto) {
    return this.usersService.update(user.id, {
      name,
      cpf,
      email
    })
  }
}
