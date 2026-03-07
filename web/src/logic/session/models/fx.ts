import { createEffect } from 'effector'

import { type IUser } from '@shared/types'

export const fetchSessionFx = createEffect<void, IUser>()
