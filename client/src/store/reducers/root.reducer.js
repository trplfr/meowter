import { combineReducers } from 'redux'

import { loginReducer } from 'store/reducers/login.reducer'
import { registerReducer } from 'store/reducers/register.reducer'
import { footerReducer } from 'screens/Layout/store/reducers/footer.reducer'

export const rootReducer = combineReducers({
  login: loginReducer,
  register: registerReducer,
  footer: footerReducer
})
