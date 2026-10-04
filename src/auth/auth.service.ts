import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { OracleService } from 'src/oracle/oracle.service'
import { PrismaService } from 'src/prima.service'
import { CreateAuthDto } from './dto/create-auth.dto'
import { USER_ROLES, USER_STATUSES } from './roles'

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

  async create({ cpf, email, password, providerId, token }: CreateAuthDto) {
    let providerMv: ProviderMv | null = null

    if (token && token !== process.env.TOKEN_PEP) {
      throw new BadRequestException('Token inválido')
    }

    if (providerId) {
      const results = await this.oracle.query(`
        SELECT
          cd_prestador "id",
          nr_cpf_cgc "cpf",
          nm_prestador "name"
        FROM dbamv.prestador 
        WHERE prestador.cd_prestador = :providerId
        AND prestador.tp_situacao = 'A'
      `, {
        providerId
      })

      providerMv = results[0]

      if (!providerMv) {
        throw new NotFoundException('Prestador não foi encontrado na base do MV ou está inativo')
      }
    }

    const identifierCpf = providerMv?.cpf
      ? providerMv.cpf.padStart(11, '0')
      : cpf || undefined

    const user = identifierCpf
      ? await this.prisma.user.findUnique({
          where: {
            cpf: identifierCpf,
          },
        })
      : email
        ? await this.prisma.user.findUnique({
            where: {
              email,
            },
          })
        : null

    const invalidCredentialsMessage =
      !identifierCpf && email ? 'E-mail ou senha inválidos' : 'CPF ou senha inválidos'

    if (!user)
      throw new UnauthorizedException(invalidCredentialsMessage)

    if (user.status === USER_STATUSES.INACTIVE) {
      throw new UnauthorizedException('Usuário inativo')
    }

    if (providerId && user.role === USER_ROLES.ADMIN) {
      throw new UnauthorizedException('CPF ou senha inválidos')
    }

    if (!providerId) {
      if (!password) {
        throw new UnauthorizedException(invalidCredentialsMessage)
      }

      const passwordMatch = await compare(password, user.password)

      if (!passwordMatch)
        throw new UnauthorizedException(invalidCredentialsMessage)
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = this.jwtService.sign(payload)

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    }
  }
}
