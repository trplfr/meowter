import { sample } from 'effector'
import { concurrency } from '@farfetched/core'

import { routes } from '@core/router'
import { meowLikeChanged } from '@logic/feed'

import {
  $meow,
  $comments,
  $cursor,
  $hasMore,
  $commentText,
  $replyTrigger,
  threadOpened,
  loadMoreComments,
  meowLikeToggled,
  commentTextChanged,
  commentSubmitted,
  replyClicked,
  commentLikeToggled,
  meowQuery,
  commentsQuery,
  toggleLikeMutation,
  createCommentMutation,
  toggleCommentLikeMutation
} from '../models'

// проброс из роута в событие модели (opened + updated для навигации между тредами)
sample({
  clock: [routes.meowThread.opened, routes.meowThread.updated],
  fn: ({ params }) => params.meowId,
  target: threadOpened
})

// сброс при открытии
sample({
  clock: threadOpened,
  fn: () => null,
  target: [$meow, $cursor]
})

sample({
  clock: threadOpened,
  fn: (): never[] => [],
  target: $comments
})

sample({
  clock: threadOpened,
  fn: () => true,
  target: $hasMore
})

sample({
  clock: threadOpened,
  fn: () => '',
  target: $commentText
})

sample({
  clock: threadOpened,
  fn: () => 0,
  target: $replyTrigger
})

// загрузка
sample({
  clock: threadOpened,
  target: meowQuery.start
})

sample({
  clock: threadOpened,
  fn: (meowId) => ({ meowId }),
  target: commentsQuery.start
})

sample({
  clock: meowQuery.finished.success,
  fn: ({ result }) => result,
  target: $meow
})

// комментарии
sample({
  clock: commentsQuery.finished.success,
  source: {
    comments: $comments,
    cursor: $cursor
  },
  fn: ({ comments, cursor }, { result }) => {
    if (!cursor) {
      return result.data
    }
    return [...comments, ...result.data]
  },
  target: $comments
})

sample({
  clock: commentsQuery.finished.success,
  fn: ({ result }) => result.cursor,
  target: $cursor
})

sample({
  clock: commentsQuery.finished.success,
  fn: ({ result }) => result.hasMore,
  target: $hasMore
})

// подгрузка
sample({
  clock: loadMoreComments,
  source: {
    meow: $meow,
    cursor: $cursor
  },
  filter: ({ meow, cursor }) => meow !== null && cursor !== null,
  fn: ({ meow, cursor }) => ({
    meowId: meow!.id,
    cursor: cursor!
  }),
  target: commentsQuery.start
})

// ввод текста комментария
sample({
  clock: commentTextChanged,
  target: $commentText
})

// ответить -> вставляем @username,
sample({
  clock: replyClicked,
  source: $commentText,
  fn: (text, username) => {
    const mention = `@${username}, `
    if (text.length === 0) {
      return mention
    }
    return text + mention
  },
  target: $commentText
})

// счетчик для фокуса textarea
sample({
  clock: replyClicked,
  source: $replyTrigger,
  fn: (n) => n + 1,
  target: $replyTrigger
})

// отправка комментария
sample({
  clock: commentSubmitted,
  source: {
    meow: $meow,
    text: $commentText
  },
  filter: ({ meow, text }) => meow !== null && text.trim().length > 0,
  fn: ({ meow, text }) => ({
    meowId: meow!.id,
    content: text.trim()
  }),
  target: createCommentMutation.start
})

// сброс текста после отправки
sample({
  clock: createCommentMutation.finished.success,
  fn: () => '',
  target: $commentText
})

// добавляем новый комментарий в конец списка
sample({
  clock: createCommentMutation.finished.success,
  source: $comments,
  fn: (comments, { result }) => [...comments, result],
  target: $comments
})

// обновляем счетчик комментов у мяута
sample({
  clock: createCommentMutation.finished.success,
  source: $meow,
  filter: (meow) => meow !== null,
  fn: (meow) => ({
    ...meow!,
    commentsCount: meow!.commentsCount + 1
  }),
  target: $meow
})

// toggle лайка мяута
sample({
  clock: meowLikeToggled,
  source: $meow,
  filter: (meow) => meow !== null,
  fn: (meow) => ({
    meowId: meow!.id,
    isLiked: meow!.isLiked
  }),
  target: toggleLikeMutation.start
})

// стреляем глобальный лайк (оптимистичный апдейт через meowLikeChanged listener ниже)
sample({
  clock: meowLikeToggled,
  source: $meow,
  filter: (meow) => meow !== null,
  fn: (meow) => ({
    meowId: meow!.id,
    isLiked: !meow!.isLiked,
    likesCount: meow!.isLiked ? meow!.likesCount - 1 : meow!.likesCount + 1
  }),
  target: meowLikeChanged
})

// слушаем лайки из других страниц (пропускаем если уже актуально)
sample({
  clock: meowLikeChanged,
  source: $meow,
  filter: (meow, { meowId, isLiked }) =>
    meow !== null && meow.id === meowId && meow.isLiked !== isLiked,
  fn: (meow, { isLiked, likesCount }) => ({
    ...meow!,
    isLiked,
    likesCount
  }),
  target: $meow
})

// toggle лайка комментария
sample({
  clock: commentLikeToggled,
  source: $comments,
  fn: (comments, commentId) => {
    const comment = comments.find((c) => c.id === commentId)
    if (!comment) {
      return { commentId, isLiked: false }
    }
    return { commentId, isLiked: comment.isLiked }
  },
  target: toggleCommentLikeMutation.start
})

// оптимистичный апдейт лайка комментария
sample({
  clock: commentLikeToggled,
  source: $comments,
  fn: (comments, commentId) =>
    comments.map((c) => {
      if (c.id !== commentId) {
        return c
      }
      return {
        ...c,
        isLiked: !c.isLiked,
        likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1
      }
    }),
  target: $comments
})

concurrency(meowQuery, { strategy: 'TAKE_LATEST' })
concurrency(commentsQuery, { strategy: 'TAKE_LATEST' })
