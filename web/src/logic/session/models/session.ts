import { createEvent, createStore } from 'effector'

import { type Session } from '../types'

export const $session = createStore<Session>(null)
export const $isAuthenticated = $session.map((session) => session !== null)

export const sessionReceived = createEvent<Session>()
export const sessionReset = createEvent()
