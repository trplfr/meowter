import { handleActions } from 'redux-actions'

import {
  requestRegistration,
  acceptRegistration,
  abortRegistration
} from 'modules/actions/registration.actions'

const initialState = {
  token: null
}

export const registerReducer = handleActions(
  {
    [requestRegistration]: state => state,
    [acceptRegistration]: state => ({
      ...state,
      token: state.token
    }),
    [abortRegistration]: state => state
  },
  initialState
)
