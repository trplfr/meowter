import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import { loginReducer } from 'store/reducers/login.reducer'
import { registerReducer } from 'store/reducers/register.reducer'

export const rootReducer = history =>
  combineReducers({
    router: connectRouter(history),
    login: loginReducer,
    register: registerReducer
  })
