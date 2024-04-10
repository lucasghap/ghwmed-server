import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prima.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService){}

  async create({ name, cpf, email, password }: CreateUserDto) {
    const emailAlreadyExists = await this.prisma.user.findUnique({
      where: {
        email
      }
    })

    if (emailAlreadyExists) throw new ConflictException('Este e-mail já está em uso')

    await this.prisma.user.create({
      data: {
        name,
        cpf,
        email,
        password
      }
    })
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id
      }
    })

    if (!user) throw new NotFoundException('Usuário não encontrado')

    const { password, ...rest } = user

    return rest
  }

  async update(id: string, { name, email, cpf }: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id
      }
    })

    if (!user) throw new NotFoundException('Usuário não encontrado')

    await this.prisma.user.update({
      data: {
        name,
        email,
        cpf
      },
      where: {
        id
      }
    })
  }
}
