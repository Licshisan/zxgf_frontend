import { defineStore } from 'pinia'

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

const STORAGE_KEY = 'smart-learning-auth'

function readStoredUser(): AuthUser | null {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: readStoredUser() as AuthUser | null,
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.user),
  },
  actions: {
    login(payload: LoginPayload) {
      const account = payload.account.trim()
      if (!account || !payload.password) {
        throw new Error('请输入账号和密码')
      }

      this.user = {
        name: account.includes('@') ? account.split('@')[0] || '学生用户' : account,
        email: account.includes('@') ? account : `${account}@demo.local`,
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user))
    },
    register(payload: RegisterPayload) {
      const name = payload.name.trim()
      const email = payload.email.trim()
      if (!name || !email || !payload.password) {
        throw new Error('请完整填写注册信息')
      }

      this.user = { name, email }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.user))
    },
    logout() {
      this.user = null
      window.localStorage.removeItem(STORAGE_KEY)
    },
  },
})
