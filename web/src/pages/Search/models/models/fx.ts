import { createEffect } from 'effector'

import { type ToggleLikeParams, type ToggleLikeResult } from '@logic/feed'

import { type FetchSearchParams, type FetchSearchResult } from '../types'

export const fetchTagsFx = createEffect<void, string[]>()
export const fetchSearchFx = createEffect<FetchSearchParams, FetchSearchResult>()
export const toggleLikeFx = createEffect<ToggleLikeParams, ToggleLikeResult>()
