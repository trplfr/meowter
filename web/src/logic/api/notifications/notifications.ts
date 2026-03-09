import { api } from '@lib/api'

import { type NotificationsResponse, type UnreadCountResponse } from './types'

export const getNotifications = (cursor?: string) => {
  const searchParams: Record<string, string> = {}

  if (cursor) {
    searchParams.cursor = cursor
  }

  return api.get('notifications', { searchParams }).json<NotificationsResponse>()
}

export const getUnreadCount = () =>
  api.get('notifications/unread').json<UnreadCountResponse>()

export const markAllRead = () =>
  api.post('notifications/read').json<{ ok: boolean }>()
