import { t } from '@lingui/core/macro'
import { ArrowLeft } from 'lucide-react'

import { routes } from '@core/router'
import { AuthLayout } from '@ui/index'
import { RecoveryForm } from '@modules/Auth'

import s from './Recovery.module.scss'

export const route = routes.recovery

export const Recovery = () => {
  return (
    <AuthLayout>
      <title>{t`Восстановление / Мяутер`}</title>

      <header className={s.header}>
        <button className={s.back} onClick={() => history.back()}>
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className={s.content}>
        <RecoveryForm />
      </div>
    </AuthLayout>
  )
}
