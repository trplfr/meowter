import { all } from 'redux-saga/effects'

import { watchRegisterSaga } from 'store/sagas/register.saga'
import { watchLoginSaga } from 'store/sagas/login.saga'
import { watchTokenRefreshSaga } from 'store/sagas/token.saga'

export function* rootSaga() {
  yield all([watchLoginSaga(), watchRegisterSaga(), watchTokenRefreshSaga()])
}
