import { Trans, useLingui } from '@lingui/react/macro'
import { useUnit } from 'effector-react'
import { Link } from 'atomic-router-react'

import { routes } from '@core/router'
import { Input, Button } from '@ui/index'

import {
  $recoveryForm,
  $recoverySent,
  $recoveryError,
  $isSubmitting,
  recoveryFieldChanged,
  recoverySubmitted
} from '../../models'

import s from '../form.module.scss'

const RecoveryRequest = () => {
  const { t } = useLingui()
  const [form, error, isSubmitting] = useUnit([$recoveryForm, $recoveryError, $isSubmitting])
  const [onChange, onSubmit] = useUnit([recoveryFieldChanged, recoverySubmitted])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <h1 className={s.title}>
        <Trans>Новый пароль</Trans>
      </h1>
      <p className={s.description}>
        <Trans>Мы пришлем новый пароль на почтовый адрес, указанный при регистрации</Trans>
      </p>

      <div className={s.fields}>
        <Input
          placeholder={t`Электронная почта`}
          type="email"
          value={form.email}
          onChange={(e) => onChange({ field: 'email', value: e.target.value })}
        />
      </div>

      {error && <p className={s.error}>{error}</p>}

      <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
        <Trans>Я жду новый пароль!</Trans>
      </Button>

      <Link to={routes.login} className={s.link}>
        <Trans>Войти в аккаунт</Trans>
      </Link>
    </form>
  )
}

const RecoverySent = () => {
  return (
    <div className={s.form}>
      <h1 className={s.title}>
        <Trans>Почти готово!</Trans>
      </h1>
      <p className={s.description}>
        <Trans>В течение двух минут на вашу почту придет новый пароль для входа</Trans>
      </p>
    </div>
  )
}

export const RecoveryForm = () => {
  const sent = useUnit($recoverySent)

  if (sent) {
    return <RecoverySent />
  }

  return <RecoveryRequest />
}
