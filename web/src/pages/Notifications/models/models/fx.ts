import { createEffect } from 'effector'

import { type NotificationsResponse } from '@logic/api/notifications'

import { type FetchNotificationsParams } from '../types'

export const fetchNotificationsFx = createEffect<FetchNotificationsParams, NotificationsResponse>()
export const markAllReadFx = createEffect<void, { ok: boolean }>()
