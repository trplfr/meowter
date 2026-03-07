import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Helmet } from 'react-helmet-async'

import { routes } from '@core/router'

import { AuthLayout } from '@modules/AuthLayout'

import s from './Notifications.module.scss'

export const route = routes.notifications

export const Notifications = () => {
  return (
    <AuthLayout title={<Trans>Уведомления</Trans>} contentClassName={s.content}>
      <Helmet>
        <title>{t`Уведомления / Мяутер`}</title>
      </Helmet>
    </AuthLayout>
  )
}
