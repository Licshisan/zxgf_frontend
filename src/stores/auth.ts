import { defineStore } from 'pinia'

import { AUTH_STORAGE_KEY } from '@/api/request'

export interface AuthUser {
  id?: string | number
  username?: string
  name: string
  email: string
  role?: string
}

interface StoredAuth {
  user: AuthUser | null
  token?: string
}

function readStoredAuth(): StoredAuth | null {
  const raw =
    window.sessionStorage.getItem(AUTH_STORAGE_KEY) || window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as AuthUser | StoredAuth
    if ('user' in parsed) return parsed
    return { user: parsed }
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

const storedAuth = readStoredAuth()

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: storedAuth?.user ?? null,
    token: storedAuth?.token ?? '',
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.user),
  },
  actions: {
    setSession(user: AuthUser, token?: string, remember = false) {
      this.user = user
      this.token = token || ''
      const storage = remember ? window.localStorage : window.sessionStorage
      const staleStorage = remember ? window.sessionStorage : window.localStorage
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }))
      staleStorage.removeItem(AUTH_STORAGE_KEY)
    },
    logout() {
      this.user = null
      this.token = ''
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
    },
  },
})
