import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength } from 'class-validator'
import { Transform } from 'class-transformer'

import { COMMENT_CONTENT_MAX } from '@shared/constants'

import { stripHtml } from '../../../common/lib'

export class CreateCommentDto {
  @ApiProperty({ example: 'Great meow!' })
  @IsString()
  @MaxLength(COMMENT_CONTENT_MAX)
  @Transform(({ value }) => typeof value === 'string' ? stripHtml(value) : value)
  content!: string
}
