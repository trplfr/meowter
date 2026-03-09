import './models/init'

import { useRef, useEffect } from 'react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'

import { routes } from '@core/router'
import { $session } from '@logic/session'

import { Layout } from '@modules/Layout'
import { MeowCard, MeowCardSkeleton } from '@modules/MeowCard'
import { ScrollButton } from '@ui/index'

import {
  $meow,
  $comments,
  meowLikeToggled,
  meowDeleteClicked,
  replyClicked,
  commentLikeToggled,
  commentDeleteClicked,
  meowQuery
} from './models'
import { CommentCard } from './CommentCard'
import { CommentForm } from './CommentForm'

import s from './MeowThread.module.scss'

export const route = routes.meowThread

export const MeowThread = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(0)
  const scrolledToHashRef = useRef(false)
  const [meow, commentsList, pending, session] = useUnit([
    $meow,
    $comments,
    meowQuery.$pending,
    $session
  ])
  const [onLike, onMeowDelete, onReply, onCommentLike, onCommentDelete] =
    useUnit([
      meowLikeToggled,
      meowDeleteClicked,
      replyClicked,
      commentLikeToggled,
      commentDeleteClicked
    ])

  // скролл вниз при добавлении нового комментария
  useEffect(() => {
    if (
      commentsList.length > prevCountRef.current &&
      prevCountRef.current > 0 &&
      scrollRef.current
    ) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
    prevCountRef.current = commentsList.length
  }, [commentsList.length])

  // скролл к комменту по хешу из URL (из уведомлений)
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    if (scrolledToHashRef.current || commentsList.length === 0) {
      return
    }

    const hash = window.location.hash.slice(1)
    if (!hash) {
      return
    }

    const el = document.getElementById(hash)
    if (el) {
      scrolledToHashRef.current = true
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
  }, [commentsList])

  return (
    <Layout title={<Trans>Обсуждение</Trans>} contentClassName={s.content}>
      <title>{t`Обсуждение / Мяутер`}</title>

      <div ref={scrollRef} className={s.threadScroll}>
        {!meow && pending && <MeowCardSkeleton />}

        {meow && (
          <MeowCard
            meow={meow}
            onLike={() => onLike()}
            onDelete={() => onMeowDelete()}
            isOwn={session?.id === meow.author.id}
            hideComments
          />
        )}

        <div className={s.comments}>
          {commentsList.map(comment => (
            <CommentCard
              key={comment.id}
              comment={comment}
              meowAuthorUsername={meow?.author.username || ''}
              meowId={meow?.id || ''}
              onReply={onReply}
              onLike={onCommentLike}
              onDelete={onCommentDelete}
              isOwn={session?.id === comment.author.id}
            />
          ))}

          {meow && commentsList.length === 0 && !pending && (
            <div className={s.emptyComments}>
              <Trans>Пока нет комментариев</Trans>
            </div>
          )}
        </div>

        <ScrollButton scrollRef={scrollRef} />
      </div>

      <CommentForm />
    </Layout>
  )
}
