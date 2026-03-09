import { sample } from 'effector'

import { meowCreated } from '@logic/feed'

import {
  $text,
  $image,
  $imagePreview,
  textChanged,
  imageSelected,
  imageRemoved,
  submitted,
  formReset,
  createMeowMutation
} from '../models'

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
  fn: (file) => URL.createObjectURL(file),
  target: $imagePreview
})

sample({
  clock: imageRemoved,
  fn: () => null,
  target: [$image, $imagePreview]
})

sample({
  clock: submitted,
  source: {
    content: $text,
    image: $image
  },
  filter: ({ content }) => content.trim().length > 0,
  target: createMeowMutation.start
})

sample({
  clock: [createMeowMutation.finished.success, formReset],
  fn: () => '',
  target: $text
})

sample({
  clock: [createMeowMutation.finished.success, formReset],
  fn: () => null,
  target: [$image, $imagePreview]
})

// добавляем новый мяут в ленту
sample({
  clock: createMeowMutation.finished.success,
  fn: ({ result }) => result,
  target: meowCreated
})
