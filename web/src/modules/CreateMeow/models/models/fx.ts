import { createMutation } from '@farfetched/core'

import { createMeow } from '@logic/api/meows'

export const createMeowMutation = createMutation({
  handler: createMeow
})
