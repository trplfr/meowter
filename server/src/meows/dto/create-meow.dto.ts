import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateMeowDTO {
  @ApiProperty()
  @IsNotEmpty()
  content: string
}
