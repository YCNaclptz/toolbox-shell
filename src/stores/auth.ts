import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'
import router from '../router'

export interface AppInfo {
  id: string
  name: string
  icon: string
  routePrefix: string
  description?: string
}

export interface UserInfo {
  id: number
  username: string
  displayName: string
  role: string
  mustChangePassword: boolean
  isActive: boolean
}

export interface UserProfile {
  id: number
  username: string
  displayName: string
  email: string | null
  avatarUrl: string | null
  role: string
  createdAt: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const displayName = ref<string>(localStorage.getItem('displayName') || '')
  const role = ref<string>(localStorage.getItem('role') || '')
  const mustChangePassword = ref<boolean>(localStorage.getItem('mustChangePassword') === 'true')
  const refreshToken = ref<string>(localStorage.getItem('refreshToken') || '')
  const apps = ref<AppInfo[]>(JSON.parse(localStorage.getItem('apps') || '[]'))
  const avatarUrl = ref<string>(localStorage.getItem('avatarUrl') || '')
  
  const isLoggedIn = () => !!token.value
  const isAdmin = computed(() => role.value === 'Admin')

  async function login(username: string, password: string) {
    const { data } = await api.post('/api/auth/login', { username, password })
    token.value = data.token
    displayName.value = data.displayName
    role.value = data.role
    mustChangePassword.value = data.mustChangePassword
    refreshToken.value = data.refreshToken || ''
    apps.value = data.apps || []
    avatarUrl.value = data.avatarUrl || ''
    
    localStorage.setItem('token', data.token)
    localStorage.setItem('displayName', data.displayName)
    localStorage.setItem('role', data.role)
    localStorage.setItem('mustChangePassword', data.mustChangePassword)
    localStorage.setItem('refreshToken', data.refreshToken || '')
    localStorage.setItem('apps', JSON.stringify(data.apps || []))
    localStorage.setItem('avatarUrl', data.avatarUrl || '')
    
    if (data.mustChangePassword) {
      router.push('/change-password')
    } else {
      router.push('/')
    }
  }

  async function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('displayName')
    localStorage.removeItem('role')
    localStorage.removeItem('mustChangePassword')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('apps')
    localStorage.removeItem('avatarUrl')
    
    await router.push('/login')
    
    token.value = ''
    displayName.value = ''
    role.value = ''
    mustChangePassword.value = false
    refreshToken.value = ''
    apps.value = []
    avatarUrl.value = ''
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    const { data } = await api.post('/api/auth/change-password', { currentPassword, newPassword })
    token.value = data.token
    mustChangePassword.value = false
    localStorage.setItem('token', data.token)
    localStorage.setItem('mustChangePassword', 'false')
    return data
  }

  async function refreshAccessToken() {
    const { data } = await api.post('/api/auth/refresh', { refreshToken: refreshToken.value })
    token.value = data.token
    localStorage.setItem('token', data.token)
    return data
  }

  async function fetchMyApps() {
    const { data } = await api.get<AppInfo[]>('/api/auth/me/apps')
    apps.value = data
    localStorage.setItem('apps', JSON.stringify(data))
    return data
  }

  async function fetchProfile() {
    const { data } = await api.get<UserProfile>('/api/auth/me')
    return data
  }

  async function updateProfile(profile: { displayName: string; email: string | null }) {
    const { data } = await api.put('/api/auth/me', profile)
    token.value = data.token
    displayName.value = data.displayName
    avatarUrl.value = data.avatarUrl || ''
    localStorage.setItem('token', data.token)
    localStorage.setItem('displayName', data.displayName)
    localStorage.setItem('avatarUrl', data.avatarUrl || '')
    return data
  }

  async function uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post('/api/auth/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    avatarUrl.value = data.avatarUrl
    localStorage.setItem('avatarUrl', data.avatarUrl)
    return data
  }

  async function removeAvatar() {
    await api.delete('/api/auth/me/avatar')
    avatarUrl.value = ''
    localStorage.setItem('avatarUrl', '')
  }

  async function register(userData: { username: string; displayName: string; password: string; role: string }) {
    const { data } = await api.post('/api/auth/register', userData)
    return data
  }

  async function fetchUsers() {
    const { data } = await api.get<UserInfo[]>('/api/auth/users')
    return data
  }

  async function fetchApps() {
    const { data } = await api.get('/api/auth/apps')
    return data
  }

  async function grantAccess(userId: string, applicationId: string) {
    const { data } = await api.post('/api/auth/access', { userId, applicationId })
    return data
  }

  async function revokeAccess(userId: string, appId: string) {
    const { data } = await api.delete(`/api/auth/access/${userId}/${appId}`)
    return data
  }

  return { 
    token, 
    displayName, 
    role, 
    mustChangePassword, 
    refreshToken,
    apps,
    avatarUrl,
    isLoggedIn, 
    isAdmin, 
    login, 
    logout, 
    changePassword, 
    refreshAccessToken,
    fetchMyApps,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    register, 
    fetchUsers,
    fetchApps,
    grantAccess,
    revokeAccess
  }
})