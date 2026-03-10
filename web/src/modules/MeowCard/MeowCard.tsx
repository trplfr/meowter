import { useCallback, useState } from 'react'
import { Link } from 'atomic-router-react'
import { Trans } from '@lingui/react/macro'
import {
  MessageCircle,
  Heart,
  Link2,
  CircleAlert,
  BadgeCheck,
  Repeat2,
  SendHorizontal,
  Trash2,
  ArrowRight
} from 'lucide-react'
import clsx from 'clsx'

import { type Meow, Sex } from '@shared/types'

import { routes } from '@core/router'

import { highlightTildes } from '@lib/meow'

import { ActionSheet } from '@ui/ActionSheet'

import { Avatar } from './Avatar'
import { TimeAgo } from './TimeAgo'

import s from './MeowCard.module.scss'

interface MeowCardProps {
  meow: Meow
  onLike: (id: string) => void
  onRemeow?: (id: string) => void
  onReply?: (meow: Meow) => void
  onDelete?: (id: string) => void
  isOwn?: boolean
  hideComments?: boolean
}

export const MeowCard = ({
  meow,
  onLike,
  onRemeow,
  onReply,
  onDelete,
  isOwn,
  hideComments
}: MeowCardProps) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const handleCopyLink = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }
    const url = `${window.location.origin}/cat/${meow.author.username}/meow/${meow.id}`
    navigator.clipboard.writeText(url)
  }, [meow.id, meow.author.username])

  const handleReport = useCallback(() => {
    // TODO: реализовать отправку жалобы
  }, [])

  const actionItems = confirmingDelete
    ? [
        {
          label: <Trans>Да, удалить</Trans>,
          icon: Trash2,
          onClick: () => {
            onDelete?.(meow.id)
            setConfirmingDelete(false)
          },
          variant: 'danger' as const
        },
        {
          label: <Trans>Отмена</Trans>,
          icon: CircleAlert,
          onClick: () => setConfirmingDelete(false)
        }
      ]
    : [
        {
          label: <Trans>Копировать ссылку</Trans>,
          icon: Link2,
          onClick: handleCopyLink
        },
        ...(isOwn && onDelete
          ? [
              {
                label: <Trans>Удалить</Trans>,
                icon: Trash2,
                onClick: () => setConfirmingDelete(true),
                variant: 'danger' as const,
                preventClose: true
              }
            ]
          : [
              {
                label: <Trans>Пожаловаться</Trans>,
                icon: CircleAlert,
                onClick: handleReport,
                variant: 'danger' as const
              }
            ])
      ]

  // определяем контент для отображения (ремяут показывает оригинал)
  const isRemeow = !!meow.remeowOf
  const isReply = !!meow.replyTo

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
            {isReply && meow.replyTo && (
              <span className={s.replyArrow}>
                <ArrowRight size={14} />
                <Link
                  to={routes.catProfile}
                  params={{ username: meow.replyTo.author.username }}
                  className={s.replyTarget}
                >
                  {meow.replyTo.author.displayName}
                </Link>
              </span>
            )}
            {isRemeow && (
              <span className={s.remeowLabel}>
                <Repeat2 size={14} />
                {meow.author.sex === Sex.FEMALE ? (
                  <Trans>ремяутнула</Trans>
                ) : (
                  <Trans>ремяутнул</Trans>
                )}
              </span>
            )}
            <TimeAgo date={meow.createdAt} />
          </div>

          <div className={s.more}>
            <ActionSheet items={actionItems} />
          </div>
        </div>

        {/* контент мяута */}
        {meow.content && (
          <div className={s.content}>
            {highlightTildes(meow.content, s.tilde, true)}
          </div>
        )}

        {/* цитата оригинала (remeow или reply) */}
        {(isRemeow || isReply) && (meow.remeowOf || meow.replyTo) && (
          <Link
            to={routes.meowThread}
            params={{ meowId: (meow.remeowOf || meow.replyTo)!.id }}
            className={s.quoteBlock}
          >
            <div className={s.quoteTop}>
              <Avatar
                src={(meow.remeowOf || meow.replyTo)!.author.avatarUrl}
                alt=''
              />
              <div className={s.quoteMeta}>
                <span className={s.quoteAuthor}>
                  {(meow.remeowOf || meow.replyTo)!.author.displayName}
                </span>
              </div>
            </div>
            <div className={s.quoteContent}>
              {highlightTildes(
                (meow.remeowOf || meow.replyTo)!.content,
                s.tilde
              )}
            </div>
          </Link>
        )}

        {meow.imageUrl && (
          <div className={s.imageWrap}>
            <img
              className={s.image}
              src={meow.imageUrl}
              alt=''
              loading='lazy'
            />
          </div>
        )}

        <div className={s.actions}>
          {onRemeow &&
            !isOwn &&
            !isRemeow &&
            (meow.isRemeowed && meow.myRemeowId ? (
              <Link
                to={routes.meowThread}
                params={{ meowId: meow.myRemeowId }}
                className={clsx(s.action, s.remeowed)}
                aria-label='Ремяут'
              >
                <Repeat2 size={18} />
                {meow.remeowsCount > 0 && (
                  <span className={s.count}>{meow.remeowsCount}</span>
                )}
              </Link>
            ) : (
              <button
                type='button'
                className={s.action}
                aria-label='Ремяут'
                onClick={() => onRemeow(meow.id)}
              >
                <Repeat2 size={18} />
                {meow.remeowsCount > 0 && (
                  <span className={s.count}>{meow.remeowsCount}</span>
                )}
              </button>
            ))}

          {onReply &&
            !isOwn &&
            (meow.isReplied && meow.myReplyId ? (
              <Link
                to={routes.meowThread}
                params={{ meowId: meow.myReplyId }}
                className={clsx(s.action, s.replied)}
                aria-label='Ответить'
              >
                <SendHorizontal size={18} />
              </Link>
            ) : (
              <button
                type='button'
                className={s.action}
                aria-label='Ответить'
                onClick={() => onReply(meow)}
              >
                <SendHorizontal size={18} />
              </button>
            ))}

          <div className={s.actionsSpacer} />

          {!hideComments && (
            <Link
              to={routes.meowThread}
              params={{ meowId: meow.id }}
              className={s.action}
              aria-label='Комментарии'
            >
              <MessageCircle size={18} />
              {meow.commentsCount > 0 && (
                <span className={s.count}>{meow.commentsCount}</span>
              )}
            </Link>
          )}

          <button
            type='button'
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
