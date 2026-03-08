import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength, MaxLength } from 'class-validator'

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldP@ss123' })
  @IsString()
  oldPassword!: string

  @ApiProperty({ example: 'NewP@ss456' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  newPassword!: string
}
