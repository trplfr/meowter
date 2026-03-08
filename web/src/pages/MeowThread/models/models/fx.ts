import { createEffect } from 'effector'

import { type MeowResponse, type CommentsResponse, type CommentResponse } from '@logic/api/meows'
import { type ToggleLikeParams, type ToggleLikeResult } from '@logic/feed'

import { type FetchCommentsParams, type CreateCommentParams, type ToggleCommentLikeParams, type ToggleCommentLikeResult } from '../types'

export const fetchMeowFx = createEffect<string, MeowResponse>()
export const fetchCommentsFx = createEffect<FetchCommentsParams, CommentsResponse>()
export const toggleLikeFx = createEffect<ToggleLikeParams, ToggleLikeResult>()
export const createCommentFx = createEffect<CreateCommentParams, CommentResponse>()
export const toggleCommentLikeFx = createEffect<ToggleCommentLikeParams, ToggleCommentLikeResult>()
