import { createQuery } from '@farfetched/core'

import { getCurrentTopic } from '@logic/api/topics'

export const weeklyTopicQuery = createQuery({
  handler: () => getCurrentTopic()
})
