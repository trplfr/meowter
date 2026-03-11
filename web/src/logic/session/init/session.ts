import { createEvent, sample } from 'effector'
import { redirect } from 'atomic-router'
import { interval } from 'patronum'
import { t } from '@lingui/core/macro'

import { routes } from '@core/router'
import { followChanged } from '@logic/feed'
import {
  stopPolling,
  showSuccessToastFx,
  showErrorToastFx
} from '@logic/notifications'

import {
  $session,
  $isAuthenticated,
  $reverifyCooldown,
  appStarted,
  sessionReceived,
  sessionReset,
  logout,
  fetchSessionFx,
  logoutFx,
  reverifyMutation
} from '../models'

/* App start -> check session (пропускаем если уже есть от SSR) */

sample({
  clock: appStarted,
  source: $session,
  filter: session => session === null,
  target: fetchSessionFx
})

/* Session lifecycle */

sample({
  clock: sessionReceived,
  target: $session
})

sample({
  clock: sessionReset,
  fn: () => null,
  target: $session
})

sample({
  clock: fetchSessionFx.doneData,
  target: sessionReceived
})

/* Guest guard: redirect authenticated to feed */

redirect({
  clock: sample({
    clock: [
      routes.welcome.opened,
      routes.login.opened,
      routes.register.opened,
      routes.recovery.opened
    ],
    source: $isAuthenticated,
    filter: isAuth => isAuth
  }),
  route: routes.feed
})

/* Logout */

sample({
  clock: logout,
  target: logoutFx
})

sample({
  clock: logoutFx.done,
  target: [sessionReset, stopPolling]
})

redirect({
  clock: logoutFx.done,
  route: routes.welcome
})

/* Auth guard: redirect guests to unauthorized */

redirect({
  clock: sample({
    clock: [
      routes.feed.opened,
      routes.search.opened,
      routes.notifications.opened,
      routes.settings.opened,
      routes.createMeow.opened
    ],
    source: $isAuthenticated,
    filter: isAuth => !isAuth
  }),
  route: routes.unauthorized
})

// /me = авторизованный, /cat/:username = публичный
redirect({
  clock: sample({
    clock: routes.catProfile.opened,
    source: {
      isAuth: $isAuthenticated,
      params: routes.catProfile.$params
    },
    filter: ({ isAuth, params }) => !isAuth && !params.username
  }),
  route: routes.unauthorized
})

/* Follow changed: update session followingCount */

sample({
  clock: followChanged,
  source: $session,
  filter: session => session !== null,
  fn: (session, { delta }) => ({
    ...session!,
    followingCount: session!.followingCount + delta
  }),
  target: $session
})

/* Session check failed: redirect to unauthorized if on auth-required page */

redirect({
  clock: sample({
    clock: fetchSessionFx.fail,
    source: {
      feed: routes.feed.$isOpened,
      search: routes.search.$isOpened,
      notifications: routes.notifications.$isOpened,
      settings: routes.settings.$isOpened,
      createMeow: routes.createMeow.$isOpened,
      catProfile: routes.catProfile.$isOpened
    },
    filter: opened =>
      opened.feed ||
      opened.search ||
      opened.notifications ||
      opened.settings ||
      opened.createMeow ||
      opened.catProfile
  }),
  route: routes.unauthorized
})

/* Reverify: повторная отправка письма */

// cooldown таймер (клиентский, тикает каждую секунду)
const stopCooldown = createEvent()

const cooldownInterval = interval({
  timeout: 1000,
  start: reverifyMutation.finished.success,
  stop: stopCooldown
})

sample({
  clock: reverifyMutation.finished.success,
  fn: ({ result }) => result.retryAfter,
  target: $reverifyCooldown
})

// уже на cooldown (ok: false)
sample({
  clock: reverifyMutation.finished.success,
  filter: ({ result }) => !result.ok,
  fn: () => t`Письмо уже отправлено`,
  target: showErrorToastFx
})

// письмо отправлено
sample({
  clock: reverifyMutation.finished.success,
  filter: ({ result }) => result.ok,
  fn: () => t`Письмо отправлено! Проверьте почту`,
  target: showSuccessToastFx
})

// тик таймера
sample({
  clock: cooldownInterval.tick,
  source: $reverifyCooldown,
  fn: (seconds: number) => Math.max(0, seconds - 1),
  target: $reverifyCooldown
})

// остановка при 0
sample({
  clock: $reverifyCooldown,
  filter: (seconds: number) => seconds <= 0,
  target: stopCooldown
})
