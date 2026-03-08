import { sample } from 'effector'

import { $session, sessionReceived } from '@logic/session'

import {
  type SettingsForm,
  type PasswordForm,
  $form,
  $initialForm,
  $passwordForm,
  $avatarPreview,
  $avatarFile,
  $isDirty,
  $isPasswordDirty,
  settingsPageOpened,
  fieldChanged,
  passwordFieldChanged,
  avatarSelected,
  submitted,
  updateProfileFx,
  changePasswordFx,
  uploadAvatarFx
} from '../models'

// заполняем форму из сессии при открытии
sample({
  clock: settingsPageOpened,
  source: $session,
  filter: (session) => session !== null,
  fn: (session): SettingsForm => ({
    displayName: session!.displayName || '',
    firstName: session!.firstName || '',
    lastName: session!.lastName || '',
    bio: session!.bio || '',
    contacts: session!.contacts || '',
    sex: session!.sex || ''
  }),
  target: [$form, $initialForm]
})

// сброс пароля и аватара при открытии
sample({
  clock: settingsPageOpened,
  fn: (): PasswordForm => ({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }),
  target: $passwordForm
})

sample({
  clock: settingsPageOpened,
  fn: () => null,
  target: [$avatarPreview, $avatarFile]
})

sample({
  clock: settingsPageOpened,
  fn: () => false,
  target: [$isDirty, $isPasswordDirty]
})

// обновление полей формы
sample({
  clock: fieldChanged,
  source: $form,
  fn: (form, { field, value }) => ({ ...form, [field]: value }),
  target: $form
})

// проверка isDirty
sample({
  clock: fieldChanged,
  source: {
    form: $form,
    initial: $initialForm
  },
  fn: ({ form, initial }, { field, value }) => {
    const updated = { ...form, [field]: value }
    return (
      updated.displayName !== initial.displayName ||
      updated.firstName !== initial.firstName ||
      updated.lastName !== initial.lastName ||
      updated.bio !== initial.bio ||
      updated.contacts !== initial.contacts ||
      updated.sex !== initial.sex
    )
  },
  target: $isDirty
})

// обновление пароля
sample({
  clock: passwordFieldChanged,
  source: $passwordForm,
  fn: (form, { field, value }) => ({ ...form, [field]: value }),
  target: $passwordForm
})

sample({
  clock: passwordFieldChanged,
  source: $passwordForm,
  fn: (form, { field, value }) => {
    const updated = { ...form, [field]: value }
    return updated.oldPassword.length > 0 || updated.newPassword.length > 0 || updated.confirmPassword.length > 0
  },
  target: $isPasswordDirty
})

// аватар
sample({
  clock: avatarSelected,
  target: $avatarFile
})

sample({
  clock: avatarSelected,
  fn: (file) => URL.createObjectURL(file),
  target: $avatarPreview
})

sample({
  clock: avatarSelected,
  fn: () => true,
  target: $isDirty
})

// сабмит: загрузка аватара
sample({
  clock: submitted,
  source: $avatarFile,
  filter: (file) => file !== null,
  fn: (file) => file!,
  target: uploadAvatarFx
})

// сабмит: обновление профиля (только если поля формы отличаются от начальных)
sample({
  clock: submitted,
  source: {
    form: $form,
    initial: $initialForm
  },
  filter: ({ form, initial }) =>
    form.displayName !== initial.displayName ||
    form.firstName !== initial.firstName ||
    form.lastName !== initial.lastName ||
    form.bio !== initial.bio ||
    form.contacts !== initial.contacts ||
    form.sex !== initial.sex,
  fn: ({ form }) => ({
    displayName: form.displayName || null,
    firstName: form.firstName || null,
    lastName: form.lastName || null,
    bio: form.bio || null,
    contacts: form.contacts || null,
    sex: form.sex || null
  }),
  target: updateProfileFx
})

// сабмит: смена пароля
sample({
  clock: submitted,
  source: {
    passwordForm: $passwordForm,
    isPasswordDirty: $isPasswordDirty
  },
  filter: ({ isPasswordDirty, passwordForm }) =>
    isPasswordDirty &&
    passwordForm.oldPassword.length > 0 &&
    passwordForm.newPassword.length >= 6 &&
    passwordForm.newPassword === passwordForm.confirmPassword,
  fn: ({ passwordForm }) => ({
    oldPassword: passwordForm.oldPassword,
    newPassword: passwordForm.newPassword
  }),
  target: changePasswordFx
})

// после успешного обновления профиля -> обновляем сессию
sample({
  clock: updateProfileFx.doneData,
  target: sessionReceived
})

// после аватара -> обновляем сессию через refetch
sample({
  clock: uploadAvatarFx.doneData,
  source: $session,
  filter: (session) => session !== null,
  fn: (session, { avatarUrl }) => ({
    ...session!,
    avatarUrl
  }),
  target: sessionReceived
})

// после успешного обновления профиля -> обновляем initial
sample({
  clock: updateProfileFx.doneData,
  source: $form,
  target: $initialForm
})

// сброс dirty после успешного обновления
sample({
  clock: updateProfileFx.doneData,
  fn: () => false,
  target: $isDirty
})

// сброс аватара после загрузки
sample({
  clock: uploadAvatarFx.doneData,
  fn: () => null,
  target: [$avatarFile, $avatarPreview]
})

// сброс пароля после смены
sample({
  clock: changePasswordFx.doneData,
  fn: (): PasswordForm => ({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }),
  target: $passwordForm
})

sample({
  clock: changePasswordFx.doneData,
  fn: () => false,
  target: $isPasswordDirty
})
