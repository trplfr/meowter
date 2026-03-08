import { createEvent, createStore } from 'effector'

import { type Notification } from '@shared/types'

export const $notifications = createStore<Notification[]>([])
export const $cursor = createStore<string | null>(null)
export const $hasMore = createStore(true)

export const pageOpened = createEvent()
export const loadMore = createEvent()
