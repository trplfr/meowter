import { sample } from 'effector'

import { $session, sessionReceived, sessionReset, fetchSessionFx } from '../models'

sample({
  clock: sessionReceived,
  target: $session
})

sample({
  clock: sessionReset,
  fn: () => null,
  target: $session
})

sample({
  clock: fetchSessionFx.doneData,
  target: sessionReceived
})
