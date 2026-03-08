import { createEvent, createStore, createEffect } from 'effector'

import { type UnreadCountResponse } from '@logic/api/notifications'

export const $unreadCount = createStore(0)

export const startPolling = createEvent()
export const stopPolling = createEvent()

export const fetchUnreadCountFx = createEffect<void, UnreadCountResponse>()
