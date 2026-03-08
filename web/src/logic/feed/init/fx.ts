import { getFeed, likeMeow, unlikeMeow } from '@logic/api/meows'

import { fetchFeedFx, toggleLikeFx } from '../models'

fetchFeedFx.use(({ cursor, tag }) => getFeed(cursor, tag))

toggleLikeFx.use(async ({ meowId, isLiked }) => {
  if (isLiked) {
    await unlikeMeow(meowId)
    return { meowId, isLiked: false }
  }

  await likeMeow(meowId)
  return { meowId, isLiked: true }
})
