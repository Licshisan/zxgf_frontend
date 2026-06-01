import { MessagePlugin } from 'tdesign-vue-next'

import router from '@/router'

export const AUTH_STORAGE_KEY = 'smart-learning-auth'

interface StoredAuth {
  token?: string
  accessToken?: string
  user?: {
    token?: string
    accessToken?: string
  }
}

interface ApiErrorBody {
  message?: string | string[]
  error?: string
}

type ApiResponse<T> = T extends { data: unknown; status: number; headers: Headers }
  ? T
  : {
      data: T
      status: number
      headers: Headers
    }

function getStoredToken(): string | null {
  const raw =
    window.sessionStorage.getItem(AUTH_STORAGE_KEY) || window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    const auth = JSON.parse(raw) as StoredAuth
    return auth.token || auth.accessToken || auth.user?.token || auth.user?.accessToken || null
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

function parseMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== 'object') return fallback

  const body = data as ApiErrorBody
  if (Array.isArray(body.message)) return body.message.join('；')
  return body.message || body.error || fallback
}

async function parseBody(response: Response) {
  if ([204, 205, 304].includes(response.status)) return undefined

  const body = await response.text()
  if (!body) return undefined

  const contentType = response.headers.get('content-type')?.toLowerCase() || ''
  if (!contentType.includes('json')) return body

  try {
    return JSON.parse(body) as unknown
  } catch {
    return body
  }
}

async function handleAuthError(status: number) {
  if (status === 401) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
    MessagePlugin.warning('登录已过期，请重新登录')

    if (router.currentRoute.value.name !== 'login') {
      await router.replace({
        name: 'login',
        query: { redirect: router.currentRoute.value.fullPath },
      })
    }
    return
  }

  if (status === 403) {
    MessagePlugin.warning('没有权限访问该资源')
  }
}

export async function request<T>(url: string, options: RequestInit): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers)
  const token = getStoredToken()

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })
  const data = await parseBody(response)

  if (!response.ok) {
    await handleAuthError(response.status)

    const message = parseMessage(data, `请求失败：${response.status}`)
    if (response.status !== 401 && response.status !== 403) {
      MessagePlugin.error(message)
    }

    const error = new Error(message) as Error & { status?: number; data?: unknown }
    error.status = response.status
    error.data = data
    throw error
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as ApiResponse<T>
}
