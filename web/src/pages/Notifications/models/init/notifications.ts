import { sample } from 'effector'
import { concurrency } from '@farfetched/core'

import { routes } from '@core/router'
import { $unreadCount } from '@logic/notifications'

import {
  $notifications,
  $cursor,
  $hasMore,
  loadMore,
  notificationsQuery,
  markAllReadMutation
} from '../models'

// сброс при открытии роута
sample({
  clock: routes.notifications.opened,
  fn: (): never[] => [],
  target: $notifications
})

sample({
  clock: routes.notifications.opened,
  fn: () => null,
  target: $cursor
})

sample({
  clock: routes.notifications.opened,
  fn: () => true,
  target: $hasMore
})

// загрузка
sample({
  clock: routes.notifications.opened,
  fn: () => ({}),
  target: notificationsQuery.start
})

// помечаем прочитанными
sample({
  clock: routes.notifications.opened,
  target: markAllReadMutation.start
})

// обнуляем счетчик
sample({
  clock: markAllReadMutation.finished.success,
  fn: () => 0,
  target: $unreadCount
})

// результаты
sample({
  clock: notificationsQuery.finished.success,
  source: {
    notifications: $notifications,
    cursor: $cursor
  },
  fn: ({ notifications, cursor }, { result }) => {
    if (!cursor) {
      return result.data
    }
    return [...notifications, ...result.data]
  },
  target: $notifications
})

sample({
  clock: notificationsQuery.finished.success,
  fn: ({ result }) => result.cursor,
  target: $cursor
})

sample({
  clock: notificationsQuery.finished.success,
  fn: ({ result }) => result.hasMore,
  target: $hasMore
})

// подгрузка
sample({
  clock: loadMore,
  source: $cursor,
  filter: (cursor) => cursor !== null,
  fn: (cursor) => ({ cursor: cursor! }),
  target: notificationsQuery.start
})

concurrency(notificationsQuery, { strategy: 'TAKE_LATEST' })
