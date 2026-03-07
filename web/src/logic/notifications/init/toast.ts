import { sample } from 'effector'

import { AppError } from '@lib/api'
import { getErrorMessage } from '@lib/api'

import { errorOccurred, showErrorToastFx } from '../models'

sample({
  clock: errorOccurred,
  fn: (error) => {
    if (error instanceof AppError) {
      return getErrorMessage(error.code)
    }
    return error.message || 'Что-то пошло не так'
  },
  target: showErrorToastFx
})
