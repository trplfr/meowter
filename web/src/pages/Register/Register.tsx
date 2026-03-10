import { t } from '@lingui/core/macro'
import { ArrowLeft } from 'lucide-react'

import { routes } from '@core/router'
import { SEO } from '@ui/Seo'
import { AuthLayout } from '@ui/index'
import { RegisterForm } from '@modules/Auth'

import s from './Register.module.scss'

export const route = routes.register

export const Register = () => {
  return (
    <AuthLayout>
      <title>{t`Регистрация / Мяутер`}</title>
      <meta name='description' content={t`Зарегистрируйтесь в Мяутере = соцсети с кошачьей тематикой`} />
      <meta property='og:title' content={t`Регистрация / Мяутер`} />
      <meta property='og:description' content={t`Соцсеть с кошачьей тематикой. Чтобы читать, нужно писать.`} />
      <meta property='og:type' content='website' />
      <meta name='twitter:card' content='summary' />
      <SEO path='/register' />

      <header className={s.header}>
        <button className={s.back} onClick={() => history.back()}>
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className={s.content}>
        <RegisterForm />
      </div>
    </AuthLayout>
  )
}
