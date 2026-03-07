import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Helmet } from 'react-helmet-async'

import { routes } from '@core/router'

import { AuthLayout } from '@modules/AuthLayout'

export const route = routes.meowThread

export const MeowThread = () => {
  return (
    <AuthLayout title={<Trans>Мяу</Trans>}>
      <Helmet>
        <title>{t`Мяу / Мяутер`}</title>
      </Helmet>
    </AuthLayout>
  )
}
