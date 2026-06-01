import { defineStore } from 'pinia'

import { AUTH_STORAGE_KEY } from '@/api/request'

interface AuthUser {
  name: string
  email: string
}

interface LoginPayload {
  account: string
  password: string
}

interface RegisterPayload {
  name: string
  email: string
  password: string
}

interface StoredAuth {
  user: AuthUser | null
  token?: string
}

function readStoredAuth(): StoredAuth | null {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as AuthUser | StoredAuth
    if ('user' in parsed) return parsed
    return { user: parsed }
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
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
    setSession(user: AuthUser, token?: string) {
      this.user = user
      this.token = token || ''
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }))
    },
    login(payload: LoginPayload) {
      const account = payload.account.trim()
      if (!account || !payload.password) {
        throw new Error('请输入账号和密码')
      }

      this.setSession({
        name: account.includes('@') ? account.split('@')[0] || '学生用户' : account,
        email: account.includes('@') ? account : `${account}@demo.local`,
      })
    },
    register(payload: RegisterPayload) {
      const name = payload.name.trim()
      const email = payload.email.trim()
      if (!name || !email || !payload.password) {
        throw new Error('请完整填写注册信息')
      }

      this.setSession({ name, email })
    },
    logout() {
      this.user = null
      this.token = ''
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
    },
  },
})
