import { type IUser } from './user'

export interface IMeowTag {
  id: string
  tag: string
  position: number
}

export interface IMeow {
  id: string
  content: string
  tags: IMeowTag[]
  author: IUser
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: string
  updatedAt: string
}
