import { takeLatest, call, put } from 'redux-saga/effects'

import { API, setToken } from 'core/api'

import {
  requestLogin,
  abortLogin,
  acceptLogin
} from 'store/actions/login.actions'

export function* loginUser(action) {
  try {
    const response = yield call(API.post, 'auth/login', action.payload)

    setToken(response.data.accessToken)

    yield put(acceptLogin(response.data.accessToken))
  } catch (e) {
    yield put(abortLogin())

    console.log(e)
  }
}

export function* watchLoginSaga() {
  yield takeLatest(requestLogin, loginUser)
}
