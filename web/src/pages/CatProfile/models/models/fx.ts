import { createQuery, createMutation } from '@farfetched/core'

import { getCatProfile, getCatMeows, followCat, unfollowCat } from '@logic/api/cats'
import { likeMeow, unlikeMeow } from '@logic/api/meows'

import { type FetchMeowsParams, type ToggleFollowParams, type ToggleLikeParams, type ToggleLikeResult } from '../types'

export const profileQuery = createQuery({
  handler: (username: string) => getCatProfile(username)
})

export const catMeowsQuery = createQuery({
  handler: (params: FetchMeowsParams) => getCatMeows(params.username, params.cursor)
})

export const toggleFollowMutation = createMutation({
  handler: async ({ username, isFollowing }: ToggleFollowParams): Promise<boolean> => {
    if (isFollowing) {
      await unfollowCat(username)
      return false
    }

    await followCat(username)
    return true
  }
})

export const toggleLikeMutation = createMutation({
  handler: async ({ meowId, isLiked }: ToggleLikeParams): Promise<ToggleLikeResult> => {
    if (isLiked) {
      await unlikeMeow(meowId)
      return { meowId, isLiked: false }
    }

    await likeMeow(meowId)
    return { meowId, isLiked: true }
  }
})
