import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Helmet } from 'react-helmet-async'

import { routes } from '@core/router'

import { AuthLayout } from '@modules/AuthLayout'

export const route = routes.catProfile

export const CatProfile = () => {
  return (
    <AuthLayout title={<Trans>Профиль</Trans>}>
      <Helmet>
        <title>{t`Профиль / Мяутер`}</title>
      </Helmet>
    </AuthLayout>
  )
}
