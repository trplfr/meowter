import { createEvent, createStore } from 'effector'

import { type Meow, type MeowPreview } from '@shared/types'

import { type MeowLikeChanged, type RemeowChanged } from '../types'

export const $meows = createStore<Meow[]>([])
export const $cursor = createStore<string | null>(null)
export const $hasMore = createStore(true)
export const $currentTag = createStore<string | null>(null)

export const feedLoadMore = createEvent()
export const meowCreated = createEvent<Meow>()
export const meowLikeToggled = createEvent<string>()
export const meowDeleted = createEvent<string>()
export const remeowToggled = createEvent<string>()

/* Global events: cross-page sync */

export const meowLikeChanged = createEvent<MeowLikeChanged>()
export const followChanged = createEvent<{ delta: number }>()
export const meowDeletedGlobal = createEvent<string>()
export const remeowChanged = createEvent<RemeowChanged>()
export const replyInitiated = createEvent<MeowPreview>()
