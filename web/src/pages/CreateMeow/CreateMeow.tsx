import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'
import { ArrowLeft, Check } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

import { routes } from '@core/router'
import { Layout } from '@ui/index'

import { AuthLayout } from '@modules/AuthLayout'
import { CreateMeowForm, submitted, createMeowFx, $hasTildes } from '@modules/CreateMeow'

import s from './CreateMeow.module.scss'

export const route = routes.createMeow

export const CreateMeow = () => {
  const [onSubmit, pending, hasTildes] = useUnit([submitted, createMeowFx.pending, $hasTildes])

  return (
    <>
      <Helmet>
        <title>{t`Мяутнуть / Мяутер`}</title>
      </Helmet>

      {/* мобильная версия */}
      <div className={s.mobile}>
        <Layout className={s.layout}>
          <header className={s.header}>
            <button className={s.back} onClick={() => history.back()}>
              <ArrowLeft size={24} />
            </button>
            <h1 className={s.title}>
              <Trans>Мяутнуть</Trans>
            </h1>
            <button
              className={s.submit}
              disabled={pending || !hasTildes}
              onClick={() => onSubmit()}
            >
              <Check size={24} />
            </button>
          </header>

          <CreateMeowForm />
        </Layout>
      </div>

      {/* десктопная версия */}
      <div className={s.desktop}>
        <AuthLayout title={<Trans>Новый мяу</Trans>}>
          <CreateMeowForm />
        </AuthLayout>
      </div>
    </>
  )
}
