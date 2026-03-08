import { type Meow, type Comment } from '@shared/types'

export interface MeowThreadState {
  meow: Meow | null
  comments: Comment[]
  cursor: string | null
  hasMore: boolean
}

export interface FetchCommentsParams {
  meowId: string
  cursor?: string
}

export interface CreateCommentParams {
  meowId: string
  content: string
}

export interface ToggleCommentLikeParams {
  commentId: string
  isLiked: boolean
}

export interface ToggleCommentLikeResult {
  commentId: string
  isLiked: boolean
}
