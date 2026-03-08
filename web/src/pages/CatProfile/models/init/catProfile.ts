import { sample } from 'effector'

import { meowCreated, meowLikeChanged, followChanged } from '@logic/feed'
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
  fetchProfileFx,
  fetchMeowsFx,
  toggleFollowFx,
  toggleMeowLikeFx
} from '../models'

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
  target: fetchProfileFx
})

// мяуты всегда запрашиваем
sample({
  clock: profilePageOpened,
  fn: (username) => ({ username }),
  target: fetchMeowsFx
})

// профиль загружен (чужой)
sample({
  clock: fetchProfileFx.doneData,
  target: $profile
})

// мяуты загружены
sample({
  clock: fetchMeowsFx.doneData,
  source: {
    meows: $meows,
    cursor: $cursor
  },
  fn: ({ meows, cursor }, response) => {
    if (!cursor) {
      return response.data
    }
    return [...meows, ...response.data]
  },
  target: $meows
})

sample({
  clock: fetchMeowsFx.doneData,
  fn: (response) => response.cursor,
  target: $cursor
})

sample({
  clock: fetchMeowsFx.doneData,
  fn: (response) => response.hasMore,
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
  target: fetchMeowsFx
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
  target: toggleFollowFx
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
  target: toggleMeowLikeFx
})

// оптимистичный апдейт лайка
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

// стреляем глобальный лайк
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
