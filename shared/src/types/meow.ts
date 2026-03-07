import { type User } from './user'

export interface MeowTag {
  id: string
  tag: string
  position: number
}

export interface Meow {
  id: string
  content: string
  tags: MeowTag[]
  author: User
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}
