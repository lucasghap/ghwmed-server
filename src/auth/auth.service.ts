import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { OracleService } from 'src/oracle/oracle.service'
import { PrismaService } from 'src/prima.service'
import { CreateAuthDto } from './dto/create-auth.dto'

interface ProviderMv {
  id: number 
  cpf: string
  name: string
}

@Injectable()
export class AuthService {
  constructor(
    private oracle: OracleService,
    private prisma: PrismaService, 
    private jwtService: JwtService
  ) {}

  async create({ cpf, password, providerId }: CreateAuthDto) {
    let providerMv: ProviderMv | null = null

    if (providerId) {
      const results = await this.oracle.query(`
        SELECT
          cd_prestador "id",
          nr_cpf_cgc "cpf",
          nm_prestador "name"
        FROM prestador 
        WHERE prestador.cd_prestador = 238
        AND prestador.tp_situacao = 'A'
      `)
      
      providerMv = results[0]

      if (!providerMv) {
        throw new NotFoundException('Prestador não foi encontrado na base do MV ou está inativo')
      }
    }

    const cpfExists = await this.prisma.user.findUnique({
      where: {
        cpf: providerMv.cpf ? providerMv.cpf.padStart(11, '0') : cpf,
      },
    })

    if (!cpfExists)
      throw new UnauthorizedException('CPF ou senha inválidos')

    if (!providerId) {
      const passwordMatch = await compare(password, cpfExists.password)

      if (!passwordMatch)
        throw new UnauthorizedException('CPF ou senha inválidos')
    }

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
