import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class AuthCredentialsDTO {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  login: string

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, {
    message: 'Password is too weak'
  })
  password: string
}
