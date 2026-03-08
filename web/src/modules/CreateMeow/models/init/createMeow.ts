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
  createMeowFx
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
  target: createMeowFx
})

sample({
  clock: [createMeowFx.done, formReset],
  fn: () => '',
  target: $text
})

sample({
  clock: [createMeowFx.done, formReset],
  fn: () => null,
  target: [$image, $imagePreview]
})

// добавляем новый мяут в ленту
sample({
  clock: createMeowFx.doneData,
  target: meowCreated
})
