import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator'

export class RegisterDto {
  @ApiProperty({ example: 'whiskers' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'username может содержать только буквы, цифры и _' })
  username!: string

  @ApiProperty({ example: 'whiskers@meowter.app' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'MyStr0ngP@ss' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string
}
