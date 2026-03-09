import {
  type LoginRequest,
  type RegisterRequest,
  type RecoveryRequest
} from '@logic/api/auth'

export enum AuthStep {
  CREDENTIALS = 'CREDENTIALS',
  AVATAR = 'AVATAR',
  DONE = 'DONE'
}

export interface LoginFieldChange {
  field: keyof LoginRequest
  value: string
}

export interface RegisterFieldChange {
  field: keyof RegisterRequest
  value: string
}

export interface RecoveryFieldChange {
  field: keyof RecoveryRequest
  value: string
}
