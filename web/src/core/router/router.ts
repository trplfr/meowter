import { createHistoryRouter, createRoute, createRouterControls } from 'atomic-router'

import { type CatProfileParams, type MeowThreadParams, type RouteConfig } from './types'

/* Routes */

export const routes = {
  welcome: createRoute(),
  login: createRoute(),
  register: createRoute(),
  recovery: createRoute(),
  feed: createRoute(),
  catProfile: createRoute<CatProfileParams>(),
  meowThread: createRoute<MeowThreadParams>(),
  search: createRoute(),
  notifications: createRoute(),
  settings: createRoute(),
  createMeow: createRoute(),
  notFound: createRoute(),
  unauthorized: createRoute()
}

/* Route Map */

export const routesMap: RouteConfig[] = [
  { path: '/', route: routes.welcome },
  { path: '/login', route: routes.login },
  { path: '/register', route: routes.register },
  { path: '/recovery', route: routes.recovery },
  { path: '/feed', route: routes.feed },
  { path: '/me', route: routes.catProfile },
  { path: '/cat/:username', route: routes.catProfile },
  { path: '/search', route: routes.search },
  { path: '/notifications', route: routes.notifications },
  { path: '/settings', route: routes.settings },
  { path: '/meow', route: routes.createMeow },
  { path: '/meow/:meowId', route: routes.meowThread },
  { path: '/unauthorized', route: routes.unauthorized }
]

/* Router */

export const controls: ReturnType<typeof createRouterControls> = createRouterControls()

export const router = createHistoryRouter({ routes: routesMap, controls })
