import './models/init'

import { useCallback } from 'react'
import { t, plural } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useUnit } from 'effector-react'
import { Link } from 'atomic-router-react'
import { LogOut, Pencil } from 'lucide-react'

import { type Meow, type MeowPreview } from '@shared/types'

import { routes } from '@core/router'
import { $session, $origin, $reverifyCooldown, logout, reverifyMutation } from '@logic/session'
import { meowDeleted, remeowToggled, replyInitiated } from '@logic/feed'
import { $weeklyTag } from '@logic/topics'

import { Layout } from '@modules/Layout'
import { MeowCard, MeowCardSkeleton, Avatar } from '@modules/MeowCard'
import { SEO } from '@ui/Seo'
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
  const [
    profile,
    meows,
    hasMore,
    pending,
    origin,
    weeklyTag,
    session,
    cooldown
  ] = useUnit([
    $profile,
    $meows,
    $hasMore,
    catMeowsQuery.$pending,
    $origin,
    $weeklyTag,
    $session,
    $reverifyCooldown
  ])
  const [
    onLoadMore,
    onFollow,
    onLike,
    onLogout,
    onDelete,
    onRemeow,
    onReply,
    onResendVerification
  ] = useUnit([
    loadMoreMeows,
    followToggled,
    meowLikeToggled,
    logout,
    meowDeleted,
    remeowToggled,
    replyInitiated,
    reverifyMutation.start
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
      {profile && (
        <>
          <meta
            name='description'
            content={profile.bio || t`Профиль @${profile.username} в Мяутере`}
          />
          <meta
            property='og:title'
            content={`${profile.displayName} (@${profile.username})`}
          />
          <meta
            property='og:description'
            content={profile.bio || t`Профиль @${profile.username} в Мяутере`}
          />
          <meta property='og:type' content='profile' />
          <meta
            property='og:url'
            content={`${origin}/cat/${profile.username}`}
          />
          {profile.avatarUrl && (
            <meta property='og:image' content={`${origin}${profile.avatarUrl}`} />
          )}
          <meta name='twitter:card' content='summary' />
          <SEO path={`/cat/${profile.username}`} />
          <script type='application/ld+json'>
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ProfilePage',
              mainEntity: {
                '@type': 'Person',
                name: profile.displayName,
                alternateName: `@${profile.username}`,
                url: `${origin}/cat/${profile.username}`,
                ...(profile.avatarUrl ? { image: profile.avatarUrl } : {}),
                ...(profile.bio ? { description: profile.bio } : {})
              }
            })}
          </script>
        </>
      )}

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
            <div className={s.emptyMeows}>
              <p className={s.emptyText}>
                <Trans>Пока нет мяутов</Trans>
              </p>
              {profile.isOwn && !session?.emailVerified && (
                <p className={s.emptyHint}>
                  <Trans>Подтвердите почту, чтобы начать мяутить. Проверьте входящие</Trans>
                  {cooldown > 0 ? (
                    <>
                      {' '}
                      <span className={s.cooldown}>
                        {Math.floor(cooldown / 60)}:{String(cooldown % 60).padStart(2, '0')}
                      </span>
                    </>
                  ) : (
                    <>
                      {' '}
                      <Trans>
                        или{' '}
                        <button
                          type='button'
                          className={s.resendBtn}
                          onClick={() => onResendVerification()}
                        >
                          отправьте письмо повторно
                        </button>
                      </Trans>
                    </>
                  )}
                </p>
              )}
              {profile.isOwn && session?.emailVerified && (
                <>
                  <p className={s.emptyHint}>
                    <Trans>
                      <Link to={routes.createMeow} className={s.emptyLink}>
                        Напиши первый мяут
                      </Link>{' '}
                      с <span className={s.highlight}>~темой</span>
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
