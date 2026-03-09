import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'

import { routes } from '@core/router'
import {
  $meows,
  $hasMore,
  feedLoadMore,
  meowLikeToggled,
  feedQuery
} from '@logic/feed'

import { AuthLayout } from '@modules/AuthLayout'
import { MeowCard, MeowCardSkeleton } from '@modules/MeowCard'
import { VirtualList } from '@ui/VirtualList'

import s from './Feed.module.scss'

export const route = routes.feed

export const Feed = () => {
  const [meows, hasMore, pending] = useUnit([$meows, $hasMore, feedQuery.$pending])
  const [onLoadMore, onLike] = useUnit([feedLoadMore, meowLikeToggled])

  return (
    <AuthLayout title={<Trans>Лента</Trans>} contentClassName={s.content}>
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
            <MeowCard key={meow.id} meow={meow} onLike={onLike} />
          )}
        />
      )}
    </AuthLayout>
  )
}
