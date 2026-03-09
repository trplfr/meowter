import './models/init'

import { useCallback } from 'react'
import { t, plural } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'
import { Link } from 'atomic-router-react'
import { LogOut, Pencil } from 'lucide-react'

import { type Meow, type MeowPreview } from '@shared/types'

import { routes } from '@core/router'
import { logout } from '@logic/session'
import { meowDeleted, remeowToggled, replyInitiated } from '@logic/feed'

import { Layout } from '@modules/Layout'
import { MeowCard, MeowCardSkeleton, Avatar } from '@modules/MeowCard'
import { Skeleton } from '@ui/Skeleton'
import { VirtualList } from '@ui/VirtualList'

import {
  $profile,
  $meows,
  $hasMore,
  loadMoreMeows,
  followToggled,
  meowLikeToggled,
  catMeowsQuery
} from './models'

import s from './CatProfile.module.scss'

export const route = routes.catProfile

export const CatProfile = () => {
  const [profile, meows, hasMore, pending] = useUnit([
    $profile,
    $meows,
    $hasMore,
    catMeowsQuery.$pending
  ])
  const [onLoadMore, onFollow, onLike, onLogout, onDelete, onRemeow, onReply] =
    useUnit([
      loadMoreMeows,
      followToggled,
      meowLikeToggled,
      logout,
      meowDeleted,
      remeowToggled,
      replyInitiated
    ])

  const handleCopyContacts = useCallback(() => {
    if (profile?.contacts) {
      navigator.clipboard.writeText(profile.contacts)
    }
  }, [profile?.contacts])

  const handleReply = useCallback(
    (meow: Meow) => {
      const preview: MeowPreview = {
        id: meow.id,
        content: meow.content,
        imageUrl: meow.imageUrl,
        author: meow.author,
        createdAt: meow.createdAt
      }
      onReply(preview)
    },
    [onReply]
  )

  const renderMeow = useCallback(
    (meow: Meow) => (
      <MeowCard
        meow={meow}
        onLike={onLike}
        onDelete={onDelete}
        onRemeow={onRemeow}
        onReply={handleReply}
        isOwn={profile?.isOwn || false}
      />
    ),
    [onLike, onDelete, onRemeow, handleReply, profile?.isOwn]
  )

  const title = profile ? `@${profile.username}` : ''
  const fullName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile?.displayName || ''

  const headerAction = profile?.isOwn ? (
    <button
      type='button'
      className={s.logoutButton}
      aria-label='Выйти'
      onClick={() => onLogout()}
    >
      <LogOut size={22} />
    </button>
  ) : undefined

  return (
    <Layout
      title={title}
      contentClassName={s.content}
      headerAction={headerAction}
    >
      <title>
        {profile ? t`${profile.displayName} / Мяутер` : t`Профиль / Мяутер`}
      </title>

      {!profile && (
        <div className={s.header}>
          <div className={s.avatarWrap}>
            <Skeleton width={140} height={140} borderRadius='50%' />
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
              {profile.isOwn && (
                <Link
                  to={routes.settings}
                  className={s.avatarEdit}
                  aria-label='Настройки'
                >
                  <Pencil size={18} />
                </Link>
              )}
            </div>

            <h2 className={s.name}>{fullName}</h2>

            {profile.bio && <p className={s.bio}>{profile.bio}</p>}

            {profile.contacts && (
              <button className={s.contacts} onClick={handleCopyContacts}>
                {profile.contacts}
              </button>
            )}

            <div className={s.stats}>
              <div className={s.stat}>
                <span className={s.statCount}>{profile.followingCount}</span>
                <span className={s.statLabel}>
                  <Trans>читает</Trans>
                </span>
              </div>
              <div className={s.stat}>
                <span className={s.statCount}>{profile.followersCount}</span>
                <span className={s.statLabel}>
                  {plural(profile.followersCount, {
                    one: 'читатель',
                    few: 'читателя',
                    many: 'читателей',
                    other: 'читателей'
                  })}
                </span>
              </div>
            </div>

            {!profile.isOwn && (
              <button
                className={
                  profile.isFollowing ? s.unfollowButton : s.followButton
                }
                onClick={() => onFollow()}
              >
                {profile.isFollowing ? (
                  <Trans>Отписаться</Trans>
                ) : (
                  <Trans>Подписаться</Trans>
                )}
              </button>
            )}
          </div>

          {meows.length === 0 && !pending && (
            <div className={s.empty}>
              <Trans>Пока нет мяутов</Trans>
            </div>
          )}

          {meows.length > 0 && (
            <VirtualList
              items={meows}
              estimateSize={120}
              hasMore={hasMore}
              pending={pending}
              onLoadMore={onLoadMore}
              renderItem={renderMeow}
              className={s.virtualList}
            />
          )}
        </>
      )}

      {!profile && (
        <div className={s.meows}>
          <MeowCardSkeleton />
          <MeowCardSkeleton />
          <MeowCardSkeleton />
        </div>
      )}
    </Layout>
  )
}
