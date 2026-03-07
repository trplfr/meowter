import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Helmet } from 'react-helmet-async'

import { routes } from '@core/router'

import { AuthLayout } from '@modules/AuthLayout'

export const route = routes.settings

export const Settings = () => {
  return (
    <AuthLayout title={<Trans>Настройки</Trans>}>
      <Helmet>
        <title>{t`Настройки / Мяутер`}</title>
      </Helmet>
    </AuthLayout>
  )
}
