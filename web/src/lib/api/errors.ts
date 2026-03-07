import { t } from '@lingui/core/macro'

import { ErrorCode } from '@shared/types'

export const errorMessages: Record<ErrorCode, () => string> = {
  [ErrorCode.EMAIL_TAKEN]: () => t`Эта почта уже занята`,
  [ErrorCode.USERNAME_TAKEN]: () => t`Это имя уже занято`,
  [ErrorCode.INVALID_CREDENTIALS]: () => t`Неверная почта или пароль`,
  [ErrorCode.REFRESH_TOKEN_INVALID]: () => t`Сессия истекла, войдите снова`,
  [ErrorCode.USER_NOT_FOUND]: () => t`Пользователь не найден`,
  [ErrorCode.FILE_NOT_PROVIDED]: () => t`Файл не выбран`,
  [ErrorCode.FILE_INVALID_TYPE]: () => t`Допустимы только PNG, JPEG и WebP`,
  [ErrorCode.FILE_TOO_LARGE]: () => t`Файл слишком большой (макс. 5 МБ)`,
  [ErrorCode.UNAUTHORIZED]: () => t`Необходимо авторизоваться`,
  [ErrorCode.VALIDATION_ERROR]: () => t`Проверьте введенные данные`,
  [ErrorCode.INTERNAL_ERROR]: () => t`Что-то пошло не так`
}

export const getErrorMessage = (code: string): string => {
  const fn = errorMessages[code as ErrorCode]
  return fn ? fn() : errorMessages[ErrorCode.INTERNAL_ERROR]()
}
