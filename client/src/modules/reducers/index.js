import { combineReducers } from 'redux'

import { loginReducer } from 'modules/reducers/login.reducer'
import { registerReducer } from 'modules/reducers/registration.reducer'

export const rootReducer = combineReducers({
  login: loginReducer,
  register: registerReducer
})
