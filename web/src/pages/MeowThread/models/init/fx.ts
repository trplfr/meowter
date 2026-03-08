import { getMeow, getComments, likeMeow, unlikeMeow, createComment, likeComment, unlikeComment } from '@logic/api/meows'

import { fetchMeowFx, fetchCommentsFx, toggleLikeFx, createCommentFx, toggleCommentLikeFx } from '../models'

fetchMeowFx.use((id) => getMeow(id))

fetchCommentsFx.use(({ meowId, cursor }) => getComments(meowId, cursor))

toggleLikeFx.use(async ({ meowId, isLiked }) => {
  if (isLiked) {
    await unlikeMeow(meowId)
    return { meowId, isLiked: false }
  }

  await likeMeow(meowId)
  return { meowId, isLiked: true }
})

createCommentFx.use(({ meowId, content }) => createComment(meowId, { content }))

toggleCommentLikeFx.use(async ({ commentId, isLiked }) => {
  if (isLiked) {
    await unlikeComment(commentId)
    return { commentId, isLiked: false }
  }

  await likeComment(commentId)
  return { commentId, isLiked: true }
})
