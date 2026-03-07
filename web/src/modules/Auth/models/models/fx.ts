import { createEffect } from 'effector'

import { type LoginForm, type RegisterForm, type RecoveryForm } from '../types'

// TODO: подключить к API когда будет готов бэкенд
export const loginFx = createEffect<LoginForm, void>()
export const registerFx = createEffect<RegisterForm, void>()
export const recoveryFx = createEffect<RecoveryForm, void>()

/* Avatar */

export const uploadAvatarFx = createEffect<File, string>()
