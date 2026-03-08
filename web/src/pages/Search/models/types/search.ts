import { type FeedResponse } from '@logic/api/meows'

export interface FetchSearchParams {
  tag: string
  cursor?: string
}

export type FetchSearchResult = FeedResponse
