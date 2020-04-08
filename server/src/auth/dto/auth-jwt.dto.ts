import { ApiProperty } from '@nestjs/swagger'
import { IsJWT } from 'class-validator'

export class AuthJWTDTO {
  @ApiProperty()
  @IsJWT()
  refreshToken: string
}
