import { combineReducers } from 'redux'

import { loginReducer } from 'store/reducers/login.reducer'
import { registerReducer } from 'store/reducers/registration.reducer'

export const rootReducer = combineReducers({
  login: loginReducer,
  register: registerReducer
})
