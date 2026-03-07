import { sample } from 'effector'

import {
  $loginForm,
  $registerForm,
  $recoveryForm,
  $registerStep,
  $recoverySent,
  $loginError,
  $registerError,
  $recoveryError,
  $isSubmitting,
  loginFieldChanged,
  loginSubmitted,
  registerFieldChanged,
  registerSubmitted,
  registerStepChanged,
  avatarSkipped,
  avatarFileSelected,
  $avatarPreview,
  $isUploading,
  recoveryFieldChanged,
  recoverySubmitted,
  loginFx,
  registerFx,
  recoveryFx,
  uploadAvatarFx,
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
  clock: loginSubmitted,
  source: $loginForm,
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
  clock: registerSubmitted,
  source: $registerForm,
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
  clock: recoverySubmitted,
  source: $recoveryForm,
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

/* Errors */

sample({
  clock: loginFx.failData,
  fn: (error) => error.message,
  target: $loginError
})

sample({
  clock: loginFx,
  fn: () => null,
  target: $loginError
})

sample({
  clock: registerFx.failData,
  fn: (error) => error.message,
  target: $registerError
})

sample({
  clock: registerFx,
  fn: () => null,
  target: $registerError
})

sample({
  clock: recoveryFx.failData,
  fn: (error) => error.message,
  target: $recoveryError
})

sample({
  clock: recoveryFx,
  fn: () => null,
  target: $recoveryError
})

/* Success -> next step */

sample({
  clock: registerFx.done,
  fn: () => AuthStep.AVATAR,
  target: $registerStep
})
