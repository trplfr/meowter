import { sample } from 'effector'

import { $unreadCount } from '@logic/notifications'

import {
  $notifications,
  $cursor,
  $hasMore,
  pageOpened,
  loadMore,
  fetchNotificationsFx,
  markAllReadFx
} from '../models'

// сброс при открытии
sample({
  clock: pageOpened,
  fn: (): never[] => [],
  target: $notifications
})

sample({
  clock: pageOpened,
  fn: () => null,
  target: $cursor
})

sample({
  clock: pageOpened,
  fn: () => true,
  target: $hasMore
})

// загрузка
sample({
  clock: pageOpened,
  fn: () => ({}),
  target: fetchNotificationsFx
})

// помечаем прочитанными
sample({
  clock: pageOpened,
  target: markAllReadFx
})

// обнуляем счетчик
sample({
  clock: markAllReadFx.done,
  fn: () => 0,
  target: $unreadCount
})

// результаты
sample({
  clock: fetchNotificationsFx.doneData,
  source: {
    notifications: $notifications,
    cursor: $cursor
  },
  fn: ({ notifications, cursor }, response) => {
    if (!cursor) {
      return response.data
    }
    return [...notifications, ...response.data]
  },
  target: $notifications
})

sample({
  clock: fetchNotificationsFx.doneData,
  fn: (response) => response.cursor,
  target: $cursor
})

sample({
  clock: fetchNotificationsFx.doneData,
  fn: (response) => response.hasMore,
  target: $hasMore
})

// подгрузка
sample({
  clock: loadMore,
  source: $cursor,
  filter: (cursor) => cursor !== null,
  fn: (cursor) => ({ cursor: cursor! }),
  target: fetchNotificationsFx
})
