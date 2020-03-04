import { takeLatest, call, put } from 'redux-saga/effects'

import { API } from 'core/api'

import {
  acceptRegister,
  abortRegister,
  requestRegister
} from 'store/actions/register.actions'

export function* registerUser(action) {
  try {
    const token = yield call(API.post, 'auth', action.payload)

    yield put(acceptRegister(token))
  } catch (e) {
    yield put(abortRegister())

    console.log(e)
  }
}

export function* watchRegisterSaga() {
  yield takeLatest(requestRegister, registerUser)
}
