import { all } from 'redux-saga/effects'

import { watchLoginSaga as loginSaga } from './login.saga'

export function* rootSaga() {
  yield all([loginSaga()])
}
