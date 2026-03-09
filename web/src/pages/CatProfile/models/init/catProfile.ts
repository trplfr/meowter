import { sample } from 'effector'
import { concurrency } from '@farfetched/core'

import { routes } from '@core/router'
import { meowCreated, meowLikeChanged, followChanged, meowDeletedGlobal, remeowChanged } from '@logic/feed'
import { $session } from '@logic/session'

import {
  $profile,
  $meows,
  $cursor,
  $hasMore,
  profilePageOpened,
  loadMoreMeows,
  followToggled,
  meowLikeToggled,
  profileQuery,
  catMeowsQuery,
  toggleFollowMutation,
  toggleLikeMutation
} from '../models'

// проброс из роута в событие модели (с обработкой /me и /cat/me)
sample({
  clock: [routes.catProfile.opened, routes.catProfile.updated],
  source: $session,
  filter: (session, { params }) => {
    const username = params.username && params.username !== 'me'
      ? params.username
      : session?.username
    return Boolean(username)
  },
  fn: (session, { params }) => {
    if (!params.username || params.username === 'me') {
      return session!.username
    }
    return params.username
  },
  target: profilePageOpened
})

// сброс при открытии нового профиля
sample({
  clock: profilePageOpened,
  fn: () => null,
  target: [$profile, $cursor]
})

sample({
  clock: profilePageOpened,
  fn: (): never[] => [],
  target: $meows
})

sample({
  clock: profilePageOpened,
  fn: () => true,
  target: $hasMore
})

// свой профиль -> берем из сессии, чужой -> запрос
sample({
  clock: profilePageOpened,
  source: $session,
  filter: (session, username) => session !== null && session.username === username,
  fn: (session) => session!,
  target: $profile
})

sample({
  clock: profilePageOpened,
  source: $session,
  filter: (session, username) => !session || session.username !== username,
  fn: (_, username) => username,
  target: profileQuery.start
})

// мяуты всегда запрашиваем
sample({
  clock: profilePageOpened,
  fn: (username) => ({ username }),
  target: catMeowsQuery.start
})

// профиль загружен (чужой)
sample({
  clock: profileQuery.finished.success,
  fn: ({ result }) => result,
  target: $profile
})

// мяуты загружены
sample({
  clock: catMeowsQuery.finished.success,
  source: {
    meows: $meows,
    cursor: $cursor
  },
  fn: ({ meows, cursor }, { result }) => {
    if (!cursor) {
      return result.data
    }
    return [...meows, ...result.data]
  },
  target: $meows
})

sample({
  clock: catMeowsQuery.finished.success,
  fn: ({ result }) => result.cursor,
  target: $cursor
})

sample({
  clock: catMeowsQuery.finished.success,
  fn: ({ result }) => result.hasMore,
  target: $hasMore
})

// подгрузка
sample({
  clock: loadMoreMeows,
  source: {
    profile: $profile,
    cursor: $cursor
  },
  filter: ({ profile, cursor }) => profile !== null && cursor !== null,
  fn: ({ profile, cursor }) => ({
    username: profile!.username,
    cursor: cursor!
  }),
  target: catMeowsQuery.start
})

// новый мяут добавляем в начало, если смотрим свой профиль
sample({
  clock: meowCreated,
  source: {
    profile: $profile,
    meows: $meows
  },
  filter: ({ profile }) => profile !== null && profile.isOwn,
  fn: ({ meows }, meow) => [meow, ...meows],
  target: $meows
})

// toggle follow
sample({
  clock: followToggled,
  source: $profile,
  filter: (profile) => profile !== null,
  fn: (profile) => ({
    username: profile!.username,
    isFollowing: profile!.isFollowing
  }),
  target: toggleFollowMutation.start
})

// оптимистичный апдейт follow
sample({
  clock: followToggled,
  source: $profile,
  filter: (profile) => profile !== null,
  fn: (profile) => ({
    ...profile!,
    isFollowing: !profile!.isFollowing,
    followersCount: profile!.isFollowing
      ? profile!.followersCount - 1
      : profile!.followersCount + 1
  }),
  target: $profile
})

// стреляем followChanged для обновления $session
// $profile уже обновлен оптимистично, isFollowing = новое значение
sample({
  clock: followToggled,
  source: $profile,
  filter: (profile) => profile !== null,
  fn: (profile) => ({
    delta: profile!.isFollowing ? 1 : -1
  }),
  target: followChanged
})

// toggle лайка
sample({
  clock: meowLikeToggled,
  source: $meows,
  fn: (meows, meowId) => {
    const meow = meows.find((m) => m.id === meowId)
    if (!meow) {
      return { meowId, isLiked: false }
    }
    return { meowId, isLiked: meow.isLiked }
  },
  target: toggleLikeMutation.start
})

// стреляем глобальный лайк (ДО оптимистичного апдейта, иначе $meows уже обновлен)
sample({
  clock: meowLikeToggled,
  source: $meows,
  fn: (meows, meowId) => {
    const meow = meows.find((m) => m.id === meowId)
    if (!meow) {
      return { meowId, isLiked: false, likesCount: 0 }
    }
    return {
      meowId,
      isLiked: !meow.isLiked,
      likesCount: meow.isLiked ? meow.likesCount - 1 : meow.likesCount + 1
    }
  },
  target: meowLikeChanged
})

// оптимистичный апдейт лайка (ПОСЛЕ meowLikeChanged)
sample({
  clock: meowLikeToggled,
  source: $meows,
  fn: (meows, meowId) =>
    meows.map((m) => {
      if (m.id !== meowId) {
        return m
      }
      return {
        ...m,
        isLiked: !m.isLiked,
        likesCount: m.isLiked ? m.likesCount - 1 : m.likesCount + 1
      }
    }),
  target: $meows
})

// слушаем лайки из других страниц (пропускаем если уже актуально)
sample({
  clock: meowLikeChanged,
  source: $meows,
  filter: (meows, { meowId, isLiked }) => {
    const meow = meows.find((m) => m.id === meowId)
    return meow !== undefined && meow.isLiked !== isLiked
  },
  fn: (meows, { meowId, isLiked, likesCount }) =>
    meows.map((m) => {
      if (m.id !== meowId) {
        return m
      }
      return { ...m, isLiked, likesCount }
    }),
  target: $meows
})

// слушаем глобальное удаление мяутов
sample({
  clock: meowDeletedGlobal,
  source: $meows,
  fn: (meows, meowId) => meows.filter((m) => m.id !== meowId),
  target: $meows
})

// слушаем remeow из других страниц
sample({
  clock: remeowChanged,
  source: $meows,
  filter: (meows, { meowId }) => meows.some((m) => m.id === meowId),
  fn: (meows, { meowId, isRemeowed, remeowsCount, myRemeowId }) =>
    meows.map((m) => {
      if (m.id !== meowId) {
        return m
      }
      return { ...m, isRemeowed, remeowsCount, myRemeowId }
    }),
  target: $meows
})

concurrency(catMeowsQuery, { strategy: 'TAKE_LATEST' })
concurrency(profileQuery, { strategy: 'TAKE_LATEST' })
