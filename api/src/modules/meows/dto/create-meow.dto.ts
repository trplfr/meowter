import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength } from 'class-validator'
import { Transform } from 'class-transformer'

import { MEOW_CONTENT_MAX } from '@shared/constants'

import { stripHtml } from '../../../common/lib'

export class CreateMeowDto {
  @ApiProperty({
    example: 'All kinds of ~techno with some pop music in between.'
  })
  @IsString()
  @MaxLength(MEOW_CONTENT_MAX)
  @Transform(({ value }) => typeof value === 'string' ? stripHtml(value) : value)
  content!: string
}
