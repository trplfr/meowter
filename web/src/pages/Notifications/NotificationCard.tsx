import { Link } from 'atomic-router-react'
import { Trans } from '@lingui/react/macro'

import { type Notification, NotificationType, type Sex } from '@shared/types'

import { routes } from '@core/router'

import { highlightTildes } from '@lib/meow'

import { Avatar, TimeAgo } from '@modules/MeowCard'

import s from './Notifications.module.scss'

interface NotificationCardProps {
  notification: Notification
}

const NotificationText = ({ type, sex }: { type: NotificationType; sex: Sex | null }) => {
  const f = sex === 'FEMALE'

  if (type === NotificationType.FOLLOW) {
    return f ? <Trans>подписалась на вас</Trans> : <Trans>подписался на вас</Trans>
  }

  if (type === NotificationType.MEOW_LIKE) {
    return f ? <Trans>оценила ваш мяут</Trans> : <Trans>оценил ваш мяут</Trans>
  }

  return f ? <Trans>оценила ваш комментарий</Trans> : <Trans>оценил ваш комментарий</Trans>
}

export const NotificationCard = ({ notification }: NotificationCardProps) => {
  const { actor, meow, type } = notification

  return (
    <div className={s.card}>
      <div className={s.cardTop}>
        <Link
          to={routes.catProfile}
          params={{ username: actor.username }}
          className={s.cardAvatarLink}
        >
          <Avatar src={actor.avatarUrl} alt={actor.displayName} />
        </Link>

        <div className={s.cardMeta}>
          <Link
            to={routes.catProfile}
            params={{ username: actor.username }}
            className={s.cardAuthor}
          >
            {actor.displayName}
          </Link>
          <span className={s.cardText}>
            <NotificationText type={type} sex={actor.sex} />
          </span>
        </div>

        <TimeAgo date={notification.createdAt} />
      </div>

      {meow && (
        <Link
          to={routes.meowThread}
          params={{ meowId: meow.id }}
          className={s.meowPreview}
        >
          <div className={s.meowPreviewTop}>
            <Avatar src={meow.author.avatarUrl} alt={meow.author.displayName} />
            <div className={s.meowPreviewMeta}>
              <span className={s.meowPreviewAuthor}>{meow.author.displayName}</span>
              <TimeAgo date={meow.createdAt} />
            </div>
          </div>
          <div className={s.meowPreviewContent}>
            {highlightTildes(meow.content, s.tilde)}
          </div>
        </Link>
      )}
    </div>
  )
}
