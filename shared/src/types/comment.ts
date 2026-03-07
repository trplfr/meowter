import { type IUser } from './user'

export interface IComment {
  id: string
  meowId: string
  author: IUser
  content: string
  parentId: string | null
  createdAt: string
}
