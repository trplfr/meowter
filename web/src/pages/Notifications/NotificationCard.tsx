import { Link } from 'atomic-router-react'
import { Trans } from '@lingui/react/macro'

import { type Notification, NotificationType, type Sex } from '@shared/types'

import { routes } from '@core/router'

import { type ReactNode } from 'react'

import { highlightTildes } from '@lib/meow'

import { Avatar, TimeAgo } from '@modules/MeowCard'

import s from './Notifications.module.scss'

interface NotificationCardProps {
  notification: Notification
}

const NotificationText = ({
  type,
  sex
}: {
  type: NotificationType
  sex: Sex | null
}) => {
  const f = sex === 'FEMALE'

  if (type === NotificationType.FOLLOW) {
    return f ? (
      <Trans>подписалась на вас</Trans>
    ) : (
      <Trans>подписался на вас</Trans>
    )
  }

  if (type === NotificationType.MEOW_LIKE) {
    return f ? <Trans>оценила ваш мяут</Trans> : <Trans>оценил ваш мяут</Trans>
  }

  if (type === NotificationType.REMEOW) {
    return f ? (
      <Trans>ремяутнула ваш мяут</Trans>
    ) : (
      <Trans>ремяутнул ваш мяут</Trans>
    )
  }

  if (type === NotificationType.REPLY) {
    return f ? (
      <Trans>ответила на ваш мяут</Trans>
    ) : (
      <Trans>ответил на ваш мяут</Trans>
    )
  }

  if (type === NotificationType.MENTION) {
    return f ? <Trans>упомянула вас</Trans> : <Trans>упомянул вас</Trans>
  }

  return f ? (
    <Trans>оценила ваш комментарий</Trans>
  ) : (
    <Trans>оценил ваш комментарий</Trans>
  )
}

// подсветка @mentions без ссылок (span вместо a, чтобы не вложенные <a>)
const highlightMentionsInline = (text: string, className: string): ReactNode[] => {
  const parts: ReactNode[] = []
  const regex = /(@[\w\u0400-\u04FF]+)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(
      <span key={match.index} className={className}>
        {match[0]}
      </span>
    )
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

export const NotificationCard = ({ notification }: NotificationCardProps) => {
  const { actor, meow, comment, type } = notification

  const commentHref = meow && comment
    ? `/meow/${meow.id}#comment-${comment.id}`
    : null

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

      {comment && commentHref && (
        <a href={commentHref} className={s.commentPreview}>
          <div className={s.commentPreviewContent}>
            {highlightMentionsInline(
              comment.content.length > 150
                ? comment.content.slice(0, 150) + '...'
                : comment.content,
              s.mention
            )}
          </div>
        </a>
      )}

      {meow && !comment && (
        <Link
          to={routes.meowThread}
          params={{ meowId: meow.id }}
          className={s.meowPreview}
        >
          <div className={s.meowPreviewTop}>
            <Avatar src={meow.author.avatarUrl} alt={meow.author.displayName} />
            <div className={s.meowPreviewMeta}>
              <span className={s.meowPreviewAuthor}>
                {meow.author.displayName}
              </span>
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
