import { type CatProfile, type Meow } from '@shared/types'

export type { CatProfile }

export interface CatProfileState {
  profile: CatProfile | null
  meows: Meow[]
  cursor: string | null
  hasMore: boolean
}

export interface FetchMeowsParams {
  username: string
  cursor?: string
}

export interface ToggleFollowParams {
  username: string
  isFollowing: boolean
}

export interface ToggleLikeParams {
  meowId: string
  isLiked: boolean
}

export interface ToggleLikeResult {
  meowId: string
  isLiked: boolean
}
