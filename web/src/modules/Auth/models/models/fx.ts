import { createEffect } from 'effector'

import {
  type LoginRequest,
  type RegisterRequest,
  type RecoveryRequest,
  type AuthResponse,
  type AvatarResponse
} from '@logic/api/auth'

export const loginFx = createEffect<LoginRequest, AuthResponse>()
export const registerFx = createEffect<RegisterRequest, AuthResponse>()
export const recoveryFx = createEffect<RecoveryRequest, void>()

/* Avatar */

export const uploadAvatarFx = createEffect<File, AvatarResponse>()
