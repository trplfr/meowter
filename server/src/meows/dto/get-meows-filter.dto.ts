import { IsNotEmpty, IsOptional } from 'class-validator'

export class GetMeowsFilterDTO {
  @IsNotEmpty()
  @IsOptional()
  search: string
}
