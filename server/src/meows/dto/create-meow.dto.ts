import { IsNotEmpty } from 'class-validator'

export class CreateMeowDTO {
  @IsNotEmpty()
  content: string
}
