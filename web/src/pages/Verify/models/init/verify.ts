import { sample } from 'effector'
import { querySync } from 'atomic-router'
import { createStore } from 'effector'

import { routes, controls } from '@core/router'
import { $isAuthenticated } from '@logic/session'

import { $status, verifyMutation } from '../models'

// читаем ?token= из URL
const $token = createStore('')

querySync({
  source: { token: $token },
  controls,
  route: routes.verify
})

// запуск верификации когда токен доступен (opened или $token обновился)
sample({
  clock: [routes.verify.opened, $token],
  source: {
    token: $token,
    isOpened: routes.verify.$isOpened,
    status: $status
  },
  filter: ({ token, isOpened, status }) =>
    isOpened && token.length > 0 && status === 'pending',
  fn: ({ token }) => token,
  target: verifyMutation.start
})

sample({
  clock: verifyMutation.finished.success,
  fn: (): 'success' => 'success',
  target: $status
})

sample({
  clock: verifyMutation.finished.failure,
  fn: (): 'error' => 'error',
  target: $status
})

// редирект после успеха: авторизован -> /feed, гость -> /login
sample({
  clock: verifyMutation.finished.success,
  source: $isAuthenticated,
  filter: isAuth => isAuth,
  target: routes.feed.open
})

sample({
  clock: verifyMutation.finished.success,
  source: $isAuthenticated,
  filter: isAuth => !isAuth,
  target: routes.login.open
})
