import axios from 'axios'

export const API_BASE = process.env.API_BASE
export const API_PORT = process.env.API_PORT
export const API_VERSION = process.env.API_VERSION

export const API_URL = `http://${API_BASE}:${API_PORT}/api/${API_VERSION}/`

export const API = axios.create({
  baseURL: API_URL
})

const getToken = () => localStorage.getItem('accessToken')
const clearToken = () => localStorage.removeItem('accessToken')
const setToken = token => localStorage.setItem('accessToken', token)

const refreshTokenLogic = async failedRequest => {
  const response = await API.post('auth/token', {
    refreshToken: getToken()
  })

  setToken(response.refreshToken)

  failedRequest.response.config.headers.Authorization = `Bearer ${response.refreshToken}`
}

API.interceptors.request.use(request => {
  request.headers.Authorization = `Bearer ${getToken()}`
  return request
})

API.interceptors.response.use(response => {
  if (response.status === 401) {
    clearToken()
  }

  return response
})
