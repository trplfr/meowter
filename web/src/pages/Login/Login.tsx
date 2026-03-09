import { t } from '@lingui/core/macro'
import { ArrowLeft } from 'lucide-react'

import { routes } from '@core/router'
import { Layout } from '@ui/index'
import { LoginForm } from '@modules/Auth'

import s from './Login.module.scss'

export const route = routes.login

export const Login = () => {
  return (
    <Layout>
      <title>{t`Вход / Мяутер`}</title>

      <header className={s.header}>
        <button className={s.back} onClick={() => history.back()}>
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className={s.content}>
        <LoginForm />
      </div>
    </Layout>
  )
}
