import { Trans, useLingui } from '@lingui/react/macro'
import { useUnit } from 'effector-react'
import { Link } from 'atomic-router-react'

import { routes } from '@core/router'
import { Input, Button } from '@ui/index'

import {
  $loginForm,
  $loginError,
  $isSubmitting,
  loginFieldChanged,
  loginSubmitted
} from '../../models'

import s from '../form.module.scss'

export const LoginForm = () => {
  const { t } = useLingui()
  const [form, error, isSubmitting] = useUnit([$loginForm, $loginError, $isSubmitting])
  const [onChange, onSubmit] = useUnit([loginFieldChanged, loginSubmitted])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <h1 className={s.title}>
        <Trans>Вход</Trans>
      </h1>
      <p className={s.description}>
        <Trans>Войдите в аккаунт, чтобы продолжить обсуждать любимые темы</Trans>
      </p>

      <div className={s.fields}>
        <Input
          placeholder={t`Почта или телефон`}
          value={form.login}
          onChange={(e) => onChange({ field: 'login', value: e.target.value })}
        />
        <Input
          placeholder={t`Пароль`}
          isPassword
          value={form.password}
          onChange={(e) => onChange({ field: 'password', value: e.target.value })}
        />
      </div>

      {error && <p className={s.error}>{error}</p>}

      <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
        <Trans>Далее</Trans>
      </Button>

      <Link to={routes.recovery} className={s.link}>
        <Trans>Восстановить пароль</Trans>
      </Link>

      <Link to={routes.register} className={s.link}>
        <Trans>У меня нет аккаунта</Trans>
      </Link>
    </form>
  )
}
