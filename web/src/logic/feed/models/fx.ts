import { createEffect } from 'effector'

import { type FeedResponse } from '@logic/api/meows'

import { type FetchFeedParams, type ToggleLikeParams, type ToggleLikeResult } from '../types'

export const fetchFeedFx = createEffect<FetchFeedParams, FeedResponse>()
export const toggleLikeFx = createEffect<ToggleLikeParams, ToggleLikeResult>()
