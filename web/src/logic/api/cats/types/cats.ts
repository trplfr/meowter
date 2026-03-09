import {
  type CatProfile,
  type Meow,
  type PaginatedResponse
} from '@shared/types'

export type CatProfileResponse = CatProfile

export type CatMeowsResponse = PaginatedResponse<Meow>
