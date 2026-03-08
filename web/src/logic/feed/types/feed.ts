import { type Meow } from '@shared/types'

export interface FeedState {
  meows: Meow[]
  cursor: string | null
  hasMore: boolean
}

export interface FetchFeedParams {
  cursor?: string
  tag?: string
}

export interface ToggleLikeParams {
  meowId: string
  isLiked: boolean
}

export interface ToggleLikeResult {
  meowId: string
  isLiked: boolean
}

export interface MeowLikeChanged {
  meowId: string
  isLiked: boolean
  likesCount: number
}
