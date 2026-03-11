import './models/init'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'
import { Loader2 } from 'lucide-react'

import { routes } from '@core/router'
import { AuthLayout } from '@ui/index'

import { $status } from './models'

import s from './Verify.module.scss'

export const route = routes.verify

export const Verify = () => {
  const status = useUnit($status)

  return (
    <AuthLayout>
      <title>{t`Подтверждение почты / Мяутер`}</title>
      <meta name='robots' content='noindex' />

      <div className={s.header} />

      <div className={s.content}>
        {status === 'pending' && (
          <>
            <Loader2 size={40} className={s.spinner} />
            <p className={s.text}>
              <Trans>Подтверждаем почту...</Trans>
            </p>
          </>
        )}
        {status === 'success' && (
          <>
            <span className={s.emoji}>🎉</span>
            <h1 className={s.title}>
              <Trans>Почта подтверждена!</Trans>
            </h1>
            <p className={s.text}>
              <Trans>Перенаправляем в ленту...</Trans>
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <span className={s.emoji}>😿</span>
            <h1 className={s.title}>
              <Trans>Ссылка недействительна</Trans>
            </h1>
            <p className={s.text}>
              <Trans>Ссылка истекла или уже была использована</Trans>
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
