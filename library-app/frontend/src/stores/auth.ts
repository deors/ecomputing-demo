import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, ApiError } from '../services/api.ts'

interface AuthUser {
  id: string
  email: string
  role: 'ADMIN' | 'MEMBER'
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  async function login(email: string, password: string): Promise<void> {
    const data = await api.post<{ accessToken: string; user: AuthUser }>(
      '/api/auth/login',
      { email, password },
    )
    accessToken.value = data.accessToken
    user.value = data.user
  }

  async function refresh(): Promise<void> {
    try {
      const data = await api.post<{ accessToken: string }>('/api/auth/refresh')
      accessToken.value = data.accessToken
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        accessToken.value = null
        user.value = null
      }
      throw err
    }
  }

  async function logout(): Promise<void> {
    try {
      if (accessToken.value) {
        await api.post('/api/auth/logout', undefined, accessToken.value)
      }
    } finally {
      accessToken.value = null
      user.value = null
    }
  }

  return { accessToken, user, isAuthenticated, isAdmin, login, refresh, logout }
})
