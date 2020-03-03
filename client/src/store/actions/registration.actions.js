import { createActions } from 'redux-actions'

export const {
  requestRegistration,
  acceptRegistration,
  abortRegistration
} = createActions({
  REQUEST_REGISTRATION: auth => auth,
  ACCEPT_REGISTRATION: () => {},
  ABORT_REGISTRATION: () => {}
})
