import { sample } from 'effector'
import { concurrency } from '@farfetched/core'

import { routes } from '@core/router'

import {
  $meows,
  $cursor,
  $hasMore,
  $currentTag,
  feedLoadMore,
  meowCreated,
  meowLikeToggled,
  meowLikeChanged,
  feedQuery,
  toggleLikeMutation
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

concurrency(feedQuery, { strategy: 'TAKE_LATEST' })
