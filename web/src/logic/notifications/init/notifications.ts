import { sample } from 'effector'
import { interval } from 'patronum'

import { getUnreadCount } from '@logic/api/notifications'

import { $unreadCount, startPolling, stopPolling, fetchUnreadCountFx } from '../models'

const POLL_INTERVAL = 30_000

fetchUnreadCountFx.use(() => getUnreadCount())

sample({
  clock: fetchUnreadCountFx.doneData,
  fn: ({ count }) => count,
  target: $unreadCount
})

// поллинг через patronum/interval
const { tick } = interval({
  timeout: POLL_INTERVAL,
  start: startPolling,
  stop: stopPolling
})

// первый запрос сразу при старте
sample({
  clock: startPolling,
  target: fetchUnreadCountFx
})

// последующие по тику
sample({
  clock: tick,
  target: fetchUnreadCountFx
})
