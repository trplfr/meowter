import { sample } from 'effector'
import { redirect } from 'atomic-router'
import { concurrency } from '@farfetched/core'
import { t } from '@lingui/core/macro'

import { routes } from '@core/router'
import { meowLikeChanged, meowDeletedGlobal } from '@logic/feed'
import { showSuccessToastFx, showErrorToastFx } from '@logic/notifications'
import { $session } from '@logic/session'

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
  meowDeleteClicked,
  commentTextChanged,
  commentSubmitted,
  replyClicked,
  commentLikeToggled,
  commentDeleteClicked,
  meowQuery,
  commentsQuery,
  toggleLikeMutation,
  deleteMeowMutation,
  createCommentMutation,
  deleteCommentMutation,
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
  fn: meowId => ({ meowId }),
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

// гард: гость = редирект, неверифицированный = тост (ответ на комментарий)
sample({
  clock: replyClicked,
  source: $session,
  filter: session => session === null,
  target: routes.unauthorized.open
})

sample({
  clock: replyClicked,
  source: $session,
  filter: session => session !== null && !session.emailVerified,
  fn: () => t`Подтвердите почту`,
  target: showErrorToastFx
})

// ответить -> вставляем @username,
sample({
  clock: replyClicked,
  source: {
    text: $commentText,
    session: $session
  },
  filter: ({ session }) => session?.emailVerified === true,
  fn: ({ text }, username) => {
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
  source: {
    trigger: $replyTrigger,
    session: $session
  },
  filter: ({ session }) => session?.emailVerified === true,
  fn: ({ trigger }) => trigger + 1,
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
  filter: meow => meow !== null,
  fn: meow => ({
    ...meow!,
    commentsCount: meow!.commentsCount + 1
  }),
  target: $meow
})

// гард: гость = редирект, неверифицированный = тост
sample({
  clock: meowLikeToggled,
  source: $session,
  filter: session => session === null,
  target: routes.unauthorized.open
})

sample({
  clock: meowLikeToggled,
  source: $session,
  filter: session => session !== null && !session.emailVerified,
  fn: () => t`Подтвердите почту`,
  target: showErrorToastFx
})

// toggle лайка мяута
sample({
  clock: meowLikeToggled,
  source: {
    meow: $meow,
    session: $session
  },
  filter: ({ meow, session }) => meow !== null && session?.emailVerified === true,
  fn: ({ meow }) => ({
    meowId: meow!.id,
    isLiked: meow!.isLiked
  }),
  target: toggleLikeMutation.start
})

// стреляем глобальный лайк (оптимистичный апдейт через meowLikeChanged listener ниже)
sample({
  clock: meowLikeToggled,
  source: {
    meow: $meow,
    session: $session
  },
  filter: ({ meow, session }) => meow !== null && session?.emailVerified === true,
  fn: ({ meow }) => ({
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

// гард: гость = редирект, неверифицированный = тост (лайк комментария)
sample({
  clock: commentLikeToggled,
  source: $session,
  filter: session => session === null,
  target: routes.unauthorized.open
})

sample({
  clock: commentLikeToggled,
  source: $session,
  filter: session => session !== null && !session.emailVerified,
  fn: () => t`Подтвердите почту`,
  target: showErrorToastFx
})

// toggle лайка комментария
sample({
  clock: commentLikeToggled,
  source: {
    comments: $comments,
    session: $session
  },
  filter: ({ session }) => session?.emailVerified === true,
  fn: ({ comments }, commentId) => {
    const comment = comments.find(c => c.id === commentId)
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
  source: {
    comments: $comments,
    session: $session
  },
  filter: ({ session }) => session?.emailVerified === true,
  fn: ({ comments }, commentId) =>
    comments.map(c => {
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

/* Delete comment */

sample({
  clock: commentDeleteClicked,
  target: deleteCommentMutation.start
})

// оптимистичное удаление
sample({
  clock: commentDeleteClicked,
  source: $comments,
  fn: (comments, commentId) => comments.filter(c => c.id !== commentId),
  target: $comments
})

// обновляем счетчик комментов
sample({
  clock: commentDeleteClicked,
  source: $meow,
  filter: meow => meow !== null,
  fn: meow => ({
    ...meow!,
    commentsCount: Math.max(0, meow!.commentsCount - 1)
  }),
  target: $meow
})

sample({
  clock: deleteCommentMutation.finished.success,
  fn: () => t`Удалено!`,
  target: showSuccessToastFx
})

/* Delete meow */

sample({
  clock: meowDeleteClicked,
  source: $meow,
  filter: meow => meow !== null,
  fn: meow => meow!.id,
  target: deleteMeowMutation.start
})

// глобальный синк удаления
sample({
  clock: meowDeleteClicked,
  source: $meow,
  filter: meow => meow !== null,
  fn: meow => meow!.id,
  target: meowDeletedGlobal
})

sample({
  clock: deleteMeowMutation.finished.success,
  fn: () => t`Удалено!`,
  target: showSuccessToastFx
})

redirect({
  clock: deleteMeowMutation.finished.success,
  route: routes.feed
})

concurrency(meowQuery, { strategy: 'TAKE_LATEST' })
concurrency(commentsQuery, { strategy: 'TAKE_LATEST' })
