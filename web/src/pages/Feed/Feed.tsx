import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Helmet } from 'react-helmet-async'

import { routes } from '@core/router'

import { AuthLayout } from '@modules/AuthLayout'

import s from './Feed.module.scss'

export const route = routes.feed

export const Feed = () => {
  return (
    <AuthLayout title={<Trans>Лента</Trans>} contentClassName={s.content}>
      <Helmet>
        <title>{t`Лента / Мяутер`}</title>
      </Helmet>
    </AuthLayout>
  )
}
