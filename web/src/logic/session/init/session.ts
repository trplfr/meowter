import { sample } from 'effector'
import { redirect } from 'atomic-router'

import { routes } from '@core/router'

import {
  $session,
  $isAuthenticated,
  appStarted,
  sessionReceived,
  sessionReset,
  logout,
  fetchSessionFx,
  logoutFx
} from '../models'

/* App start -> check session */

sample({
  clock: appStarted,
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
    filter: (isAuth) => isAuth
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
  target: sessionReset
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
    filter: (isAuth) => !isAuth
  }),
  route: routes.unauthorized
})
