import { type User } from './user'

export interface Comment {
  id: string
  meowId: string
  author: User
  content: string
  parentId: string | null
  isLiked: boolean
  likesCount: number
  createdAt: string
}
