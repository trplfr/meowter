import { createEffect } from 'effector'

import {
  type UpdateProfileParams,
  type UpdateProfileResult,
  type ChangePasswordParams,
  type ChangePasswordResult
} from '../types'

import { type AvatarResponse } from '@logic/api/auth'

export const updateProfileFx = createEffect<UpdateProfileParams, UpdateProfileResult>()
export const changePasswordFx = createEffect<ChangePasswordParams, ChangePasswordResult>()
export const uploadAvatarFx = createEffect<File, AvatarResponse>()
