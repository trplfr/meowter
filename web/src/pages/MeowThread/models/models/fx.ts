import { createQuery, createMutation } from '@farfetched/core'

import {
  getMeow,
  getComments,
  likeMeow,
  unlikeMeow,
  deleteMeow,
  createComment,
  deleteComment,
  likeComment,
  unlikeComment
} from '@logic/api/meows'
import { type ToggleLikeParams, type ToggleLikeResult } from '@logic/feed'

import {
  type FetchCommentsParams,
  type CreateCommentParams,
  type ToggleCommentLikeParams,
  type ToggleCommentLikeResult
} from '../types'

export const meowQuery = createQuery({
  handler: (id: string) => getMeow(id)
})

export const commentsQuery = createQuery({
  handler: (params: FetchCommentsParams) =>
    getComments(params.meowId, params.cursor)
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

export const createCommentMutation = createMutation({
  handler: ({ meowId, content }: CreateCommentParams) =>
    createComment(meowId, { content })
})

export const deleteMeowMutation = createMutation({
  handler: (meowId: string) => deleteMeow(meowId)
})

export const deleteCommentMutation = createMutation({
  handler: (commentId: string) => deleteComment(commentId)
})

export const toggleCommentLikeMutation = createMutation({
  handler: async ({
    commentId,
    isLiked
  }: ToggleCommentLikeParams): Promise<ToggleCommentLikeResult> => {
    if (isLiked) {
      await unlikeComment(commentId)
      return { commentId, isLiked: false }
    }

    await likeComment(commentId)
    return { commentId, isLiked: true }
  }
})
