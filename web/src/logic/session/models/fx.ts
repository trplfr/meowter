import { createEffect } from 'effector'

import { type CatProfile } from '@shared/types'

export const fetchSessionFx = createEffect<void, CatProfile>()
export const logoutFx = createEffect<void, void>()
