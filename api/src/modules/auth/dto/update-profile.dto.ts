import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsIn, MaxLength } from 'class-validator'

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Мурзик Барсикович' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string | null

  @ApiPropertyOptional({ example: 'Сергей' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string | null

  @ApiPropertyOptional({ example: 'Сурганов' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string | null

  @ApiPropertyOptional({ example: 'Designer at @notion' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  bio?: string | null

  @ApiPropertyOptional({ example: 'hello@meowter.app' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contacts?: string | null

  @ApiPropertyOptional({ example: 'MALE', enum: ['MALE', 'FEMALE'] })
  @IsOptional()
  @IsString()
  @IsIn(['MALE', 'FEMALE'])
  sex?: string | null
}
