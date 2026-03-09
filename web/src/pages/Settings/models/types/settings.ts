import {
  type UpdateProfileRequest,
  type ChangePasswordRequest,
  type ChangePasswordResponse,
  type AuthResponse
} from '@logic/api/auth'

export interface SettingsForm {
  displayName: string
  firstName: string
  lastName: string
  bio: string
  contacts: string
  sex: string
}

export interface PasswordForm {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export type SettingsFieldChanged = {
  field: keyof SettingsForm
  value: string
}

export type PasswordFieldChanged = {
  field: keyof PasswordForm
  value: string
}

export type UpdateProfileParams = UpdateProfileRequest
export type UpdateProfileResult = AuthResponse
export type ChangePasswordParams = ChangePasswordRequest
export type ChangePasswordResult = ChangePasswordResponse
