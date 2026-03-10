import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'

import { type Meow, type MeowPreview } from '@shared/types'

import { routes } from '@core/router'
import { Link } from 'atomic-router-react'
import { $session } from '@logic/session'
import {
  $meows,
  $hasMore,
  $currentTag,
  feedLoadMore,
  meowLikeToggled,
  meowDeleted,
  remeowToggled,
  replyInitiated,
  feedQuery
} from '@logic/feed'
import { $weeklyTag } from '@logic/topics'

import { Layout } from '@modules/Layout'
import { MeowCard, MeowCardSkeleton } from '@modules/MeowCard'
import { VirtualList } from '@ui/VirtualList'

import s from './Feed.module.scss'

export const route = routes.feed

export const Feed = () => {
  const [meows, hasMore, pending, session, currentTag, weeklyTag] = useUnit([
    $meows,
    $hasMore,
    feedQuery.$pending,
    $session,
    $currentTag,
    $weeklyTag
  ])
  const [onLoadMore, onLike, onDelete, onRemeow, onReply] = useUnit([
    feedLoadMore,
    meowLikeToggled,
    meowDeleted,
    remeowToggled,
    replyInitiated
  ])

  const handleReply = (meow: Meow) => {
    const preview: MeowPreview = {
      id: meow.id,
      content: meow.content,
      imageUrl: meow.imageUrl,
      author: meow.author,
      createdAt: meow.createdAt
    }
    onReply(preview)
  }

  const title = currentTag ? <span>~{currentTag}</span> : <Trans>Лента</Trans>

  return (
    <Layout title={title} contentClassName={s.content}>
      <title>
        {currentTag ? t`~${currentTag} / Мяутер` : t`Лента / Мяутер`}
      </title>
      <meta name='robots' content='noindex' />

      {pending && meows.length === 0 && (
        <div className={s.skeletons}>
          <MeowCardSkeleton />
          <MeowCardSkeleton />
          <MeowCardSkeleton />
          <MeowCardSkeleton />
        </div>
      )}

      {!pending && meows.length === 0 && (
        <div className={s.empty}>
          {currentTag ? (
            <Trans>Пока нет мяутов по теме ~{currentTag}</Trans>
          ) : (
            <>
              <p className={s.emptyText}>
                <Trans>
                  <Link to={routes.createMeow} className={s.emptyLink}>
                    Напиши свой первый мяут
                  </Link>
                  <br />
                  используя <span className={s.highlight}>~тильду</span>, чтобы
                  открыть ленту!
                </Trans>
              </p>
              {weeklyTag && (
                <p className={s.weeklyHint}>
                  <Trans>
                    или{' '}
                    <a
                      className={s.weeklyLink}
                      href={`/feed?theme=${weeklyTag}`}
                    >
                      почитай тему недели: 🔥{' '}
                      <span className={s.highlight}>~{weeklyTag}</span>
                    </a>
                  </Trans>
                </p>
              )}
            </>
          )}
        </div>
      )}

      {meows.length > 0 && (
        <VirtualList
          items={meows}
          estimateSize={120}
          hasMore={hasMore}
          pending={pending}
          onLoadMore={onLoadMore}
          className={s.list}
          renderItem={meow => (
            <MeowCard
              key={meow.id}
              meow={meow}
              onLike={onLike}
              onDelete={onDelete}
              onRemeow={onRemeow}
              onReply={handleReply}
              isOwn={session?.id === meow.author.id}
            />
          )}
        />
      )}
    </Layout>
  )
}
