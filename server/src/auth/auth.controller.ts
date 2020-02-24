import { Body, Controller, Post, ValidationPipe } from '@nestjs/common'

import { AuthService } from './auth.service'
import { AuthCredentialsDTO } from './dto/auth-credentials.dto'

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
}
