import { api } from '@lib/api'

import {
  type CreateMeowRequest,
  type MeowResponse,
  type FeedResponse,
  type CreateCommentRequest,
  type CommentResponse,
  type CommentsResponse
} from './types'

export const createMeow = (params: CreateMeowRequest) => {
  const formData = new FormData()
  formData.append('content', params.content)

  if (params.image) {
    formData.append('image', params.image)
  }

  return api.post('meows', { body: formData }).json<MeowResponse>()
}

export const getFeed = (cursor?: string, tag?: string) => {
  const searchParams: Record<string, string> = {}

  if (cursor) {
    searchParams.cursor = cursor
  }

  if (tag) {
    searchParams.tag = tag
  }

  return api.get('meows/feed', { searchParams }).json<FeedResponse>()
}

export const getUserTags = () =>
  api.get('meows/tags').json<string[]>()

export const getMeow = (id: string) =>
  api.get(`meows/${id}`).json<MeowResponse>()

export const likeMeow = (id: string) =>
  api.post(`meows/${id}/like`).json<{ ok: boolean }>()

export const unlikeMeow = (id: string) =>
  api.delete(`meows/${id}/like`).json<{ ok: boolean }>()

export const getComments = (meowId: string, cursor?: string) => {
  const searchParams: Record<string, string> = {}

  if (cursor) {
    searchParams.cursor = cursor
  }

  return api.get(`meows/${meowId}/comments`, { searchParams }).json<CommentsResponse>()
}

export const createComment = (meowId: string, params: CreateCommentRequest) =>
  api.post(`meows/${meowId}/comments`, { json: params }).json<CommentResponse>()

export const likeComment = (commentId: string) =>
  api.post(`meows/comments/${commentId}/like`).json<{ ok: boolean }>()

export const unlikeComment = (commentId: string) =>
  api.delete(`meows/comments/${commentId}/like`).json<{ ok: boolean }>()
