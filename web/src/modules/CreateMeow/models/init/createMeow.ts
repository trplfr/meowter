import { createStore, sample } from 'effector'
import { redirect, querySync } from 'atomic-router'

import { t } from '@lingui/core/macro'

import { routes, controls } from '@core/router'
import { meowCreated, replyInitiated } from '@logic/feed'
import { showSuccessToastFx, showErrorToastFx } from '@logic/notifications'
import { $session } from '@logic/session'

import {
  $text,
  $image,
  $imagePreview,
  $replyToMeow,
  textChanged,
  imageSelected,
  imageRemoved,
  submitted,
  formReset,
  replyToSet,
  replyToCleared,
  createMeowMutation,
  replyMeowQuery
} from '../models'

// синхронизация ?reply= с URL
const $replyId = createStore('')

querySync({
  source: { reply: $replyId },
  controls,
  route: routes.createMeow
})

// при открытии страницы: если $replyToMeow уже есть (пришли через replyInitiated),
// синхронизируем $replyId -> querySync пушит в URL
sample({
  clock: routes.createMeow.opened,
  source: $replyToMeow,
  filter: meow => meow !== null,
  fn: meow => meow!.id,
  target: $replyId
})

// при открытии страницы с ?reply=id (перезагрузка) загружаем мяут
sample({
  clock: routes.createMeow.opened,
  source: { replyId: $replyId, replyTo: $replyToMeow },
  filter: ({ replyId, replyTo }) => replyId.length > 0 && replyTo === null,
  fn: ({ replyId }) => replyId,
  target: replyMeowQuery.start
})

// результат загрузки -> устанавливаем replyToMeow
sample({
  clock: replyMeowQuery.finished.success,
  fn: ({ result }) => ({
    id: result.id,
    content: result.content,
    imageUrl: result.imageUrl,
    author: result.author,
    createdAt: result.createdAt
  }),
  target: $replyToMeow
})

sample({
  clock: textChanged,
  target: $text
})

sample({
  clock: imageSelected,
  target: $image
})

sample({
  clock: imageSelected,
  fn: file => URL.createObjectURL(file),
  target: $imagePreview
})

sample({
  clock: imageRemoved,
  fn: () => null,
  target: [$image, $imagePreview]
})

// reply из компонента
sample({
  clock: replyToSet,
  target: $replyToMeow
})

sample({
  clock: replyToCleared,
  fn: () => null,
  target: $replyToMeow
})

sample({
  clock: replyToCleared,
  fn: () => '',
  target: $replyId
})

// гард: неверифицированным = тост
sample({
  clock: replyInitiated,
  source: $session,
  filter: session => !session?.emailVerified,
  fn: () => t`Подтвердите почту`,
  target: showErrorToastFx
})

// глобальное событие reply -> сохраняем мяут и переходим на страницу создания
sample({
  clock: replyInitiated,
  source: $session,
  filter: session => session?.emailVerified === true,
  fn: (_, meow) => meow,
  target: replyToSet
})

redirect({
  clock: sample({
    clock: replyInitiated,
    source: $session,
    filter: session => session?.emailVerified === true
  }),
  route: routes.createMeow
})

// отправка формы
sample({
  clock: submitted,
  source: {
    content: $text,
    image: $image,
    replyTo: $replyToMeow
  },
  filter: ({ content }) => content.trim().length > 0,
  fn: ({ content, image, replyTo }) => ({
    content,
    image,
    replyToId: replyTo?.id
  }),
  target: createMeowMutation.start
})

sample({
  clock: [createMeowMutation.finished.success, formReset],
  fn: () => '',
  target: [$text, $replyId]
})

sample({
  clock: [createMeowMutation.finished.success, formReset],
  fn: () => null,
  target: [$image, $imagePreview, $replyToMeow]
})

// добавляем новый мяут в ленту
sample({
  clock: createMeowMutation.finished.success,
  fn: ({ result }) => result,
  target: meowCreated
})

// тост об успехе
sample({
  clock: createMeowMutation.finished.success,
  fn: () => t`Мяут создан!`,
  target: showSuccessToastFx
})

// переходим на фид после создания
redirect({
  clock: createMeowMutation.finished.success,
  route: routes.feed
})

