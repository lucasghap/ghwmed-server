import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { hash } from 'bcryptjs';
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

    const cpfExists = await this.prisma.user.findUnique({
      where: {
        cpf
      }
    })

    if (cpfExists) throw new ConflictException('Este CPF já está em uso')

    const passwordHash = await hash(password, 8)

    await this.prisma.user.create({
      data: {
        name,
        cpf,
        email,
        password: passwordHash
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
