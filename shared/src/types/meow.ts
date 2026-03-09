import { type User } from './user'

export interface MeowTag {
  id: string
  tag: string
  position: number
}

export interface MeowPreview {
  id: string
  content: string
  imageUrl: string | null
  author: User
  createdAt: string
}

export interface Meow {
  id: string
  content: string
  imageUrl: string | null
  tags: MeowTag[]
  author: User
  likesCount: number
  commentsCount: number
  remeowsCount: number
  isLiked: boolean
  isRemeowed: boolean
  myRemeowId: string | null
  isReplied: boolean
  myReplyId: string | null
  replyTo: MeowPreview | null
  remeowOf: MeowPreview | null
  createdAt: string
  updatedAt: string
}
