import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength } from 'class-validator'

import { COMMENT_CONTENT_MAX } from '@shared/constants'

export class CreateCommentDto {
  @ApiProperty({ example: 'Great meow!' })
  @IsString()
  @MaxLength(COMMENT_CONTENT_MAX)
  content!: string
}
