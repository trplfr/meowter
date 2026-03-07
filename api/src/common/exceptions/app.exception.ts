import { HttpException } from '@nestjs/common'

import { type ErrorCode } from '@shared/types'

export class AppException extends HttpException {
  constructor(
    public readonly code: ErrorCode,
    statusCode: number,
    message: string
  ) {
    super({ statusCode, code, message }, statusCode)
  }
}
