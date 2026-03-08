import { createEffect } from 'effector'

import { type Meow } from '@shared/types'

import { type CreateMeowRequest } from '../types'

export const createMeowFx = createEffect<CreateMeowRequest, Meow>()
