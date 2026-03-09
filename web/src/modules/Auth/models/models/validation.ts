import { invoke } from '@withease/factories'
import { t } from '@lingui/core/macro'

import {
  USERNAME_MIN,
  USERNAME_MAX,
  USERNAME_PATTERN,
  PASSWORD_MIN,
  PASSWORD_MAX,
  EMAIL_MAX,
  EMAIL_PATTERN
} from '@shared/constants'

import { createFormValidation, type ValidationRule } from '@lib/validation'

import {
  $loginForm,
  loginSubmitted,
  $registerForm,
  registerSubmitted,
  $recoveryForm,
  recoverySubmitted
} from './auth'

/* Login rules */

const loginRules: ValidationRule[] = [
  {
    field: 'email',
    check: v => v.length > 0,
    message: () => t`Введите почту`
  },
  {
    field: 'email',
    check: v => EMAIL_PATTERN.test(v),
    message: () => t`Некорректный формат почты`
  },
  {
    field: 'email',
    check: v => v.length <= EMAIL_MAX,
    message: () => t`Почта слишком длинная`
  },
  {
    field: 'password',
    check: v => v.length > 0,
    message: () => t`Введите пароль`
  },
  {
    field: 'password',
    check: v => v.length >= PASSWORD_MIN,
    message: () => t`Пароль минимум ${PASSWORD_MIN} символов`
  }
]

/* Register rules */

const registerRules: ValidationRule[] = [
  {
    field: 'username',
    check: v => v.length > 0,
    message: () => t`Введите имя пользователя`
  },
  {
    field: 'username',
    check: v => v.length >= USERNAME_MIN,
    message: () => t`Имя минимум ${USERNAME_MIN} символа`
  },
  {
    field: 'username',
    check: v => v.length <= USERNAME_MAX,
    message: () => t`Имя максимум ${USERNAME_MAX} символов`
  },
  {
    field: 'username',
    check: v => USERNAME_PATTERN.test(v),
    message: () => t`Только латиница, цифры и _`
  },
  {
    field: 'email',
    check: v => v.length > 0,
    message: () => t`Введите почту`
  },
  {
    field: 'email',
    check: v => EMAIL_PATTERN.test(v),
    message: () => t`Некорректный формат почты`
  },
  {
    field: 'email',
    check: v => v.length <= EMAIL_MAX,
    message: () => t`Почта слишком длинная`
  },
  {
    field: 'password',
    check: v => v.length > 0,
    message: () => t`Введите пароль`
  },
  {
    field: 'password',
    check: v => v.length >= PASSWORD_MIN,
    message: () => t`Пароль минимум ${PASSWORD_MIN} символов`
  },
  {
    field: 'password',
    check: v => v.length <= PASSWORD_MAX,
    message: () => t`Пароль максимум ${PASSWORD_MAX} символов`
  }
]

/* Recovery rules */

const recoveryRules: ValidationRule[] = [
  {
    field: 'email',
    check: v => v.length > 0,
    message: () => t`Введите почту`
  },
  {
    field: 'email',
    check: v => EMAIL_PATTERN.test(v),
    message: () => t`Некорректный формат почты`
  }
]

/* Validation instances */

export const loginValidation = invoke(createFormValidation, {
  clock: loginSubmitted,
  source: $loginForm,
  rules: loginRules
})

export const registerValidation = invoke(createFormValidation, {
  clock: registerSubmitted,
  source: $registerForm,
  rules: registerRules
})

export const recoveryValidation = invoke(createFormValidation, {
  clock: recoverySubmitted,
  source: $recoveryForm,
  rules: recoveryRules
})
