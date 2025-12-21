import axios from 'axios'
import router from '../router'
import { createStandardError } from './errorHandler'

const DEFAULT_BASE_URL = '/api/v1'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const standardError = createStandardError(error)

    // 处理401未授权错误
    if (standardError.statusCode === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (router.currentRoute.value.name !== 'Login') {
        router.replace({ name: 'Login' })
      }
    }

    return Promise.reject(standardError)
  }
)

export default http

