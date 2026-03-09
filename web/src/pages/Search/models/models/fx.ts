import { createQuery, createMutation } from '@farfetched/core'

import { getFeed, getUserTags, likeMeow, unlikeMeow } from '@logic/api/meows'
import { type ToggleLikeParams, type ToggleLikeResult } from '@logic/feed'

import { type FetchSearchParams } from '../types'

export const tagsQuery = createQuery({
  handler: () => getUserTags()
})

export const searchQuery = createQuery({
  handler: (params: FetchSearchParams) =>
    getFeed(params.cursor, params.tag, 'popular')
})

export const toggleLikeMutation = createMutation({
  handler: async ({
    meowId,
    isLiked
  }: ToggleLikeParams): Promise<ToggleLikeResult> => {
    if (isLiked) {
      await unlikeMeow(meowId)
      return { meowId, isLiked: false }
    }

    await likeMeow(meowId)
    return { meowId, isLiked: true }
  }
})
