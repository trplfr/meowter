import * as Welcome from './Welcome'
import * as Login from './Login'
import * as Register from './Register'
import * as Feed from './Feed'
import * as CatProfile from './CatProfile'
import * as MeowThread from './MeowThread'
import * as Search from './Search'
import * as Notifications from './Notifications'
import * as Settings from './Settings'
import * as CreateMeow from './CreateMeow'
import * as NotFound from './NotFound'

export const pages = [
  { route: Welcome.route, view: Welcome.view },
  { route: Login.route, view: Login.view },
  { route: Register.route, view: Register.view },
  { route: Feed.route, view: Feed.view },
  { route: CatProfile.route, view: CatProfile.view },
  { route: MeowThread.route, view: MeowThread.view },
  { route: Search.route, view: Search.view },
  { route: Notifications.route, view: Notifications.view },
  { route: Settings.route, view: Settings.view },
  { route: CreateMeow.route, view: CreateMeow.view },
  { route: NotFound.route, view: NotFound.view }
]
