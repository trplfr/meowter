import { all } from 'redux-saga/effects'

import { watchRegisterSaga as registerSaga } from 'store/sagas/register.saga'
import { watchLoginSaga as loginSaga } from 'store/sagas/login.saga'

export function* rootSaga() {
  yield all([loginSaga(), registerSaga()])
}
