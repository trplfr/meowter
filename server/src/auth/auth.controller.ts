import { Body, Controller, Post, Put, ValidationPipe } from '@nestjs/common'

import { AuthService } from './auth.service'
import { AuthCredentialsDTO } from './dto/auth-credentials.dto'
import { AuthJWTDTO } from './dto/auth-jwt.dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  signUp(
    @Body(ValidationPipe) authCredentialsDTO: AuthCredentialsDTO
  ): Promise<void> {
    return this.authService.signUp(authCredentialsDTO)
  }

  @Post('/login')
  signIn(
    @Body(ValidationPipe) authCredentialsDTO: AuthCredentialsDTO
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDTO)
  }

  @Put('/refresh')
  refreshToken(
    @Body(ValidationPipe) authJWTDTO: AuthJWTDTO
  ): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(authJWTDTO)
  }
}
