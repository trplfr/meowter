import { createEffect } from 'effector'

import { type User } from '@shared/types'

export const fetchSessionFx = createEffect<void, User>()
export const logoutFx = createEffect<void, void>()
