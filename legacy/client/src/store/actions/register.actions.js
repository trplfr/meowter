import { createActions } from 'redux-actions'

export const { requestRegister, acceptRegister, abortRegister } = createActions(
  {
    REQUEST_REGISTER: auth => auth,
    ACCEPT_REGISTER: () => {},
    ABORT_REGISTER: () => {}
  }
)
