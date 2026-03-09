import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Link } from 'atomic-router-react'

import { routes } from '@core/router'
import { AuthLayout, Button } from '@ui/index'

import credentialsCat from '@assets/images/credentials.png'

import s from './Unauthorized.module.scss'

export const route = routes.unauthorized

export const Unauthorized = () => {
  return (
    <AuthLayout>
      <title>{t`Доступ запрещен / Мяутер`}</title>

      <div className={s.header} />

      <div className={s.content}>
        <img className={s.cat} src={credentialsCat} alt='' />
        <h1 className={s.title}>
          <Trans>Ай!</Trans>
        </h1>
        <p className={s.description}>
          <Trans>Кажется, вам сюда нельзя...</Trans>
        </p>

        <div className={s.actions}>
          <Button variant='primary' fullWidth asChild>
            <Link to={routes.login}>
              <Trans>Войти в аккаунт</Trans>
            </Link>
          </Button>
          <Link to={routes.register} className={s.link}>
            <Trans>Зарегистрироваться</Trans>
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
