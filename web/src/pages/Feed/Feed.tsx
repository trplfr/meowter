import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'

import { type Meow, type MeowPreview } from '@shared/types'

import { routes } from '@core/router'
import { $session } from '@logic/session'
import {
  $meows,
  $hasMore,
  feedLoadMore,
  meowLikeToggled,
  meowDeleted,
  remeowToggled,
  replyInitiated,
  feedQuery
} from '@logic/feed'

import { Layout } from '@modules/Layout'
import { MeowCard, MeowCardSkeleton } from '@modules/MeowCard'
import { VirtualList } from '@ui/VirtualList'

import s from './Feed.module.scss'

export const route = routes.feed

export const Feed = () => {
  const [meows, hasMore, pending, session] = useUnit([$meows, $hasMore, feedQuery.$pending, $session])
  const [onLoadMore, onLike, onDelete, onRemeow, onReply] = useUnit([
    feedLoadMore, meowLikeToggled, meowDeleted, remeowToggled, replyInitiated
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

  return (
    <Layout title={<Trans>Лента</Trans>} contentClassName={s.content}>
      <title>{t`Лента / Мяутер`}</title>

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
          <Trans>Напишите свой первый мяут с ~темой, чтобы открыть ленту!</Trans>
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
          renderItem={(meow) => (
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
