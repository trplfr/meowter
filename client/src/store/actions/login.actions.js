import { createActions } from 'redux-actions'

export const { requestLogin, acceptLogin, abortLogin } = createActions({
  REQUEST_LOGIN: auth => auth,
  ACCEPT_LOGIN: token => ({ token }),
  ABORT_LOGIN: () => {}
})
