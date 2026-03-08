import { createEvent, createStore } from 'effector'

import {
  type SettingsForm,
  type PasswordForm,
  type SettingsFieldChanged,
  type PasswordFieldChanged
} from '../types'

/* Stores */

export const $form = createStore<SettingsForm>({
  displayName: '',
  firstName: '',
  lastName: '',
  bio: '',
  contacts: '',
  sex: ''
})

export const $initialForm = createStore<SettingsForm>({
  displayName: '',
  firstName: '',
  lastName: '',
  bio: '',
  contacts: '',
  sex: ''
})

export const $passwordForm = createStore<PasswordForm>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

export const $avatarPreview = createStore<string | null>(null)
export const $avatarFile = createStore<File | null>(null)

export const $isDirty = createStore(false)
export const $isPasswordDirty = createStore(false)

/* Events */

export const settingsPageOpened = createEvent()
export const fieldChanged = createEvent<SettingsFieldChanged>()
export const passwordFieldChanged = createEvent<PasswordFieldChanged>()
export const avatarSelected = createEvent<File>()
export const submitted = createEvent()
