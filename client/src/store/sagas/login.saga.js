import { takeLatest, call, put } from 'redux-saga/effects'

import { API } from 'core/api'
import { setToken } from 'core/token'

import {
  requestLogin,
  abortLogin,
  acceptLogin
} from 'store/actions/login.actions'

function* loginUser(action) {
  try {
    const response = yield call(API.post, 'auth/login', action.payload)
    const token = response?.data?.accessToken

    if (token) {
      setToken(token)
      yield put(acceptLogin(token))
    }
  } catch (e) {
    yield put(abortLogin())

    console.error(e)
  }
}

export function* watchLoginSaga() {
  yield takeLatest(requestLogin, loginUser)
}
