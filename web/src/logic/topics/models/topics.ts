import { createStore, combine } from 'effector'

import { $origin } from '@logic/session'

import { type WeeklyTopic } from '../types'

export const $weeklyTopic = createStore<WeeklyTopic | null>(null, {
  sid: 'weeklyTopic'
})

// тег по текущему домену (en только для meowter.app, остальное = ru)
export const $weeklyTag = combine($weeklyTopic, $origin, (topic, origin) => {
  if (!topic) {
    return null
  }

  return origin.includes('meowter.app') ? topic.tags.en : topic.tags.ru
})
