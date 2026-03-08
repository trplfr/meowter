import { api } from '@lib/api'

import {
  type LoginRequest,
  type RegisterRequest,
  type RecoveryRequest,
  type UpdateProfileRequest,
  type ChangePasswordRequest,
  type AuthResponse,
  type AvatarResponse,
  type ChangePasswordResponse
} from './types'

export const login = (params: LoginRequest) =>
  api.post('auth/login', { json: params }).json<AuthResponse>()

export const register = (params: RegisterRequest) =>
  api.post('auth/register', { json: params }).json<AuthResponse>()

export const recovery = (params: RecoveryRequest) =>
  api.post('auth/recovery', { json: params }).json<void>()

export const uploadAvatar = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('auth/avatar', { body: formData }).json<AvatarResponse>()
}

export const fetchMe = () =>
  api.get('auth/me').json<AuthResponse>()

export const refresh = () =>
  api.post('auth/refresh').json<AuthResponse>()

export const updateProfile = (params: UpdateProfileRequest) =>
  api.patch('auth/profile', { json: params }).json<AuthResponse>()

export const changePassword = (params: ChangePasswordRequest) =>
  api.patch('auth/password', { json: params }).json<ChangePasswordResponse>()

export const logout = () =>
  api.post('auth/logout').json<void>()
