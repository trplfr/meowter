import { t } from '@lingui/core/macro'
import { ArrowLeft } from 'lucide-react'

import { routes } from '@core/router'
import { Layout } from '@ui/index'
import { RegisterForm } from '@modules/Auth'

import s from './Register.module.scss'

export const route = routes.register

export const Register = () => {
  return (
    <Layout>
      <title>{t`Регистрация / Мяутер`}</title>

      <header className={s.header}>
        <button className={s.back} onClick={() => history.back()}>
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className={s.content}>
        <RegisterForm />
      </div>
    </Layout>
  )
}
