import { createStore } from 'effector'
import { createMutation } from '@farfetched/core'

import { verifyEmail } from '@logic/api'

import { type VerifyStatus } from '../types'

export const $status = createStore<VerifyStatus>('pending')

export const verifyMutation = createMutation({
  handler: (token: string) => verifyEmail(token)
})
