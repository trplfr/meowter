import { Body, Controller, Post, ValidationPipe } from '@nestjs/common'

import { AuthService } from './auth.service'

import {
  LoginCredentialsDTO,
  RegisterCredentialsDTO
} from './dto/auth-credentials.dto'
import { AuthJWTDTO } from './dto/auth-jwt.dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  signUp(
    @Body(ValidationPipe) authCredentialsDTO: RegisterCredentialsDTO
  ): Promise<void> {
    return this.authService.signUp(authCredentialsDTO)
  }

  @Post('/login')
  signIn(
    @Body(ValidationPipe) authCredentialsDTO: LoginCredentialsDTO
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDTO)
  }

  @Post('/token')
  refreshToken(
    @Body(ValidationPipe) authJWTDTO: AuthJWTDTO
  ): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(authJWTDTO)
  }
}
