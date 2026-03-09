import { api } from '@lib/api'

import { type CatProfileResponse, type CatMeowsResponse } from './types'

export const getCatProfile = (username: string) =>
  api.get(`cats/${username}`).json<CatProfileResponse>()

export const getCatMeows = (username: string, cursor?: string) => {
  const searchParams: Record<string, string> = {}

  if (cursor) {
    searchParams.cursor = cursor
  }

  return api
    .get(`cats/${username}/meows`, { searchParams })
    .json<CatMeowsResponse>()
}

export const followCat = (username: string) =>
  api.post(`cats/${username}/follow`).json<{ ok: boolean }>()

export const unfollowCat = (username: string) =>
  api.delete(`cats/${username}/follow`).json<{ ok: boolean }>()
