import './models/init'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'

import { routes } from '@core/router'

import { Layout } from '@modules/Layout'
import { MeowCard, MeowCardSkeleton } from '@modules/MeowCard'

import {
  $meow,
  $comments,
  meowLikeToggled,
  replyClicked,
  commentLikeToggled,
  meowQuery
} from './models'
import { CommentCard } from './CommentCard'
import { CommentForm } from './CommentForm'

import s from './MeowThread.module.scss'

export const route = routes.meowThread

export const MeowThread = () => {
  const [meow, commentsList, pending] = useUnit([$meow, $comments, meowQuery.$pending])
  const [onLike, onReply, onCommentLike] = useUnit([
    meowLikeToggled,
    replyClicked,
    commentLikeToggled
  ])

  return (
    <Layout title={<Trans>Обсуждение</Trans>} contentClassName={s.content}>
      <title>{t`Обсуждение / Мяутер`}</title>

      <div className={s.threadScroll}>
        {!meow && pending && <MeowCardSkeleton />}

        {meow && (
          <MeowCard meow={meow} onLike={() => onLike()} />
        )}

        <div className={s.comments}>
          {commentsList.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              meowAuthorUsername={meow?.author.username || ''}
              meowId={meow?.id || ''}
              onReply={onReply}
              onLike={onCommentLike}
            />
          ))}

          {meow && commentsList.length === 0 && !pending && (
            <div className={s.emptyComments}>
              <Trans>Пока нет комментариев</Trans>
            </div>
          )}
        </div>
      </div>

      <CommentForm />
    </Layout>
  )
}
