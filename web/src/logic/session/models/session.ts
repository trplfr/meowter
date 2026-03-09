import { createEvent, createStore } from 'effector'

import { type Session } from '../types'

export const $session = createStore<Session>(null, { sid: 'session' })
export const $isAuthenticated = $session.map(session => session !== null)

export const appStarted = createEvent()
export const sessionReceived = createEvent<Session>()
export const sessionReset = createEvent()
export const logout = createEvent()
