import { createEffect } from 'effector'

import { type CreateMeowRequest } from '../types'

export const createMeowFx = createEffect<CreateMeowRequest, void>()
