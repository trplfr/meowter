import { createHistoryRouter, createRoute } from 'atomic-router'
import { createBrowserHistory } from 'history'

export const routes = {
  welcome: createRoute(),
  login: createRoute(),
  register: createRoute(),
  feed: createRoute(),
  catProfile: createRoute<{ username: string }>(),
  meowThread: createRoute<{ username: string; meowId: string }>(),
  search: createRoute(),
  notifications: createRoute(),
  settings: createRoute(),
  createMeow: createRoute(),
  notFound: createRoute()
}

export const routesMap = [
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

export const router = createHistoryRouter({ routes: routesMap })

export const history = createBrowserHistory()
