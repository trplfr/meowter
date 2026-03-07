export interface IPaginatedResponse<T> {
  data: T[]
  cursor: string | null
  hasMore: boolean
}

export interface IApiError {
  statusCode: number
  message: string
  error: string
}
