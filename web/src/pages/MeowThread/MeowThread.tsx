import './models/init'

import { useEffect } from 'react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Helmet } from 'react-helmet-async'
import { useUnit } from 'effector-react'

import { routes } from '@core/router'

import { AuthLayout } from '@modules/AuthLayout'
import { MeowCard, MeowCardSkeleton } from '@modules/MeowCard'

import {
  $meow,
  $comments,
  threadOpened,
  meowLikeToggled,
  replyClicked,
  commentLikeToggled,
  fetchMeowFx
} from './models'
import { CommentCard } from './CommentCard'
import { CommentForm } from './CommentForm'

import s from './MeowThread.module.scss'

export const route = routes.meowThread

export const MeowThread = () => {
  const [meow, commentsList, pending] = useUnit([$meow, $comments, fetchMeowFx.pending])
  const [onOpen, onLike, onReply, onCommentLike] = useUnit([
    threadOpened,
    meowLikeToggled,
    replyClicked,
    commentLikeToggled
  ])

  const params = useUnit(routes.meowThread.$params)

  useEffect(() => {
    if (params.meowId) {
      onOpen(params.meowId)
    }
  }, [params.meowId])

  return (
    <AuthLayout title={<Trans>Обсуждение</Trans>} contentClassName={s.content} backButton>
      <Helmet>
        <title>{t`Обсуждение / Мяутер`}</title>
      </Helmet>

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
    </AuthLayout>
  )
}
