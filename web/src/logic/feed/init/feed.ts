import { sample } from 'effector'
import { redirect } from 'atomic-router'
import { concurrency } from '@farfetched/core'
import { t } from '@lingui/core/macro'

import { routes } from '@core/router'
import { showSuccessToastFx } from '@logic/notifications'
import { $session } from '@logic/session'

import {
  $meows,
  $cursor,
  $hasMore,
  $currentTag,
  feedLoadMore,
  meowCreated,
  meowLikeToggled,
  meowDeleted,
  remeowToggled,
  meowLikeChanged,
  meowDeletedGlobal,
  remeowChanged,
  feedQuery,
  toggleLikeMutation,
  deleteMeowMutation,
  remeowMutation
} from '../models'

// загрузка первой страницы при открытии роута
sample({
  clock: routes.feed.opened,
  fn: () => ({}),
  target: feedQuery.start
})

// загрузка следующей страницы
sample({
  clock: feedLoadMore,
  source: {
    cursor: $cursor,
    tag: $currentTag
  },
  filter: ({ cursor }) => cursor !== null,
  fn: ({ cursor, tag }) => ({
    cursor: cursor!,
    tag: tag || undefined
  }),
  target: feedQuery.start
})

// сохраняем текущий тег из ответа
sample({
  clock: feedQuery.finished.success,
  fn: ({ result }) => result.tag,
  target: $currentTag
})

// первая загрузка = замена, подгрузка = добавление
sample({
  clock: feedQuery.finished.success,
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
  clock: feedQuery.finished.success,
  fn: ({ result }) => result.cursor,
  target: $cursor
})

sample({
  clock: feedQuery.finished.success,
  fn: ({ result }) => result.hasMore,
  target: $hasMore
})

// новый мяут: оптимистичное добавление + перезагрузка фида для обновления тегов
sample({
  clock: meowCreated,
  source: $meows,
  fn: (meows, meow) => [meow, ...meows],
  target: $meows
})

sample({
  clock: meowCreated,
  fn: () => null,
  target: [$cursor, $currentTag]
})

sample({
  clock: meowCreated,
  fn: () => ({}),
  target: feedQuery.start
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

// стреляем глобальный лайк для синхронизации других страниц (ДО оптимистичного апдейта)
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

/* Delete */

sample({
  clock: meowDeleted,
  target: deleteMeowMutation.start
})

// оптимистичное удаление из списка
sample({
  clock: meowDeleted,
  source: $meows,
  fn: (meows, meowId) => meows.filter((m) => m.id !== meowId),
  target: $meows
})

// глобальный синк удаления
sample({
  clock: meowDeleted,
  target: meowDeletedGlobal
})

sample({
  clock: deleteMeowMutation.finished.success,
  fn: () => t`Удалено!`,
  target: showSuccessToastFx
})

// слушаем удаления из других страниц
sample({
  clock: meowDeletedGlobal,
  source: $meows,
  fn: (meows, meowId) => meows.filter((m) => m.id !== meowId),
  target: $meows
})

/* Remeow */

sample({
  clock: remeowToggled,
  target: remeowMutation.start
})

// стреляем глобальный remeow (ДО оптимистичного апдейта)
sample({
  clock: remeowToggled,
  source: $meows,
  fn: (meows, meowId) => {
    const meow = meows.find((m) => m.id === meowId)
    if (!meow) {
      return { meowId, isRemeowed: true, remeowsCount: 1, myRemeowId: null }
    }
    return {
      meowId,
      isRemeowed: true,
      remeowsCount: meow.remeowsCount + 1,
      myRemeowId: null
    }
  },
  target: remeowChanged
})

// оптимистичный апдейт ремяута
sample({
  clock: remeowToggled,
  source: $meows,
  fn: (meows, meowId) =>
    meows.map((m) => {
      if (m.id !== meowId) {
        return m
      }
      return {
        ...m,
        isRemeowed: true,
        remeowsCount: m.remeowsCount + 1
      }
    }),
  target: $meows
})

// обновляем myRemeowId из ответа сервера
sample({
  clock: remeowMutation.finished.success,
  source: $meows,
  fn: (meows, { params: originalMeowId, result: remeow }) =>
    meows.map((m) => {
      if (m.id !== originalMeowId) {
        return m
      }
      return { ...m, myRemeowId: remeow.id }
    }),
  target: $meows
})

sample({
  clock: remeowMutation.finished.success,
  fn: () => t`Ремяут!`,
  target: showSuccessToastFx
})

// редирект на профиль после ремяута
sample({
  clock: remeowMutation.finished.success,
  source: $session,
  filter: (session) => session !== null,
  fn: (session) => ({ username: session!.username }),
  target: routes.catProfile.open
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

concurrency(feedQuery, { strategy: 'TAKE_LATEST' })
