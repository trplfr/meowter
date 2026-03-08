import { sample } from 'effector'

import {
  $meows,
  $cursor,
  $hasMore,
  $currentTag,
  feedLoaded,
  feedLoadMore,
  meowCreated,
  meowLikeToggled,
  meowLikeChanged,
  fetchFeedFx,
  toggleLikeFx
} from '../models'

// загрузка первой страницы
sample({
  clock: feedLoaded,
  fn: () => ({}),
  target: fetchFeedFx
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
  target: fetchFeedFx
})

// сохраняем текущий тег из ответа
sample({
  clock: fetchFeedFx.doneData,
  fn: (response) => response.tag,
  target: $currentTag
})

// первая загрузка = замена, подгрузка = добавление
sample({
  clock: fetchFeedFx.doneData,
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
  clock: fetchFeedFx.doneData,
  fn: (response) => response.cursor,
  target: $cursor
})

sample({
  clock: fetchFeedFx.doneData,
  fn: (response) => response.hasMore,
  target: $hasMore
})

// новый мяут добавляется в начало
sample({
  clock: meowCreated,
  source: $meows,
  fn: (meows, meow) => [meow, ...meows],
  target: $meows
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
  target: toggleLikeFx
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

// стреляем глобальный лайк для синхронизации других страниц
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
