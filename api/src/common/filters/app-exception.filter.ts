import {
  Catch,
  type ExceptionFilter,
  type ArgumentsHost,
  HttpException
} from '@nestjs/common'
import type { FastifyReply } from 'fastify'

import { ErrorCode } from '@shared/types'

import { AppException } from '../exceptions'

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<FastifyReply>()

    if (exception instanceof AppException) {
      res.status(exception.getStatus()).send({
        statusCode: exception.getStatus(),
        code: exception.code,
        message: exception.message
      })
      return
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const response = exception.getResponse()
      const message =
        typeof response === 'string' ? response : (response as any).message

      res.status(status).send({
        statusCode: status,
        code:
          status === 401 ? ErrorCode.UNAUTHORIZED : ErrorCode.VALIDATION_ERROR,
        message: Array.isArray(message) ? message[0] : message
      })
      return
    }

    const errMessage = exception instanceof Error
      ? exception.stack || exception.message
      : String(exception)
    console.error('Unhandled exception:', errMessage)

    res.status(500).send({
      statusCode: 500,
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Internal server error'
    })
  }
}
