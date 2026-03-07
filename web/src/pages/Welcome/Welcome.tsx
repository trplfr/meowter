import { Trans } from '@lingui/react/macro'
import { Link } from 'atomic-router-react'

import { routes } from '@core/router'
import { Layout, Button } from '@ui/index'

import helloCat from '@assets/images/hello.png'

import s from './Welcome.module.scss'

export const route = routes.welcome

export const Welcome = () => {
  return (
    <Layout>
      <div className={s.header} />

      <div className={s.content}>
        <img className={s.cat} src={helloCat} alt="" />
        <h1 className={s.title}>
          <Trans>Добро пожаловать</Trans>
        </h1>
        <p className={s.description}>
          <Trans>
            Если вам хочется принять участие в обсуждении последних новостей, вместо того, чтобы работать
          </Trans>
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
