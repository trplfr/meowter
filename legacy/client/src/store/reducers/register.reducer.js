import { handleActions } from 'redux-actions'

import {
  requestRegister,
  acceptRegister,
  abortRegister
} from 'store/actions/register.actions'

const initialState = {
  token: null
}

export const registerReducer = handleActions(
  {
    [requestRegister]: state => state,
    [acceptRegister]: state => ({
      ...state,
      token: state.token
    }),
    [abortRegister]: state => state
  },
  initialState
)
