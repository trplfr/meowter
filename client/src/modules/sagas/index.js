import { all } from 'redux-saga/effects'

import { watchRegistrationSaga as registrationSaga } from 'modules/sagas/registration.saga'
import { watchLoginSaga as loginSaga } from './login.saga'

export function* rootSaga() {
  yield all([loginSaga(), registrationSaga()])
}
