import { createEvent, createStore } from 'effector'

import { type CatProfile, type Meow } from '@shared/types'

export const $profile = createStore<CatProfile | null>(null)
export const $meows = createStore<Meow[]>([])
export const $cursor = createStore<string | null>(null)
export const $hasMore = createStore(true)

export const profilePageOpened = createEvent<string>()
export const loadMoreMeows = createEvent()
export const followToggled = createEvent()
export const meowLikeToggled = createEvent<string>()
