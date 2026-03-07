import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Link } from 'atomic-router-react'
import { Helmet } from 'react-helmet-async'

import { routes } from '@core/router'
import { Layout, Button } from '@ui/index'

import credentialsCat from '@assets/images/credentials.png'

import s from './Unauthorized.module.scss'

export const route = routes.unauthorized

export const Unauthorized = () => {
  return (
    <Layout>
      <Helmet>
        <title>{t`Доступ запрещен / Мяутер`}</title>
      </Helmet>

      <div className={s.header} />

      <div className={s.content}>
        <img className={s.cat} src={credentialsCat} alt="" />
        <h1 className={s.title}>
          <Trans>Ай!</Trans>
        </h1>
        <p className={s.description}>
          <Trans>Кажется, вам сюда нельзя...</Trans>
        </p>

        <div className={s.actions}>
          <Button variant="primary" fullWidth asChild>
            <Link to={routes.register}>
              <Trans>Зарегистрироваться</Trans>
            </Link>
          </Button>
          <Link to={routes.login} className={s.link}>
            <Trans>Войти в аккаунт</Trans>
          </Link>
        </div>
      </div>
    </Layout>
  )
}
