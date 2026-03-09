import { createMutation, createQuery } from '@farfetched/core'

import { createMeow, getMeow } from '@logic/api/meows'

export const createMeowMutation = createMutation({
  handler: createMeow
})

export const replyMeowQuery = createQuery({
  handler: (id: string) => getMeow(id)
})
