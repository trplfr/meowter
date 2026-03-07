import { createEvent, createStore } from 'effector'

import { AuthStep, type LoginForm, type RegisterForm, type RecoveryForm } from '../types'

/* Login */

export const $loginForm = createStore<LoginForm>({
  login: '',
  password: ''
})

export const loginFieldChanged = createEvent<{ field: keyof LoginForm; value: string }>()
export const loginSubmitted = createEvent()

/* Register */

export const $registerForm = createStore<RegisterForm>({
  username: '',
  password: '',
  email: ''
})

export const $registerStep = createStore<AuthStep>(AuthStep.CREDENTIALS)

export const registerFieldChanged = createEvent<{ field: keyof RegisterForm; value: string }>()
export const registerSubmitted = createEvent()
export const registerStepChanged = createEvent<AuthStep>()
export const avatarSkipped = createEvent()
export const avatarFileSelected = createEvent<File>()

/* Avatar */

export const $avatarPreview = createStore<string | null>(null)
export const $isUploading = createStore(false)

/* Recovery */

export const $recoveryForm = createStore<RecoveryForm>({
  email: ''
})

export const $recoverySent = createStore(false)

export const recoveryFieldChanged = createEvent<{ field: keyof RecoveryForm; value: string }>()
export const recoverySubmitted = createEvent()

/* Common */

export const $loginError = createStore<string | null>(null)
export const $registerError = createStore<string | null>(null)
export const $recoveryError = createStore<string | null>(null)
export const $isSubmitting = createStore(false)
