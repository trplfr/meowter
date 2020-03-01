import { IsString, IsJWT } from 'class-validator'

export class AuthJWTDTO {
  @IsString()
  @IsJWT()
  refreshToken: string
}
