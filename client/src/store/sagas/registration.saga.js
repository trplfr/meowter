import { takeLatest, call, put } from 'redux-saga/effects'

import { API } from 'core/api'

import {
  acceptRegistration,
  abortRegistration,
  requestRegistration
} from 'store/actions/registration.actions'

export function* registerUser(action) {
  try {
    const token = yield call(API.post, 'auth', action.payload)

    yield put(acceptRegistration(token))
  } catch (e) {
    yield put(abortRegistration())

    console.log(e)
  }
}

export function* watchRegistrationSaga() {
  yield takeLatest(requestRegistration, registerUser)
}
