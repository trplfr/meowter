import { sample } from 'effector'

import { routes } from '@core/router'

import { $weeklyTopic, weeklyTopicQuery } from '../models'

// загружаем тему недели при открытии ленты, создания мяута, профиля, поиска
sample({
  clock: [
    routes.feed.opened,
    routes.createMeow.opened,
    routes.catProfile.opened,
    routes.search.opened,
    routes.meowThread.opened
  ],
  source: $weeklyTopic,
  filter: (topic) => topic === null,
  fn: () => ({}),
  target: weeklyTopicQuery.start
})

// сохраняем результат
sample({
  clock: weeklyTopicQuery.finished.success,
  fn: ({ result }) => result,
  target: $weeklyTopic
})
