import { all } from 'redux-saga/effects'

import { watchRegistrationSaga as registrationSaga } from 'store/sagas/registration.saga'
import { watchLoginSaga as loginSaga } from 'store/sagas/login.saga'

export function* rootSaga() {
  yield all([loginSaga(), registrationSaga()])
}
