import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Helmet } from 'react-helmet-async'

import { routes } from '@core/router'

import { AuthLayout } from '@modules/AuthLayout'

import s from './Search.module.scss'

export const route = routes.search

export const Search = () => {
  return (
    <AuthLayout title={<Trans>Поиск</Trans>} contentClassName={s.content}>
      <Helmet>
        <title>{t`Поиск / Мяутер`}</title>
      </Helmet>
    </AuthLayout>
  )
}
