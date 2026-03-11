import { sample } from 'effector'
import { redirect } from 'atomic-router'

import { routes } from '@core/router'

import { sessionReceived } from '@logic/session'

import {
  $loginForm,
  $registerForm,
  $recoveryForm,
  $registerStep,
  $recoverySent,
  $isSubmitting,
  loginFieldChanged,
  registerFieldChanged,
  registerStepChanged,
  avatarSkipped,
  avatarFileSelected,
  registerCompleted,
  $avatarPreview,
  $isUploading,
  recoveryFieldChanged,
  loginFx,
  registerFx,
  recoveryFx,
  uploadAvatarFx,
  loginValidation,
  registerValidation,
  recoveryValidation,
  AuthStep
} from '../models'

/* Login form */

sample({
  clock: loginFieldChanged,
  source: $loginForm,
  fn: (form, { field, value }) => ({ ...form, [field]: value }),
  target: $loginForm
})

sample({
  clock: loginValidation.validated,
  target: loginFx
})

/* Register form */

sample({
  clock: registerFieldChanged,
  source: $registerForm,
  fn: (form, { field, value }) => ({ ...form, [field]: value }),
  target: $registerForm
})

sample({
  clock: registerValidation.validated,
  target: registerFx
})

sample({
  clock: registerStepChanged,
  target: $registerStep
})

sample({
  clock: avatarSkipped,
  fn: () => AuthStep.DONE,
  target: $registerStep
})

/* Avatar upload */

sample({
  clock: avatarFileSelected,
  target: uploadAvatarFx
})

sample({
  clock: uploadAvatarFx.pending,
  target: $isUploading
})

sample({
  clock: uploadAvatarFx.doneData,
  fn: ({ avatarUrl }) => avatarUrl,
  target: $avatarPreview
})

sample({
  clock: uploadAvatarFx.done,
  fn: () => AuthStep.DONE,
  target: $registerStep
})

/* Recovery form */

sample({
  clock: recoveryFieldChanged,
  source: $recoveryForm,
  fn: (form, { field, value }) => ({ ...form, [field]: value }),
  target: $recoveryForm
})

sample({
  clock: recoveryValidation.validated,
  target: recoveryFx
})

sample({
  clock: recoveryFx.done,
  fn: () => true,
  target: $recoverySent
})

/* Loading state */

sample({
  clock: [loginFx.pending, registerFx.pending, recoveryFx.pending],
  target: $isSubmitting
})

/* Field touch -> clear error */

sample({
  clock: loginFieldChanged,
  fn: ({ field }) => field,
  target: loginValidation.fieldTouched
})

sample({
  clock: registerFieldChanged,
  fn: ({ field }) => field,
  target: registerValidation.fieldTouched
})

sample({
  clock: recoveryFieldChanged,
  fn: ({ field }) => field,
  target: recoveryValidation.fieldTouched
})

/* Success -> session + next step */

sample({
  clock: loginFx.doneData,
  target: sessionReceived
})

sample({
  clock: registerFx.doneData,
  target: sessionReceived
})

sample({
  clock: registerFx.done,
  fn: () => AuthStep.AVATAR,
  target: $registerStep
})

/* Redirect */

redirect({
  clock: loginFx.done,
  route: routes.feed
})

redirect({
  clock: registerCompleted,
  route: routes.feed
})
