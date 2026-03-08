import { createStore, sample } from 'effector'
import { debounce } from 'patronum'
import { querySync } from 'atomic-router'

import { routes, controls } from '@core/router'
import { meowCreated, meowLikeChanged } from '@logic/feed'

import {
  $tags,
  $query,
  $selectedTag,
  $meows,
  $cursor,
  $hasMore,
  $isOpen,
  $tagsLoaded,
  searchPageOpened,
  queryChanged,
  tagSelected,
  searchTriggered,
  cleared,
  loadMore,
  meowLikeToggled,
  dropdownOpened,
  dropdownClosed,
  fetchTagsFx,
  fetchSearchFx,
  toggleLikeFx
} from '../models'

// синхронизация ?tag= с URL
const $urlTag = createStore('')

querySync({
  source: { tag: $urlTag },
  controls,
  route: routes.search
})

// загружаем теги при открытии
sample({
  clock: searchPageOpened,
  target: fetchTagsFx
})

// сброс при открытии
sample({
  clock: searchPageOpened,
  fn: () => false,
  target: [$tagsLoaded, $isOpen]
})

sample({
  clock: searchPageOpened,
  fn: () => null,
  target: [$selectedTag, $cursor]
})

sample({
  clock: searchPageOpened,
  fn: (): never[] => [],
  target: $meows
})

sample({
  clock: searchPageOpened,
  fn: () => false,
  target: $hasMore
})

// теги получены
sample({
  clock: fetchTagsFx.doneData,
  target: $tags
})

sample({
  clock: fetchTagsFx.doneData,
  fn: () => true,
  target: $tagsLoaded
})

// восстанавливаем тег из URL после загрузки тегов
sample({
  clock: fetchTagsFx.doneData,
  source: $urlTag,
  filter: (tag) => tag.length > 0,
  target: searchTriggered
})

// обновляем query из URL тега
sample({
  clock: fetchTagsFx.doneData,
  source: $urlTag,
  target: $query
})

// ввод запроса
sample({
  clock: queryChanged,
  target: $query
})

// открываем дропдаун при вводе
sample({
  clock: queryChanged,
  fn: () => true,
  target: $isOpen
})

// дебаунс поиска при вводе (300мс)
const debouncedQuery = debounce({ source: queryChanged, timeout: 300 })

sample({
  clock: debouncedQuery,
  source: $tags,
  filter: (tags, query) => query.length > 0 && tags.some((t) => t.toLowerCase() === query.toLowerCase()),
  fn: (_, query) => query,
  target: searchTriggered
})

// dropdown
sample({
  clock: dropdownOpened,
  fn: () => true,
  target: $isOpen
})

sample({
  clock: dropdownClosed,
  fn: () => false,
  target: $isOpen
})

// выбор тега из списка
sample({
  clock: tagSelected,
  target: [$query, $selectedTag]
})

sample({
  clock: tagSelected,
  fn: () => false,
  target: $isOpen
})

sample({
  clock: tagSelected,
  target: searchTriggered
})

// запуск поиска
sample({
  clock: searchTriggered,
  target: $selectedTag
})

sample({
  clock: searchTriggered,
  fn: () => null,
  target: $cursor
})

sample({
  clock: searchTriggered,
  fn: (tag) => ({ tag }),
  target: fetchSearchFx
})

// синхронизация URL при выборе тега
sample({
  clock: searchTriggered,
  target: $urlTag
})

// сброс
sample({
  clock: cleared,
  fn: () => '',
  target: [$query, $urlTag]
})

sample({
  clock: cleared,
  fn: () => null,
  target: [$selectedTag, $cursor]
})

sample({
  clock: cleared,
  fn: (): never[] => [],
  target: $meows
})

sample({
  clock: cleared,
  fn: () => false,
  target: [$hasMore, $isOpen]
})

// результаты
sample({
  clock: fetchSearchFx.doneData,
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
  clock: fetchSearchFx.doneData,
  fn: (response) => response.cursor,
  target: $cursor
})

sample({
  clock: fetchSearchFx.doneData,
  fn: (response) => response.hasMore,
  target: $hasMore
})

// закрываем дропдаун после загрузки
sample({
  clock: fetchSearchFx.doneData,
  fn: () => false,
  target: $isOpen
})

// подгрузка
sample({
  clock: loadMore,
  source: {
    tag: $selectedTag,
    cursor: $cursor
  },
  filter: ({ tag, cursor }) => tag !== null && cursor !== null,
  fn: ({ tag, cursor }) => ({
    tag: tag!,
    cursor: cursor!
  }),
  target: fetchSearchFx
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

// новый мяут добавляем если совпадает тег поиска
sample({
  clock: meowCreated,
  source: {
    meows: $meows,
    selectedTag: $selectedTag
  },
  filter: ({ selectedTag }, meow) => {
    if (!selectedTag) {
      return false
    }
    return meow.tags.some((t) => t.tag.toLowerCase() === selectedTag.toLowerCase())
  },
  fn: ({ meows }, meow) => [meow, ...meows],
  target: $meows
})
