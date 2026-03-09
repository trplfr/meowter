import { Trans, useLingui } from '@lingui/react/macro'
import { useUnit } from 'effector-react'
import { Link } from 'atomic-router-react'

import { routes } from '@core/router'
import { Input, Button } from '@ui/index'

import {
  $loginForm,
  $isSubmitting,
  loginFieldChanged,
  loginSubmitted,
  loginValidation
} from '../../models'

import s from '../form.module.scss'

export const LoginForm = () => {
  const { t } = useLingui()
  const [form, errors, isSubmitting] = useUnit([
    $loginForm,
    loginValidation.$errors,
    $isSubmitting
  ])
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
        <Trans>
          Войдите в аккаунт, чтобы продолжить обсуждать любимые темы
        </Trans>
      </p>

      <div className={s.fields}>
        <Input
          id='login-email'
          name='email'
          autoComplete='email'
          placeholder={t`Электронная почта`}
          value={form.email}
          error={errors.email ?? undefined}
          onChange={e => onChange({ field: 'email', value: e.target.value })}
        />
        <Input
          id='login-password'
          name='password'
          autoComplete='current-password'
          placeholder={t`Пароль`}
          isPassword
          value={form.password}
          error={errors.password ?? undefined}
          onChange={e => onChange({ field: 'password', value: e.target.value })}
        />
      </div>

      <Button
        type='submit'
        variant='primary'
        fullWidth
        isLoading={isSubmitting}
      >
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
