import { createEffect } from 'effector'

import { type CatProfileResponse, type CatMeowsResponse } from '@logic/api/cats'

import { type FetchMeowsParams, type ToggleFollowParams, type ToggleLikeParams, type ToggleLikeResult } from '../types'

export const fetchProfileFx = createEffect<string, CatProfileResponse>()
export const fetchMeowsFx = createEffect<FetchMeowsParams, CatMeowsResponse>()
export const toggleFollowFx = createEffect<ToggleFollowParams, boolean>()
export const toggleMeowLikeFx = createEffect<ToggleLikeParams, ToggleLikeResult>()
