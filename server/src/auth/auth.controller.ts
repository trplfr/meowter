import { Body, Controller, Post, ValidationPipe } from '@nestjs/common'
import { AuthCredentialsDTO } from './dto/auth-credentials.dto'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  signUp(@Body(ValidationPipe) authCredentialsDTO: AuthCredentialsDTO) {
    return this.authService.signUp(authCredentialsDTO)
  }

  @Post('/login')
  signIn(@Body(ValidationPipe) authCredentialsDTO: AuthCredentialsDTO) {
    return this.authService.signIn(authCredentialsDTO)
  }
}
