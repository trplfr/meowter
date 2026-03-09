import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength } from 'class-validator'

import { MEOW_CONTENT_MAX } from '@shared/constants'

export class CreateMeowDto {
  @ApiProperty({
    example: 'All kinds of ~techno with some pop music in between.'
  })
  @IsString()
  @MaxLength(MEOW_CONTENT_MAX)
  content!: string
}
