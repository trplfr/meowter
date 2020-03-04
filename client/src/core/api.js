import axios from 'axios'
import jwtDecode from 'jwt-decode'
import { differenceInMinutes, fromUnixTime } from 'date-fns'

export const API_BASE = process.env.API_BASE
export const API_PORT = process.env.API_PORT
export const API_VERSION = process.env.API_VERSION

export const API_URL = `http://${API_BASE}:${API_PORT}/api/${API_VERSION}/`

export const API = axios.create({
  baseURL: API_URL
})

export const getToken = () => localStorage.getItem('accessToken')
export const clearToken = () => localStorage.removeItem('accessToken')
export const setToken = token => localStorage.setItem('accessToken', token)

const getNewToken = async () => {
  const response = await API.post('auth/token', {
    refreshToken: getToken()
  })

  setToken(response.data.accessToken)
}

API.interceptors.request.use(request => {
  const token = getToken()
  const decodedToken = token ? jwtDecode(token) : null

  if (
    decodedToken &&
    request.url !== 'auth/login' &&
    request.url !== 'auth/token' &&
    differenceInMinutes(fromUnixTime(decodedToken?.exp), new Date()) < 5
  ) {
    getNewToken()
  }

  request.headers.Authorization = `Bearer ${token}`

  return request
})

API.interceptors.response.use(response => {
  if (response.status === 401) {
    // TODO: нужно редиректить на /not-logged-in
    clearToken()
  }

  return response
})
