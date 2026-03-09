import { useCallback } from 'react'
import { Link } from 'atomic-router-react'
import { Trans } from '@lingui/react/macro'
import { MessageCircle, Heart, Link2, CircleAlert, BadgeCheck } from 'lucide-react'
import clsx from 'clsx'

import { type Meow } from '@shared/types'

import { routes } from '@core/router'

import { highlightTildes } from '@lib/meow'

import { ActionSheet } from '@ui/ActionSheet'

import { Avatar } from './Avatar'
import { TimeAgo } from './TimeAgo'

import s from './MeowCard.module.scss'

interface MeowCardProps {
  meow: Meow
  onLike: (id: string) => void
}

export const MeowCard = ({ meow, onLike }: MeowCardProps) => {
  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/cat/${meow.author.username}/meow/${meow.id}`
    navigator.clipboard.writeText(url)
  }, [meow.id, meow.author.username])

  const handleReport = useCallback(() => {
    // TODO: реализовать отправку жалобы
  }, [])

  const actionItems = [
    {
      label: <Trans>Копировать ссылку</Trans>,
      icon: Link2,
      onClick: handleCopyLink
    },
    {
      label: <Trans>Пожаловаться</Trans>,
      icon: CircleAlert,
      onClick: handleReport,
      variant: 'danger' as const
    }
  ]

  return (
    <article className={s.card}>
      <Link
        to={routes.catProfile}
        params={{ username: meow.author.username }}
        className={s.avatarLink}
      >
        <Avatar src={meow.author.avatarUrl} alt={meow.author.displayName} />
      </Link>

      <div className={s.body}>
        <div className={s.top}>
          <div className={s.meta}>
            <Link
              to={routes.catProfile}
              params={{ username: meow.author.username }}
              className={s.authorName}
            >
              {meow.author.displayName}
            </Link>
            {meow.author.verified && (
              <span className={s.verified}>
                <BadgeCheck size={16} />
              </span>
            )}
            <TimeAgo date={meow.createdAt} />
          </div>

          <div className={s.more}>
            <ActionSheet items={actionItems} />
          </div>
        </div>

        <div className={s.content}>
          {highlightTildes(meow.content, s.tilde)}
        </div>

        {meow.imageUrl && (
          <div className={s.imageWrap}>
            <img
              className={s.image}
              src={meow.imageUrl}
              alt=""
              loading="lazy"
            />
          </div>
        )}

        <div className={s.actions}>
          <Link
            to={routes.meowThread}
            params={{ meowId: meow.id }}
            className={s.action}
            aria-label="Комментарии"
          >
            <MessageCircle size={18} />
            {meow.commentsCount > 0 && (
              <span className={s.count}>{meow.commentsCount}</span>
            )}
          </Link>

          <button
            type="button"
            className={clsx(s.action, s.likeAction, meow.isLiked && s.liked)}
            aria-label={meow.isLiked ? 'Убрать лайк' : 'Лайк'}
            onClick={() => onLike(meow.id)}
          >
            <Heart size={18} fill={meow.isLiked ? 'currentColor' : 'none'} />
            {meow.likesCount > 0 && (
              <span className={s.count}>{meow.likesCount}</span>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
