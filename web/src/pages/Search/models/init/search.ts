import { createStore, sample } from 'effector'
import { concurrency } from '@farfetched/core'
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
  queryChanged,
  tagSelected,
  searchTriggered,
  cleared,
  loadMore,
  meowLikeToggled,
  dropdownOpened,
  dropdownClosed,
  tagsQuery,
  searchQuery,
  toggleLikeMutation
} from '../models'

// синхронизация ?theme= с URL
const $urlTag = createStore('')

querySync({
  source: { theme: $urlTag },
  controls,
  route: routes.search
})

// загружаем теги при открытии роута
sample({
  clock: routes.search.opened,
  target: tagsQuery.start
})

// при обновлении query params (уже на /search, кликнули ~theme) = запускаем поиск по $urlTag
sample({
  clock: routes.search.updated,
  source: { urlTag: $urlTag, tagsLoaded: $tagsLoaded },
  filter: ({ urlTag, tagsLoaded }) => urlTag.length > 0 && tagsLoaded,
  fn: ({ urlTag }) => urlTag,
  target: searchTriggered
})

// сброс при открытии
sample({
  clock: routes.search.opened,
  fn: () => false,
  target: [$tagsLoaded, $isOpen]
})

sample({
  clock: routes.search.opened,
  fn: () => null,
  target: [$selectedTag, $cursor]
})

sample({
  clock: routes.search.opened,
  fn: (): never[] => [],
  target: $meows
})

sample({
  clock: routes.search.opened,
  fn: () => false,
  target: $hasMore
})

// теги получены
sample({
  clock: tagsQuery.finished.success,
  fn: ({ result }) => result,
  target: $tags
})

sample({
  clock: tagsQuery.finished.success,
  fn: () => true,
  target: $tagsLoaded
})

// восстанавливаем тег из URL после загрузки тегов
sample({
  clock: tagsQuery.finished.success,
  source: $urlTag,
  filter: tag => tag.length > 0,
  target: searchTriggered
})

// обновляем query из URL тега
sample({
  clock: tagsQuery.finished.success,
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
  filter: (tags, query) =>
    query.length > 0 && tags.some(t => t.toLowerCase() === query.toLowerCase()),
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
  fn: tag => ({ tag }),
  target: searchQuery.start
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
  clock: searchQuery.finished.success,
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
  clock: searchQuery.finished.success,
  fn: ({ result }) => result.cursor,
  target: $cursor
})

sample({
  clock: searchQuery.finished.success,
  fn: ({ result }) => result.hasMore,
  target: $hasMore
})

// закрываем дропдаун после загрузки
sample({
  clock: searchQuery.finished.success,
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
  target: searchQuery.start
})

// toggle лайка
sample({
  clock: meowLikeToggled,
  source: $meows,
  fn: (meows, meowId) => {
    const meow = meows.find(m => m.id === meowId)
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
    const meow = meows.find(m => m.id === meowId)
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
    meows.map(m => {
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
    const meow = meows.find(m => m.id === meowId)
    return meow !== undefined && meow.isLiked !== isLiked
  },
  fn: (meows, { meowId, isLiked, likesCount }) =>
    meows.map(m => {
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
    return meow.tags.some(
      t => t.tag.toLowerCase() === selectedTag.toLowerCase()
    )
  },
  fn: ({ meows }, meow) => [meow, ...meows],
  target: $meows
})

// concurrency
concurrency(tagsQuery, { strategy: 'TAKE_LATEST' })
concurrency(searchQuery, { strategy: 'TAKE_LATEST' })
