import { createEvent, createStore } from 'effector'
import { createMutation } from '@farfetched/core'

import { reverify } from '@logic/api'

import { type Session } from '../types'

export const $session = createStore<Session>(null, { sid: 'session' })
export const $isAuthenticated = $session.map(session => session !== null)

/** Origin текущего домена (https://meowter.app или https://meowter.ru) */
export const $origin = createStore('https://meowter.app', { sid: 'origin' })

/** Таймер cooldown повторной отправки письма верификации (секунды) */
export const $reverifyCooldown = createStore(0)

export const appStarted = createEvent()
export const sessionReceived = createEvent<Session>()
export const sessionReset = createEvent()
export const logout = createEvent()
export const cooldownTick = createEvent()

export const reverifyMutation = createMutation({
  handler: (_: void) => reverify()
})
