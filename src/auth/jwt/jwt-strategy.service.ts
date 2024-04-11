import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import * as dotenv from 'dotenv'
import { ExtractJwt, Strategy } from 'passport-jwt'

dotenv.config()

@Injectable()
export class JwtStrategyService extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload) {
    return payload
  }
}
