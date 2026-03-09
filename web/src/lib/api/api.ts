import ky, { HTTPError } from 'ky'

import { type ApiErrorResponse, ErrorCode } from '@shared/types'

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly status: number,
    message: string
  ) {
    super(message)
  }
}

// колбек для глобальной обработки ошибок (устанавливается из клиентского entry)
let onApiError: ((error: AppError) => void) | null = null

export const setApiErrorHandler = (handler: (error: AppError) => void) => {
  onApiError = handler
}

// провайдер кук для SSR (устанавливается из серверного entry через AsyncLocalStorage)
let ssrCookieProvider: (() => string) | null = null

export const setSsrCookieProvider = (provider: () => string) => {
  ssrCookieProvider = provider
}

const parseError = async (error: unknown): Promise<never> => {
  let appError: AppError

  if (error instanceof HTTPError) {
    const body = (await error.response
      .json()
      .catch(() => ({}))) as Partial<ApiErrorResponse>

    appError = new AppError(
      body.code || ErrorCode.INTERNAL_ERROR,
      error.response.status,
      body.message || 'Unknown error'
    )
  } else {
    appError = new AppError(ErrorCode.INTERNAL_ERROR, 0, 'Network error')
  }

  // 401 не показываем — обрабатывается refresh логикой
  if (appError.status !== 401 && onApiError) {
    onApiError(appError)
  }

  throw appError
}

const ssrApiUrl = process.env.SSR_API_URL || 'http://localhost:4000/api'

export const api = ky.create({
  prefixUrl:
    typeof window !== 'undefined' ? '/api' : ssrApiUrl,
  credentials: 'include',
  retry: 0,
  hooks: {
    beforeRequest: [
      request => {
        if (typeof window === 'undefined' && ssrCookieProvider) {
          const cookie = ssrCookieProvider()
          if (cookie) {
            request.headers.set('cookie', cookie)
          }
        }
      }
    ],
    beforeError: [
      async error => {
        await parseError(error)
        return error
      }
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status !== 401) {
          return response
        }

        // на сервере refresh невозможен (куки httpOnly не пробрасываются)
        if (typeof window === 'undefined') {
          return response
        }

        // не пытаемся рефрешить сам рефреш, логин и auth/me
        if (
          request.url.includes('auth/refresh') ||
          request.url.includes('auth/login') ||
          request.url.includes('auth/me')
        ) {
          return response
        }

        const refreshed = await ky.post('auth/refresh', {
          prefixUrl: '/api',
          credentials: 'include',
          throwHttpErrors: false
        })

        if (refreshed.ok) {
          return ky(request, options)
        }

        return response
      }
    ]
  }
})
