import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsIn, MaxLength } from 'class-validator'
import { Transform } from 'class-transformer'

import { stripHtml } from '../../../common/lib'

const sanitize = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? stripHtml(value) : value

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Мурзик Барсикович' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(sanitize)
  displayName?: string | null

  @ApiPropertyOptional({ example: 'Сергей' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(sanitize)
  firstName?: string | null

  @ApiPropertyOptional({ example: 'Сурганов' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(sanitize)
  lastName?: string | null

  @ApiPropertyOptional({ example: 'Designer at @notion' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  @Transform(sanitize)
  bio?: string | null

  @ApiPropertyOptional({ example: 'hello@meowter.app' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(sanitize)
  contacts?: string | null

  @ApiPropertyOptional({ example: 'MALE', enum: ['MALE', 'FEMALE'] })
  @IsOptional()
  @IsString()
  @IsIn(['MALE', 'FEMALE'])
  sex?: string | null
}
