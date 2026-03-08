import { getNotifications, markAllRead } from '@logic/api/notifications'

import { fetchNotificationsFx, markAllReadFx } from '../models'

fetchNotificationsFx.use(({ cursor }) => getNotifications(cursor))

markAllReadFx.use(() => markAllRead())
