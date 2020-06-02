import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import { loginReducer } from 'store/auth/login.reducer'
import { registerReducer } from 'store/auth/register.reducer'

export const rootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    login: loginReducer,
    register: registerReducer
  })
