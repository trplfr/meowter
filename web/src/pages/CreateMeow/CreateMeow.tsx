import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'
import { Check } from 'lucide-react'

import { routes } from '@core/router'

import { Layout } from '@modules/Layout'
import { CreateMeowForm, submitted, createMeowMutation, $hasTildes } from '@modules/CreateMeow'

import s from './CreateMeow.module.scss'

export const route = routes.createMeow

export const CreateMeow = () => {
  const [onSubmit, pending, hasTildes] = useUnit([submitted, createMeowMutation.$pending, $hasTildes])

  const headerAction = (
    <button
      type="button"
      className={s.submit}
      disabled={pending || !hasTildes}
      onClick={() => onSubmit()}
    >
      <Check size={24} />
    </button>
  )

  return (
    <Layout
      title={<Trans>Мяутнуть</Trans>}
      contentClassName={s.content}
      headerAction={headerAction}
    >
      <title>{t`Мяутнуть / Мяутер`}</title>
      <CreateMeowForm />
    </Layout>
  )
}
