import { createEvent, createStore } from 'effector'

import { type Meow } from '@shared/types'

export const $tags = createStore<string[]>([])
export const $query = createStore('')
export const $selectedTag = createStore<string | null>(null)
export const $meows = createStore<Meow[]>([])
export const $cursor = createStore<string | null>(null)
export const $hasMore = createStore(false)
export const $isOpen = createStore(false)
export const $tagsLoaded = createStore(false)

export const searchPageOpened = createEvent()
export const queryChanged = createEvent<string>()
export const tagSelected = createEvent<string>()
export const searchTriggered = createEvent<string>()
export const cleared = createEvent()
export const loadMore = createEvent()
export const meowLikeToggled = createEvent<string>()
export const dropdownOpened = createEvent()
export const dropdownClosed = createEvent()
