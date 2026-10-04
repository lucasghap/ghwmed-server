import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import * as dotenv from 'dotenv'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from 'src/prima.service'
import { USER_STATUSES } from '../roles'

dotenv.config()

@Injectable()
export class JwtStrategyService extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    })

    if (!user || user.status === USER_STATUSES.INACTIVE) {
      throw new UnauthorizedException('Unathorized')
    }

    return {
      ...payload,
      role: user.role,
      email: user.email,
    }
  }
}
