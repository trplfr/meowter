import { createQuery, createMutation } from '@farfetched/core'

import { getNotifications, markAllRead } from '@logic/api/notifications'

import { type FetchNotificationsParams } from '../types'

export const notificationsQuery = createQuery({
  handler: (params: FetchNotificationsParams) => getNotifications(params.cursor)
})

export const markAllReadMutation = createMutation({
  handler: () => markAllRead()
})
