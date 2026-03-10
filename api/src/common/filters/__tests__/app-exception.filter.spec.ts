import { describe, it, expect, vi } from 'vitest'
import { HttpException } from '@nestjs/common'

import { ErrorCode } from '@shared/types'

import { AppException } from '../../exceptions'
import { AppExceptionFilter } from '../app-exception.filter'

const createMockHost = () => {
  const send = vi.fn()
  const status = vi.fn().mockReturnValue({ send })
  const res = { status, send }

  return {
    host: {
      switchToHttp: () => ({
        getResponse: () => res
      })
    } as any,
    res,
    status,
    send
  }
}

describe('AppExceptionFilter', () => {
  const filter = new AppExceptionFilter()

  it('обрабатывает AppException', () => {
    const { host, status, send } = createMockHost()

    filter.catch(
      new AppException(ErrorCode.MEOW_NOT_FOUND, 404, 'Meow not found'),
      host
    )

    expect(status).toHaveBeenCalledWith(404)
    expect(send).toHaveBeenCalledWith({
      statusCode: 404,
      code: ErrorCode.MEOW_NOT_FOUND,
      message: 'Meow not found'
    })
  })

  it('маппит 401 HttpException в UNAUTHORIZED', () => {
    const { host, status, send } = createMockHost()

    filter.catch(new HttpException('Unauthorized', 401), host)

    expect(status).toHaveBeenCalledWith(401)
    expect(send).toHaveBeenCalledWith({
      statusCode: 401,
      code: ErrorCode.UNAUTHORIZED,
      message: 'Unauthorized'
    })
  })

  it('маппит 429 HttpException в RATE_LIMIT_EXCEEDED', () => {
    const { host, status, send } = createMockHost()

    filter.catch(
      new HttpException('ThrottlerException: Too Many Requests', 429),
      host
    )

    expect(status).toHaveBeenCalledWith(429)
    expect(send).toHaveBeenCalledWith({
      statusCode: 429,
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'ThrottlerException: Too Many Requests'
    })
  })

  it('маппит 400 HttpException в VALIDATION_ERROR', () => {
    const { host, status, send } = createMockHost()

    filter.catch(new HttpException('Bad Request', 400), host)

    expect(status).toHaveBeenCalledWith(400)
    expect(send).toHaveBeenCalledWith({
      statusCode: 400,
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Bad Request'
    })
  })

  it('обрабатывает массив сообщений (class-validator)', () => {
    const { host, send } = createMockHost()

    filter.catch(
      new HttpException(
        { statusCode: 400, message: ['field must not be empty', 'field2 error'] },
        400
      ),
      host
    )

    // берет первое сообщение из массива
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'field must not be empty' })
    )
  })

  it('обрабатывает неизвестные ошибки как 500 INTERNAL_ERROR', () => {
    const { host, status, send } = createMockHost()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    filter.catch(new Error('something broke'), host)

    expect(status).toHaveBeenCalledWith(500)
    expect(send).toHaveBeenCalledWith({
      statusCode: 500,
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Internal server error'
    })

    consoleSpy.mockRestore()
  })
})
