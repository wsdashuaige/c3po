import axios from 'axios'
import router from '../router'

const DEFAULT_BASE_URL = 'http://localhost:8080/api/v1'

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
    const { response } = error

    if (response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (router.currentRoute.value.name !== 'Login') {
        router.replace({ name: 'Login' })
      }
    }

    if (response?.data) {
      return Promise.reject(response.data)
    }

    return Promise.reject(error)
  }
)

export default http

