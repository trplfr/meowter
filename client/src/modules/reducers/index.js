import { combineReducers } from 'redux'

import { loginReducer } from 'modules/reducers/login.reducer'

export const rootReducer = combineReducers({
  login: loginReducer
})
