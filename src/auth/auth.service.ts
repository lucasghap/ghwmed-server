import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { PrismaService } from 'src/prima.service'
import { CreateAuthDto } from './dto/create-auth.dto'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async create({ cpf, password }: CreateAuthDto) {
    const cpfExists = await this.prisma.user.findUnique({
      where: {
        cpf,
      },
    })

    if (!cpfExists)
      throw new UnauthorizedException('CPF ou senha inválidos')

    const passwordMatch = await compare(password, cpfExists.password)

    if (!passwordMatch)
      throw new UnauthorizedException('CPF ou senha inválidos')

    const payload = {
      sub: cpfExists.id,
      email: cpfExists.email,
    }

    const accessToken = this.jwtService.sign(payload)

    const { name } = cpfExists

    return {
      access_token: accessToken,
      user: {
        name
      },
    }
  }
}
