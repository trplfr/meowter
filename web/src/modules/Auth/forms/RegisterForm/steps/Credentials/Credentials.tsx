import { Trans, useLingui } from '@lingui/react/macro'
import { useUnit } from 'effector-react'
import { Link } from 'atomic-router-react'

import { routes } from '@core/router'
import { Input, Button } from '@ui/index'

import {
  $registerForm,
  $isSubmitting,
  registerFieldChanged,
  registerSubmitted,
  registerValidation
} from '../../../../models'

import s from '../steps.module.scss'

export const Credentials = () => {
  const { t } = useLingui()
  const [form, errors, isSubmitting] = useUnit([$registerForm, registerValidation.$errors, $isSubmitting])
  const [onChange, onSubmit] = useUnit([registerFieldChanged, registerSubmitted])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <h1 className={s.title}>
        <Trans>Давайте знакомиться</Trans>
      </h1>
      <p className={s.description}>
        <Trans>Заведите аккаунт, чтобы начать общаться</Trans>
      </p>

      <div className={s.fields}>
        <Input
          id="register-username"
          name="username"
          autoComplete="username"
          placeholder={t`Логин`}
          value={form.username}
          error={errors.username ?? undefined}
          onChange={(e) => onChange({ field: 'username', value: e.target.value })}
        />
        <Input
          id="register-password"
          name="password"
          autoComplete="new-password"
          placeholder={t`Пароль`}
          isPassword
          value={form.password}
          error={errors.password ?? undefined}
          onChange={(e) => onChange({ field: 'password', value: e.target.value })}
        />
        <Input
          id="register-email"
          name="email"
          autoComplete="email"
          placeholder={t`Электронная почта`}
          type="email"
          value={form.email}
          error={errors.email ?? undefined}
          onChange={(e) => onChange({ field: 'email', value: e.target.value })}
        />
      </div>

      <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
        <Trans>Далее</Trans>
      </Button>

      <Link to={routes.login} className={s.link}>
        <Trans>Войти в аккаунт</Trans>
      </Link>
    </form>
  )
}
