import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import type { FastifyRequest } from 'fastify'

import type { JwtPayload } from '../../common/decorators'

const cookieExtractor = (req: FastifyRequest): string | null => {
  return req.cookies?.access_token ?? null
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: config.getOrThrow('JWT_SECRET')
    })
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload
  }
}
