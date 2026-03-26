import axios from 'axios'
import type { AxiosError } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || ''
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  (err: AxiosError<{ message?: string }>) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('displayName')
      localStorage.removeItem('role')
      localStorage.removeItem('mustChangePassword')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('apps')
      localStorage.removeItem('avatarUrl')
      // Full page reload ensures Pinia store reinitializes from cleared localStorage
      window.location.href = import.meta.env.BASE_URL + 'login'
    }
    if (err.response?.status === 403 && err.response?.data?.message === '請先修改密碼') {
      localStorage.setItem('mustChangePassword', 'true')
      window.location.href = import.meta.env.BASE_URL + 'change-password'
    }
    return Promise.reject(err)
  }
)

export default api