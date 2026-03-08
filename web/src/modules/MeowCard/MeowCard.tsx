import { Link } from 'atomic-router-react'
import { MessageSquare, Heart } from 'lucide-react'
import clsx from 'clsx'

import { type Meow } from '@shared/types'

import { routes } from '@core/router'

import { highlightTildes } from '@lib/meow'

import { Avatar } from './Avatar'
import { TimeAgo } from './TimeAgo'

import s from './MeowCard.module.scss'

interface MeowCardProps {
  meow: Meow
  onLike: (id: string) => void
}

export const MeowCard = ({ meow, onLike }: MeowCardProps) => {
  return (
    <article className={s.card}>
      <div className={s.top}>
        <Link
          to={routes.catProfile}
          params={{ username: meow.author.username }}
          className={s.avatarLink}
        >
          <Avatar src={meow.author.avatarUrl} alt={meow.author.displayName} />
        </Link>

        <div className={s.meta}>
          <Link
            to={routes.catProfile}
            params={{ username: meow.author.username }}
            className={s.authorName}
          >
            {meow.author.displayName}
          </Link>
          <TimeAgo date={meow.createdAt} />
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
          <MessageSquare size={18} />
          <span className={s.count}>
            {meow.commentsCount > 0 ? meow.commentsCount : ''}
          </span>
        </Link>

        <button
          type="button"
          className={clsx(s.action, s.likeAction, meow.isLiked && s.liked)}
          aria-label={meow.isLiked ? 'Убрать лайк' : 'Лайк'}
          onClick={() => onLike(meow.id)}
        >
          <Heart size={18} fill={meow.isLiked ? 'currentColor' : 'none'} />
          <span className={s.count}>
            {meow.likesCount > 0 ? meow.likesCount : ''}
          </span>
        </button>
      </div>
    </article>
  )
}
