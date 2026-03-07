import { fetchMe, logout } from '@logic/api/auth'

import { fetchSessionFx, logoutFx } from '../models'

fetchSessionFx.use(fetchMe)
logoutFx.use(logout)
