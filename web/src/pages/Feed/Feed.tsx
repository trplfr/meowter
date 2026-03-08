import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Helmet } from 'react-helmet-async'
import { useUnit } from 'effector-react'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

import { routes } from '@core/router'
import {
  $meows,
  $hasMore,
  feedLoaded,
  feedLoadMore,
  meowLikeToggled,
  fetchFeedFx
} from '@logic/feed'

import { AuthLayout } from '@modules/AuthLayout'
import { MeowCard, MeowCardSkeleton } from '@modules/MeowCard'

import s from './Feed.module.scss'

export const route = routes.feed

export const Feed = () => {
  const [meows, hasMore, pending] = useUnit([$meows, $hasMore, fetchFeedFx.pending])
  const [onLoad, onLoadMore, onLike] = useUnit([feedLoaded, feedLoadMore, meowLikeToggled])

  const { ref, inView } = useInView({ threshold: 0 })

  useEffect(() => {
    onLoad()
  }, [])

  useEffect(() => {
    if (inView && hasMore && !pending) {
      onLoadMore()
    }
  }, [inView, hasMore, pending])

  return (
    <AuthLayout title={<Trans>Лента</Trans>} contentClassName={s.content}>
      <Helmet>
        <title>{t`Лента / Мяутер`}</title>
      </Helmet>

      <div className={s.list}>
        {pending && meows.length === 0 && (
          <>
            <MeowCardSkeleton />
            <MeowCardSkeleton />
            <MeowCardSkeleton />
            <MeowCardSkeleton />
          </>
        )}

        {!pending && meows.length === 0 && (
          <div className={s.empty}>
            <Trans>Напишите свой первый мяут с ~темой, чтобы открыть ленту!</Trans>
          </div>
        )}

        {meows.map((meow) => (
          <MeowCard key={meow.id} meow={meow} onLike={onLike} />
        ))}

        {hasMore && (
          <div ref={ref} className={s.sentinel} />
        )}
      </div>
    </AuthLayout>
  )
}
