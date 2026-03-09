import { useCallback } from 'react'
import { Link } from 'atomic-router-react'
import { Heart, Link2, CircleAlert } from 'lucide-react'
import { Trans } from '@lingui/react/macro'
import clsx from 'clsx'

import { type Comment } from '@shared/types'

import { routes } from '@core/router'

import { Avatar, TimeAgo } from '@modules/MeowCard'

import { ActionSheet } from '@ui/ActionSheet'

import s from './MeowThread.module.scss'

interface CommentCardProps {
  comment: Comment
  meowAuthorUsername: string
  meowId: string
  onReply: (username: string) => void
  onLike: (commentId: string) => void
}

export const CommentCard = ({ comment, meowAuthorUsername, meowId, onReply, onLike }: CommentCardProps) => {
  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/cat/${meowAuthorUsername}/meow/${meowId}`
    navigator.clipboard.writeText(url)
  }, [meowAuthorUsername, meowId])

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
    <div className={s.comment}>
      <div className={s.commentTop}>
        <Link
          to={routes.catProfile}
          params={{ username: comment.author.username }}
          className={s.commentAvatarLink}
        >
          <Avatar src={comment.author.avatarUrl} alt={comment.author.displayName} />
        </Link>
        <div className={s.commentMeta}>
          <Link
            to={routes.catProfile}
            params={{ username: comment.author.username }}
            className={s.commentAuthor}
          >
            {comment.author.displayName}
          </Link>
          <TimeAgo date={comment.createdAt} />
        </div>
        <div className={s.commentMore}>
          <ActionSheet items={actionItems} />
        </div>
      </div>

      <p className={s.commentContent}>{comment.content}</p>

      <div className={s.commentActions}>
        <button
          type="button"
          className={s.replyButton}
          onClick={() => onReply(comment.author.username)}
        >
          <Trans>Ответить</Trans>
        </button>

        <button
          type="button"
          className={clsx(s.commentLikeButton, comment.isLiked && s.commentLiked)}
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
