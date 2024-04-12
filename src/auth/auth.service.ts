import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { OracleService } from 'src/oracle/oracle.service'
import { PrismaService } from 'src/prima.service'
import { CreateAuthDto } from './dto/create-auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private oracle: OracleService,
    private prisma: PrismaService, 
    private jwtService: JwtService
  ) {}

  async create({ cpf, password, providerId }: CreateAuthDto) {
    if (providerId) {
      const provider = await this.oracle.query(`
        SELECT
          cd_prestador "id",
          nr_cpf_cgc "cpf",
          nm_prestador "name"
        FROM prestador 
        WHERE prestador.cd_prestador = 238
      `)
      
      console.log(provider)

      return
    }

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
