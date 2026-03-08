import { getCatProfile, getCatMeows, followCat, unfollowCat } from '@logic/api/cats'
import { likeMeow, unlikeMeow } from '@logic/api/meows'

import { fetchProfileFx, fetchMeowsFx, toggleFollowFx, toggleMeowLikeFx } from '../models'

fetchProfileFx.use((username) => getCatProfile(username))

fetchMeowsFx.use(({ username, cursor }) => getCatMeows(username, cursor))

toggleFollowFx.use(async ({ username, isFollowing }) => {
  if (isFollowing) {
    await unfollowCat(username)
    return false
  }
  await followCat(username)
  return true
})

toggleMeowLikeFx.use(async ({ meowId, isLiked }) => {
  if (isLiked) {
    await unlikeMeow(meowId)
    return { meowId, isLiked: false }
  }
  await likeMeow(meowId)
  return { meowId, isLiked: true }
})
