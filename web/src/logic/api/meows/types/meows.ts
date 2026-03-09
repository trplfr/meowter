import { type Meow, type Comment, type PaginatedResponse } from '@shared/types'

export interface CreateMeowRequest {
  content: string
  image: File | null
  replyToId?: string
}

export type MeowResponse = Meow

export interface FeedResponse extends PaginatedResponse<Meow> {
  tag: string | null
}

export interface CreateCommentRequest {
  content: string
}

export type CommentResponse = Comment

export type CommentsResponse = PaginatedResponse<Comment>
