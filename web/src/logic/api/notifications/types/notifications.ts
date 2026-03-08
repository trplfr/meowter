import { type Notification, type PaginatedResponse, type UnreadCount } from '@shared/types'

export type NotificationsResponse = PaginatedResponse<Notification>

export type UnreadCountResponse = UnreadCount
