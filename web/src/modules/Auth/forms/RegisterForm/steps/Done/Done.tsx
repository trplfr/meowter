import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'
import { ImageIcon } from 'lucide-react'

import { Button } from '@ui/index'

import { $avatarPreview, registerCompleted } from '../../../../models'

import s from '../steps.module.scss'

export const Done = () => {
  const [avatarPreview, onComplete] = useUnit([
    $avatarPreview,
    registerCompleted
  ])

  if (!avatarPreview) {
    return (
      <div className={s.form}>
        <div className={s.avatarPlaceholder}>
          <ImageIcon size={24} className={s.iconMuted} />
        </div>

        <h1 className={s.title}>
          <Trans>Блин!</Trans>
        </h1>
        <p className={s.description}>
          <Trans>Скорее ставь аватарку, чтобы друзья смогли тебя найти</Trans>
        </p>

        <Button variant='primary' fullWidth onClick={onComplete}>
          <Trans>Далее</Trans>
        </Button>
      </div>
    )
  }

  return (
    <div className={s.form}>
      <div className={s.avatarPlaceholder}>
        <img src={avatarPreview} alt='' />
      </div>

      <h1 className={s.title}>
        <Trans>Круто!</Trans>
      </h1>
      <p className={s.description}>
        <Trans>
          Теперь ваши друзья найдут вас быстрее, ведь вы выбрали, как выглядеть
        </Trans>
      </p>

      <Button variant='primary' fullWidth onClick={onComplete}>
        <Trans>Далее</Trans>
      </Button>
    </div>
  )
}
