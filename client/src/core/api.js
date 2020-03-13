import axios from 'axios'

import { getToken, clearToken } from 'core/token'

export const API_BASE = process.env.API_BASE
export const API_PORT = process.env.API_PORT
export const API_VERSION = process.env.API_VERSION

export const API_URL = `http://${API_BASE}:${API_PORT}/api/${API_VERSION}/`

export const API = axios.create({
  baseURL: API_URL
})

API.interceptors.request.use(async request => {
  const token = getToken()

  request.headers.Authorization = token ? `Bearer ${token}` : ''

  return request
})

API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearToken()
      // TODO: редирект на /not-logged-in
    }

    return error
  }
)
