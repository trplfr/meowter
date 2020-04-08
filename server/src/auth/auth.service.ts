import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'

import { UserRepository } from '../users/user.repository'

import {
  LoginCredentialsDTO,
  RegisterCredentialsDTO
} from './dto/auth-credentials.dto'
import { JwtPayload } from './interfaces/jwt-payload.interface'
import { AuthJWTDTO } from './dto/auth-jwt.dto'

import { ISignIn } from './interfaces/auth-service.interface'

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService')

  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService
  ) {}

  async signUp(authCredentialsDTO: RegisterCredentialsDTO): Promise<void> {
    return this.userRepository.signUp(authCredentialsDTO)
  }

  async signIn(authCredentialsDTO: LoginCredentialsDTO): Promise<ISignIn> {
    const login = await this.userRepository.validateUserPassword(
      authCredentialsDTO
    )

    const currentUser = await this.userRepository.getCurrentUser(login)

    if (!login) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const payload: JwtPayload = { login }
    const accessToken = await this.jwtService.sign(payload)

    this.logger.debug(
      `JWT Token generated with payload ${JSON.stringify(payload)}`
    )

    return { currentUser, accessToken }
  }

  async refreshToken(authJWTDTO: AuthJWTDTO): Promise<{ accessToken: string }> {
    const { refreshToken } = authJWTDTO

    try {
      const decodedToken = await this.jwtService.verify(refreshToken)
      const payload = { username: decodedToken.username }

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
