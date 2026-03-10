import { t } from '@lingui/core/macro'
import { ArrowLeft } from 'lucide-react'

import { routes } from '@core/router'
import { AuthLayout } from '@ui/index'
import { LoginForm } from '@modules/Auth'

import s from './Login.module.scss'

export const route = routes.login

export const Login = () => {
  return (
    <AuthLayout>
      <title>{t`Вход / Мяутер`}</title>
      <meta name='description' content={t`Войдите в свой аккаунт Мяутера`} />
      <meta name='robots' content='noindex' />

      <header className={s.header}>
        <button className={s.back} onClick={() => history.back()}>
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className={s.content}>
        <LoginForm />
      </div>
    </AuthLayout>
  )
}
