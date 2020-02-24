import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'

import { UserRepository } from './user.repository'
import { AuthCredentialsDTO } from './dto/auth-credentials.dto'
import { JwtPayload } from './jwt-payload.interface'

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService')

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService
  ) {}

  async signUp(authCredentialsDTO: AuthCredentialsDTO): Promise<void> {
    return this.userRepository.signUp(authCredentialsDTO)
  }

  async signIn(
    authCredentialsDTO: AuthCredentialsDTO
  ): Promise<{ accessToken: string }> {
    const login = await this.userRepository.validateUserPassword(
      authCredentialsDTO
    )

    if (!login) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const payload: JwtPayload = { login }
    const accessToken = await this.jwtService.sign(payload)

    this.logger.debug(
      `JWT Token generated with payload ${JSON.stringify(payload)}`
    )

    return { accessToken }
  }
}
