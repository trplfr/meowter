import { IsJWT } from 'class-validator'

export class AuthJWTDTO {
  @IsJWT()
  refreshToken: string
}
