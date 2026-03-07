import { type User } from '@shared/types'

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

export type AuthResponse = User

export interface AvatarResponse {
  id: string
  avatarUrl: string
}
