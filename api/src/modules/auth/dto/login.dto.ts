import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({ example: 'whiskers@meowter.app' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'MyStr0ngP@ss' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string
}
