import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'

export class LoginDto {
  @ApiProperty({ example: 'whiskers@meowter.app' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'MyStr0ngP@ss' })
  @IsString()
  password!: string
}
