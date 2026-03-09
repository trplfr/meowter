import { createEvent, createStore } from 'effector'

import {
  type LoginRequest,
  type RegisterRequest,
  type RecoveryRequest
} from '@logic/api/auth'

import {
  AuthStep,
  type LoginFieldChange,
  type RegisterFieldChange,
  type RecoveryFieldChange
} from '../types'

/* Login */

export const $loginForm = createStore<LoginRequest>({
  email: '',
  password: ''
})

export const loginFieldChanged = createEvent<LoginFieldChange>()
export const loginSubmitted = createEvent()

/* Register */

export const $registerForm = createStore<RegisterRequest>({
  username: '',
  password: '',
  email: ''
})

export const $registerStep = createStore<AuthStep>(AuthStep.CREDENTIALS)

export const registerFieldChanged = createEvent<RegisterFieldChange>()
export const registerSubmitted = createEvent()
export const registerStepChanged = createEvent<AuthStep>()
export const avatarSkipped = createEvent()
export const avatarFileSelected = createEvent<File>()
export const registerCompleted = createEvent()

/* Avatar */

export const $avatarPreview = createStore<string | null>(null)
export const $isUploading = createStore(false)

/* Recovery */

export const $recoveryForm = createStore<RecoveryRequest>({
  email: ''
})

export const $recoverySent = createStore(false)

export const recoveryFieldChanged = createEvent<RecoveryFieldChange>()
export const recoverySubmitted = createEvent()

/* Common */

export const $isSubmitting = createStore(false)
