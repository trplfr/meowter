import { takeLatest, call, put } from 'redux-saga/effects'

import { API } from 'common/api/config'

import {
  requestLogin,
  abortLogin,
  acceptLogin
} from 'modules/actions/login.actions'

export function* loginUser(action) {
  try {
    const token = yield call(API.post, 'auth/login', action.payload)

    localStorage.setItem('accessToken', token.data.accessToken)

    yield put(acceptLogin(token))
  } catch (e) {
    yield put(abortLogin())

    console.log(e)
  }
}

export function* watchLoginSaga() {
  yield takeLatest(requestLogin, loginUser)
}
