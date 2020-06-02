import { all } from 'redux-saga/effects'

import { watchRegisterSaga } from 'store/auth/register.saga'
import { watchLoginSaga } from 'store/auth/login.saga'
import { watchTokenRefreshSaga } from 'store/auth/token.saga'

export function* rootSaga() {
  yield all([watchLoginSaga(), watchRegisterSaga(), watchTokenRefreshSaga()])
}
