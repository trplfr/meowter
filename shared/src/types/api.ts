export interface PaginatedResponse<T> {
  data: T[]
  cursor: string | null
  hasMore: boolean
}

export interface ApiError {
  statusCode: number
  message: string
  error: string
}
