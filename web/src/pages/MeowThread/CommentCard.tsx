import { Link } from 'atomic-router-react'
import { Heart } from 'lucide-react'
import { Trans } from '@lingui/react/macro'
import clsx from 'clsx'

import { type Comment } from '@shared/types'

import { routes } from '@core/router'

import { Avatar, TimeAgo } from '@modules/MeowCard'

import s from './MeowThread.module.scss'

interface CommentCardProps {
  comment: Comment
  onReply: (username: string) => void
  onLike: (commentId: string) => void
}

export const CommentCard = ({ comment, onReply, onLike }: CommentCardProps) => {
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
