export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  REMEOW = 'REMEOW'
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  actorId: string
  meowId: string | null
  read: boolean
  createdAt: string
}
