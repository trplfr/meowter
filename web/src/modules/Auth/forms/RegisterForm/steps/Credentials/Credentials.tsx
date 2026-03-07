import { Trans, useLingui } from '@lingui/react/macro'
import { useUnit } from 'effector-react'
import { Link } from 'atomic-router-react'

import { routes } from '@core/router'
import { Input, Button } from '@ui/index'

import {
  $registerForm,
  $registerError,
  $isSubmitting,
  registerFieldChanged,
  registerSubmitted
} from '../../../../models'

import s from '../steps.module.scss'

export const Credentials = () => {
  const { t } = useLingui()
  const [form, error, isSubmitting] = useUnit([$registerForm, $registerError, $isSubmitting])
  const [onChange, onSubmit] = useUnit([registerFieldChanged, registerSubmitted])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <h1 className={s.title}>
        <Trans>Давайте начинать</Trans>
      </h1>
      <p className={s.description}>
        <Trans>Заведите аккаунт, чтобы полноценно пользоваться сервисом</Trans>
      </p>

      <div className={s.fields}>
        <Input
          placeholder={t`Логин`}
          value={form.username}
          onChange={(e) => onChange({ field: 'username', value: e.target.value })}
        />
        <Input
          placeholder={t`Пароль`}
          isPassword
          value={form.password}
          onChange={(e) => onChange({ field: 'password', value: e.target.value })}
        />
        <Input
          placeholder={t`Электронная почта`}
          type="email"
          value={form.email}
          onChange={(e) => onChange({ field: 'email', value: e.target.value })}
        />
      </div>

      {error && <p className={s.error}>{error}</p>}

      <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
        <Trans>Далее</Trans>
      </Button>

      <Link to={routes.login} className={s.link}>
        <Trans>Войти в аккаунт</Trans>
      </Link>
    </form>
  )
}
