import { takeLatest, call, put } from 'redux-saga/effects'

import { API, setToken } from 'core/api'

import {
  acceptRegister,
  abortRegister,
  requestRegister
} from 'store/actions/register.actions'

export function* registerUser(action) {
  try {
    const response = yield call(API.post, 'auth', action.payload)

    setToken(response.data.accessToken)

    yield put(acceptRegister(response.data.accessToken))
  } catch (e) {
    yield put(abortRegister())

    console.log(e)
  }
}

export function* watchRegisterSaga() {
  yield takeLatest(requestRegister, registerUser)
}
