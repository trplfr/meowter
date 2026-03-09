import { type User } from './user'
import { type Meow } from './meow'

export enum NotificationType {
  FOLLOW = 'FOLLOW',
  MEOW_LIKE = 'MEOW_LIKE',
  COMMENT_LIKE = 'COMMENT_LIKE',
  REMEOW = 'REMEOW',
  REPLY = 'REPLY',
  MENTION = 'MENTION'
}

export interface CommentPreview {
  id: string
  content: string
}

export interface Notification {
  id: string
  type: NotificationType
  actor: User
  meow: Meow | null
  comment: CommentPreview | null
  read: boolean
  createdAt: string
}

export interface UnreadCount {
  count: number
}
