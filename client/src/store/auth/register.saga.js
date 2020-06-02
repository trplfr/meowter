import { takeLatest, call, put } from 'redux-saga/effects'

import { API } from 'core/api'
import { setToken } from 'core/token'

import {
  acceptRegister,
  abortRegister,
  requestRegister
} from 'store/auth/register.actions'

function* registerUser(action) {
  try {
    const response = yield call(API.post, 'auth', action.payload)
    const token = response?.data?.accessToken

    if (token) {
      setToken(token)
      yield put(acceptRegister(token))
    }
  } catch (e) {
    yield put(abortRegister())

    console.error(e)
  }
}

export function* watchRegisterSaga() {
  yield takeLatest(requestRegister, registerUser)
}
