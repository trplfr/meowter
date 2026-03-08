import './models/init'

import { useCallback, useEffect } from 'react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Helmet } from 'react-helmet-async'
import { useUnit } from 'effector-react'
import { useInView } from 'react-intersection-observer'

import { routes } from '@core/router'
import { $session } from '@logic/session'

import { AuthLayout } from '@modules/AuthLayout'
import { MeowCard, MeowCardSkeleton, Avatar } from '@modules/MeowCard'
import { Skeleton } from '@ui/Skeleton'

import {
  $profile,
  $meows,
  $hasMore,
  profilePageOpened,
  loadMoreMeows,
  followToggled,
  meowLikeToggled,
  fetchMeowsFx
} from './models'

import s from './CatProfile.module.scss'

export const route = routes.catProfile

export const CatProfile = () => {
  const [profile, meows, hasMore, pending, session] = useUnit([
    $profile, $meows, $hasMore, fetchMeowsFx.pending, $session
  ])
  const [onOpen, onLoadMore, onFollow, onLike] = useUnit([
    profilePageOpened, loadMoreMeows, followToggled, meowLikeToggled
  ])

  const params = useUnit(routes.catProfile.$params)
  const { ref, inView } = useInView({ threshold: 0 })

  useEffect(() => {
    // /me или /cat/me -> подставляем свой username
    const username = (!params.username || params.username === 'me') && session
      ? session.username
      : params.username

    if (username) {
      onOpen(username)
    }
  }, [params.username])

  useEffect(() => {
    if (inView && hasMore && !pending) {
      onLoadMore()
    }
  }, [inView, hasMore, pending])

  const handleCopyContacts = useCallback(() => {
    if (profile?.contacts) {
      navigator.clipboard.writeText(profile.contacts)
    }
  }, [profile?.contacts])

  const title = profile ? `@${profile.username}` : ''
  const fullName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : profile?.displayName || ''

  return (
    <AuthLayout title={title} contentClassName={s.content}>
      <Helmet>
        <title>{profile ? t`${profile.displayName} / Мяутер` : t`Профиль / Мяутер`}</title>
      </Helmet>

      {!profile && (
        <div className={s.header}>
          <div className={s.avatarWrap}>
            <Skeleton width={140} height={140} borderRadius="50%" />
          </div>
          <Skeleton width={180} height={20} />
          <Skeleton width={240} height={14} />
          <div className={s.stats}>
            <Skeleton width={60} height={30} />
            <Skeleton width={60} height={30} />
          </div>
        </div>
      )}

      {profile && (
        <>
          <div className={s.header}>
            <div className={s.avatarWrap}>
              <Avatar src={profile.avatarUrl} alt={profile.displayName} />
            </div>

            <h2 className={s.name}>{fullName}</h2>

            {profile.bio && (
              <p className={s.bio}>{profile.bio}</p>
            )}

            {profile.contacts && (
              <button className={s.contacts} onClick={handleCopyContacts}>
                {profile.contacts}
              </button>
            )}

            <div className={s.stats}>
              <div className={s.stat}>
                <span className={s.statCount}>{profile.followingCount}</span>
                <span className={s.statLabel}><Trans>читает</Trans></span>
              </div>
              <div className={s.stat}>
                <span className={s.statCount}>{profile.followersCount}</span>
                <span className={s.statLabel}><Trans>читателя</Trans></span>
              </div>
            </div>

            {!profile.isOwn && (
              <button
                className={profile.isFollowing ? s.unfollowButton : s.followButton}
                onClick={() => onFollow()}
              >
                {profile.isFollowing
                  ? <Trans>Отписаться</Trans>
                  : <Trans>Подписаться</Trans>
                }
              </button>
            )}
          </div>

          <div className={s.meows}>
            {meows.map((meow) => (
              <MeowCard key={meow.id} meow={meow} onLike={onLike} />
            ))}

            {meows.length === 0 && !pending && (
              <div className={s.empty}>
                <Trans>Пока нет мяутов</Trans>
              </div>
            )}

            {hasMore && (
              <div ref={ref} className={s.sentinel} />
            )}
          </div>
        </>
      )}

      {!profile && (
        <div className={s.meows}>
          <MeowCardSkeleton />
          <MeowCardSkeleton />
          <MeowCardSkeleton />
        </div>
      )}
    </AuthLayout>
  )
}
