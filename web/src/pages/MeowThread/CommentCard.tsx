import { useCallback, useState } from 'react'
import { Link } from 'atomic-router-react'
import { Heart, Link2, CircleAlert, Trash2, BadgeCheck } from 'lucide-react'
import { Trans } from '@lingui/react/macro'
import clsx from 'clsx'

import { type Comment } from '@shared/types'

import { routes } from '@core/router'
import { highlightMentions } from '@lib/meow'

import { Avatar, TimeAgo } from '@modules/MeowCard'

import { ActionSheet } from '@ui/ActionSheet'

import s from './MeowThread.module.scss'

interface CommentCardProps {
  comment: Comment
  meowAuthorUsername: string
  meowId: string
  onReply: (username: string) => void
  onLike: (commentId: string) => void
  onDelete?: (commentId: string) => void
  isOwn?: boolean
}

export const CommentCard = ({
  comment,
  meowAuthorUsername,
  meowId,
  onReply,
  onLike,
  onDelete,
  isOwn
}: CommentCardProps) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const handleCopyLink = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }
    const url = `${window.location.origin}/cat/${meowAuthorUsername}/meow/${meowId}`
    navigator.clipboard.writeText(url)
  }, [meowAuthorUsername, meowId])

  const handleReport = useCallback(() => {
    // TODO: реализовать отправку жалобы
  }, [])

  const actionItems = confirmingDelete
    ? [
        {
          label: <Trans>Да, удалить</Trans>,
          icon: Trash2,
          onClick: () => {
            onDelete?.(comment.id)
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

  return (
    <div id={`comment-${comment.id}`} className={s.comment}>
      <div className={s.commentTop}>
        <Link
          to={routes.catProfile}
          params={{ username: comment.author.username }}
          className={s.commentAvatarLink}
        >
          <Avatar
            src={comment.author.avatarUrl}
            alt={comment.author.displayName}
          />
        </Link>
        <div className={s.commentMeta}>
          <span className={s.commentAuthorRow}>
            <Link
              to={routes.catProfile}
              params={{ username: comment.author.username }}
              className={s.commentAuthor}
            >
              {comment.author.displayName}
            </Link>
            {comment.author.verified && (
              <span className={s.commentVerified}>
                <BadgeCheck size={14} />
              </span>
            )}
          </span>
          <TimeAgo date={comment.createdAt} />
        </div>
        <div className={s.commentMore}>
          <ActionSheet items={actionItems} />
        </div>
      </div>

      <p className={s.commentContent}>
        {highlightMentions(comment.content, s.mention)}
      </p>

      <div className={s.commentActions}>
        <button
          type='button'
          className={s.replyButton}
          onClick={() => onReply(comment.author.username)}
        >
          <Trans>Ответить</Trans>
        </button>

        <button
          type='button'
          className={clsx(
            s.commentLikeButton,
            comment.isLiked && s.commentLiked
          )}
          aria-label={comment.isLiked ? 'Убрать лайк' : 'Лайк'}
          onClick={() => onLike(comment.id)}
        >
          <Heart size={18} fill={comment.isLiked ? 'currentColor' : 'none'} />
          {comment.likesCount > 0 && (
            <span className={s.commentLikeCount}>{comment.likesCount}</span>
          )}
        </button>
      </div>
    </div>
  )
}
