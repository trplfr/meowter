import { ArrowLeft } from 'lucide-react'

import { routes } from '@core/router'
import { Layout } from '@ui/index'
import { RecoveryForm } from '@modules/Auth'

import s from './Recovery.module.scss'

export const route = routes.recovery

export const Recovery = () => {
  return (
    <Layout>
      <header className={s.header}>
        <button className={s.back} onClick={() => history.back()}>
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className={s.content}>
        <RecoveryForm />
      </div>
    </Layout>
  )
}
