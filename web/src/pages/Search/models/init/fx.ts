import { getFeed, getUserTags, likeMeow, unlikeMeow } from '@logic/api/meows'

import { fetchTagsFx, fetchSearchFx, toggleLikeFx } from '../models'

fetchTagsFx.use(() => getUserTags())

fetchSearchFx.use(({ tag, cursor }) => getFeed(cursor, tag))

toggleLikeFx.use(async ({ meowId, isLiked }) => {
  if (isLiked) {
    await unlikeMeow(meowId)
    return { meowId, isLiked: false }
  }

  await likeMeow(meowId)
  return { meowId, isLiked: true }
})
