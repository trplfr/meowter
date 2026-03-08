import { createEvent, createStore } from 'effector'

import { type Meow } from '@shared/types'

import { type FeedResponse } from '@logic/api/meows'

import { type MeowLikeChanged } from '../types'

export const $meows = createStore<Meow[]>([])
export const $cursor = createStore<string | null>(null)
export const $hasMore = createStore(true)
export const $currentTag = createStore<string | null>(null)

export const feedLoaded = createEvent()
export const feedLoadMore = createEvent()
export const meowCreated = createEvent<Meow>()
export const meowLikeToggled = createEvent<string>()
export const feedPageReceived = createEvent<FeedResponse>()

/* Global events: cross-page sync */

export const meowLikeChanged = createEvent<MeowLikeChanged>()
export const followChanged = createEvent<{ delta: number }>()
