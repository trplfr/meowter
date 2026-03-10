import { api } from '@lib/api'

import { type WeeklyTopic } from './types'

export const getCurrentTopic = () =>
  api.get('topics/current').json<WeeklyTopic | null>()
