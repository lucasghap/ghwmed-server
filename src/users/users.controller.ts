import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AuthUser, CurrentUser } from 'src/auth/jwt/current-user';
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
  findMe(@CurrentUser() user: AuthUser) {
    return this.usersService.findById(user.id)
  }

  @Put('/:id')
  update(@Param('id') id: string, { name, cpf, email }: UpdateUserDto) {
    return this.usersService.update(id, {
      name,
      cpf,
      email
    })
  }
}
