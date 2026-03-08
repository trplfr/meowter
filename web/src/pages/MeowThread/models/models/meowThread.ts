import { createEvent, createStore } from 'effector'

import { type Meow, type Comment } from '@shared/types'

export const $meow = createStore<Meow | null>(null)
export const $comments = createStore<Comment[]>([])
export const $cursor = createStore<string | null>(null)
export const $hasMore = createStore(true)

export const $commentText = createStore('')
export const $replyTrigger = createStore(0)

export const threadOpened = createEvent<string>()
export const loadMoreComments = createEvent()
export const meowLikeToggled = createEvent()
export const commentTextChanged = createEvent<string>()
export const commentSubmitted = createEvent()
export const replyClicked = createEvent<string>()
export const commentLikeToggled = createEvent<string>()
