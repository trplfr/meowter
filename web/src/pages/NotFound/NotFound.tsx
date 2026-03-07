import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { ArrowLeft } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

import { routes } from '@core/router'
import { Layout } from '@ui/index'

import notfoundCat from '@assets/images/notfound.png'

import s from './NotFound.module.scss'

export const route = routes.notFound

export const NotFound = () => {
  return (
    <Layout>
      <Helmet>
        <title>{t`404 / Мяутер`}</title>
      </Helmet>

      <header className={s.header}>
        <button className={s.back} onClick={() => history.back()}>
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className={s.content}>
        <img className={s.cat} src={notfoundCat} alt="" />
        <h1 className={s.title}>
          <Trans>Ой!</Trans>
        </h1>
        <p className={s.description}>
          <Trans>Такой страницы нет...</Trans>
        </p>

        <div className={s.actions}>
          <button className={s.link} onClick={() => history.back()}>
            <Trans>Назад</Trans>
          </button>
        </div>
      </div>
    </Layout>
  )
}
