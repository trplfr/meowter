import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Helmet } from 'react-helmet-async'

import { Layout } from '@ui/index'

import errorCat from '@assets/images/error.png'

import s from './Error.module.scss'

export const Error = () => {
  return (
    <Layout>
      <Helmet>
        <title>{t`Ошибка / Мяутер`}</title>
      </Helmet>

      <div className={s.header} />

      <div className={s.content}>
        <img className={s.cat} src={errorCat} alt="" />
        <h1 className={s.title}>
          <Trans>Упс...</Trans>
        </h1>
        <p className={s.description}>
          <Trans>Кажется, у нас что-то произошло...</Trans>
        </p>

        <div className={s.actions}>
          <button className={s.link} onClick={() => location.reload()}>
            <Trans>Обновить страницу</Trans>
          </button>
        </div>
      </div>
    </Layout>
  )
}
