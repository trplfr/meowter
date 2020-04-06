import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'

import { UserRepository } from '../users/user.repository'
import { AuthCredentialsDTO } from './dto/auth-credentials.dto'
import { JwtPayload } from './jwt-payload.interface'
import { AuthJWTDTO } from './dto/auth-jwt.dto'

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

  async refreshToken(authJWTDTO: AuthJWTDTO): Promise<{ accessToken: string }> {
    const { refreshToken } = authJWTDTO

    try {
      const decodedToken = await this.jwtService.verify(refreshToken)
      const payload = { login: decodedToken.login }

      const accessToken = await this.jwtService.sign(payload)

      this.logger.debug(
        `JWT Token refreshed with payload ${JSON.stringify(payload)}`
      )

      return { accessToken }
    } catch (error) {
      throw new UnauthorizedException(`Token expired`)
    }
  }
}
