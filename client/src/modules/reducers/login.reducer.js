import { handleActions } from 'redux-actions'

import {
  requestLogin,
  acceptLogin,
  abortLogin
} from 'modules/actions/login.actions'

const initialState = {
  token: null
}

export const loginReducer = handleActions(
  {
    [requestLogin]: state => state,
    [acceptLogin]: state => ({
      ...state,
      token: state.token
    }),
    [abortLogin]: state => state
  },
  initialState
)
