import { type ErrorCode } from './error'

export interface PaginatedResponse<T> {
  data: T[]
  cursor: string | null
  hasMore: boolean
}

export interface ApiErrorResponse {
  statusCode: number
  code: ErrorCode
  message: string
}
