import { call, delay } from 'redux-saga/effects'
import jwtDecode from 'jwt-decode'
import { differenceInSeconds, fromUnixTime } from 'date-fns'

import { API } from 'core/api'
import { getToken, setToken, tokenCheckRange } from 'core/token'

function* tokenRefreshSaga() {
  const token = getToken()
  const decodedToken = token ? jwtDecode(token) : null
  const isTokenExpired =
    differenceInSeconds(fromUnixTime(decodedToken?.exp), new Date()) <=
    tokenCheckRange

  if (isTokenExpired) {
    const response = yield call(API.post, 'auth/token', {
      refreshToken: token
    })
    const newToken = response?.data?.accessToken

    if (newToken) {
      setToken(newToken)
    }
  }
}

export function* watchTokenRefreshSaga() {
  while (true) {
    yield call(tokenRefreshSaga)
    yield delay(tokenCheckRange * 1000)
  }
}
