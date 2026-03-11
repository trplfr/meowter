import './models/init'

import { useRef, useEffect } from 'react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'

import { routes } from '@core/router'
import { $origin, $session } from '@logic/session'

import { Layout } from '@modules/Layout'
import { MeowCard, MeowCardSkeleton } from '@modules/MeowCard'
import { SEO } from '@ui/Seo'
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
  const [meow, commentsList, pending, session, origin] = useUnit([
    $meow,
    $comments,
    meowQuery.$pending,
    $session,
    $origin
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
      <title>
        {meow
          ? t`${meow.author.displayName}: ${meow.content.slice(0, 60)} / Мяутер`
          : t`Обсуждение / Мяутер`}
      </title>
      {meow && (
        <>
          <meta name='description' content={meow.content.slice(0, 160)} />
          <meta property='og:title' content={`${meow.author.displayName} в Мяутере`} />
          <meta property='og:description' content={meow.content.slice(0, 160)} />
          <meta property='og:type' content='article' />
          <meta property='og:url' content={`${origin}/meow/${meow.id}`} />
          {meow.imageUrl && <meta property='og:image' content={`${origin}${meow.imageUrl}`} />}
          {meow.author.avatarUrl && !meow.imageUrl && (
            <meta property='og:image' content={`${origin}${meow.author.avatarUrl}`} />
          )}
          <meta name='twitter:card' content={meow.imageUrl ? 'summary_large_image' : 'summary'} />
          <SEO path={`/meow/${meow.id}`} />
          <script type='application/ld+json'>
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SocialMediaPosting',
              headline: meow.content.slice(0, 110),
              articleBody: meow.content,
              author: {
                '@type': 'Person',
                name: meow.author.displayName,
                url: `${origin}/cat/${meow.author.username}`
              },
              datePublished: meow.createdAt,
              dateModified: meow.updatedAt,
              url: `${origin}/meow/${meow.id}`,
              interactionStatistic: [
                {
                  '@type': 'InteractionCounter',
                  interactionType: 'https://schema.org/LikeAction',
                  userInteractionCount: meow.likesCount
                },
                {
                  '@type': 'InteractionCounter',
                  interactionType: 'https://schema.org/CommentAction',
                  userInteractionCount: meow.commentsCount
                }
              ],
              ...(meow.imageUrl ? { image: meow.imageUrl } : {})
            })}
          </script>
        </>
      )}

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
