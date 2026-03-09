import { createQuery, createMutation } from '@farfetched/core'

import { getFeed, likeMeow, unlikeMeow, deleteMeow, remeowMeow, undoRemeowMeow } from '@logic/api/meows'

import { type FetchFeedParams, type ToggleLikeParams, type ToggleLikeResult } from '../types'

export const feedQuery = createQuery({
  handler: (params: FetchFeedParams) => getFeed(params.cursor, params.tag)
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

export const deleteMeowMutation = createMutation({
  handler: (meowId: string) => deleteMeow(meowId)
})

export const remeowMutation = createMutation({
  handler: (meowId: string) => remeowMeow(meowId)
})

export const undoRemeowMutation = createMutation({
  handler: (meowId: string) => undoRemeowMeow(meowId)
})
