import { createEvent, createStore } from 'effector'

import { type MeowPreview } from '@shared/types'

export const $text = createStore('')
export const $hasTildes = $text.map(text => /~\S+/.test(text))
export const $image = createStore<File | null>(null)
export const $imagePreview = createStore<string | null>(null)
export const $replyToMeow = createStore<MeowPreview | null>(null)

export const textChanged = createEvent<string>()
export const imageSelected = createEvent<File>()
export const imageRemoved = createEvent()
export const submitted = createEvent()
export const formReset = createEvent()
export const replyToSet = createEvent<MeowPreview>()
export const replyToCleared = createEvent()
