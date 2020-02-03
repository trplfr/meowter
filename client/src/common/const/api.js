import axios from 'axios'

import { API_URL } from 'common/const/config'

export const API = axios.create({
  baseURL: API_URL
})
