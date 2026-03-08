import { type CatProfile } from '@shared/types'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface RecoveryRequest {
  email: string
}

export interface UpdateProfileRequest {
  displayName?: string | null
  firstName?: string | null
  lastName?: string | null
  bio?: string | null
  contacts?: string | null
  sex?: string | null
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export type AuthResponse = CatProfile

export interface AvatarResponse {
  id: string
  avatarUrl: string
}

export interface ChangePasswordResponse {
  ok: boolean
}
