import { createHistoryRouter, createRoute } from 'atomic-router'

import { type CatProfileParams, type MeowThreadParams, type RouteConfig } from './types'

/* Routes */

export const routes = {
  welcome: createRoute(),
  login: createRoute(),
  register: createRoute(),
  feed: createRoute(),
  catProfile: createRoute<CatProfileParams>(),
  meowThread: createRoute<MeowThreadParams>(),
  search: createRoute(),
  notifications: createRoute(),
  settings: createRoute(),
  createMeow: createRoute(),
  notFound: createRoute()
}

/* Route Map */

export const routesMap: RouteConfig[] = [
  { path: '/', route: routes.welcome },
  { path: '/login', route: routes.login },
  { path: '/register', route: routes.register },
  { path: '/feed', route: routes.feed },
  { path: '/cat/:username', route: routes.catProfile },
  { path: '/cat/:username/meow/:meowId', route: routes.meowThread },
  { path: '/search', route: routes.search },
  { path: '/notifications', route: routes.notifications },
  { path: '/settings', route: routes.settings },
  { path: '/meow', route: routes.createMeow }
]

/* Router */

export const router = createHistoryRouter({ routes: routesMap })
