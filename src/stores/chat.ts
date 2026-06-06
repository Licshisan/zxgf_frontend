import { defineStore } from 'pinia'
import type { ChatMessagesData } from '@tdesign-vue-next/chat'
import { MessagePlugin } from 'tdesign-vue-next'

import {
  sessionControllerCreateSession,
  sessionControllerDeleteSession,
  sessionControllerGetMySession,
  sessionControllerListMySessions,
  sessionControllerUpdateSession,
} from '@/api/generated'
import type { AuthUser } from '@/stores/auth'

type ChatRole = 'user' | 'assistant'

export interface SessionMessage {
  id: string
  role: ChatRole | string
  content: string
  createdAt?: string
}

export interface SessionSummary {
  id: string
  title?: string | null
  course?: string | null
  goal?: string | null
  metadata?: Record<string, unknown> | null
  createdAt?: string
  updatedAt?: string
  latestMessage?: SessionMessage | null
}

interface SessionRecord extends SessionSummary {
  messages?: SessionMessage[]
}

interface SessionListPayload {
  items?: SessionSummary[]
  page?: number
  pageSize?: number
  total?: number
}

interface ApiResponse<T> {
  data?: T
}

function readResponseData<T>(response: unknown): T | null {
  return (response as ApiResponse<T> | null)?.data ?? null
}

function isNotFoundError(error: unknown) {
  return (error as { status?: number } | null)?.status === 404
}

function getUserSessionId(user: AuthUser | null) {
  return user?.id === undefined || user.id === null ? '' : String(user.id)
}

function toChatMessage(message: SessionMessage): ChatMessagesData | null {
  const role = String(message.role).toLowerCase()
  if (role !== 'user' && role !== 'assistant') return null

  return {
    id: message.id,
    role,
    datetime: message.createdAt,
    content: [
      {
        type: 'text',
        status: 'complete',
        data: message.content,
      },
    ],
  } as ChatMessagesData
}

function upsertSession(sessions: SessionSummary[], session: SessionSummary) {
  const index = sessions.findIndex((item) => item.id === session.id)
  if (index === -1) return [session, ...sessions]

  const nextSessions = [...sessions]
  nextSessions[index] = { ...nextSessions[index], ...session }
  return nextSessions
}

export const chatWelcomeMessage: ChatMessagesData = {
  id: 'welcome',
  role: 'assistant',
  content: [
    {
      type: 'text',
      status: 'complete',
      data: '你好！欢迎使用智学工坊。我可以结合你的学习画像和知识库内容，帮助你生成学习资料、练习题、教案和专项学习方案。需要我先帮你梳理一个学习目标吗？',
    },
    {
      type: 'suggestion',
      status: 'complete',
      data: [
        {
          title: '介绍智学工坊多智能体运行原理',
          prompt: '详细介绍智学工坊多智能体系统的运行原理',
        },
        {
          title: '如何生成定制化学习资源？',
          prompt: '在智学工坊中如何生成个性化定制学习资源？',
        },
        {
          title: '智学工坊支持哪些学习场景？',
          prompt: '智学工坊能够覆盖哪些学习与资源生成场景？',
        },
      ],
    },
  ],
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    userId: '',
    sessionId: '',
    draftVersion: 0,
    initialized: false,
    draftSession: false,
    loadingSessions: false,
    loadingHistory: false,
    creatingSession: false,
    updatingSession: false,
    deletingSession: false,
    sessions: [] as SessionSummary[],
    messages: [chatWelcomeMessage] as ChatMessagesData[],
  }),
  getters: {
    activeSession: (state) => state.sessions.find((session) => session.id === state.sessionId),
  },
  actions: {
    async initialize(user: AuthUser | null, preferredSessionId?: string) {
      const defaultSessionId = getUserSessionId(user)
      if (!defaultSessionId) throw new Error('无法获取当前用户 ID')

      const userChanged = this.userId !== defaultSessionId
      this.userId = defaultSessionId

      if (userChanged) {
        this.sessionId = ''
        this.initialized = false
        this.messages = [chatWelcomeMessage]
      }

      await this.loadSessions()

      const targetSessionId = preferredSessionId || this.sessionId || this.sessions[0]?.id

      if (!targetSessionId) {
        this.beginDraftSession()
        this.initialized = true
        return this.sessionId
      }

      await this.openSession(targetSessionId)
      this.initialized = true
      return this.sessionId
    },
    async ensureSession(user: AuthUser | null) {
      if (this.sessionId && this.initialized && !this.draftSession) return this.sessionId
      return this.initialize(user)
    },
    async loadSessions(options: { silent?: boolean } = {}) {
      if (!options.silent) this.loadingSessions = true
      try {
        const response = await sessionControllerListMySessions()
        const payload = readResponseData<SessionListPayload>(response)
        this.sessions = payload?.items ?? []
      } finally {
        if (!options.silent) this.loadingSessions = false
      }
    },
    async createSession(options: { switchTo?: boolean; title?: string } = {}) {
      this.creatingSession = true
      try {
        const title = options.title?.trim()
        const created = readResponseData<SessionRecord>(
          await sessionControllerCreateSession({
            ...(title ? { title } : {}),
            metadata: { source: 'chat-manual' },
          }),
        )
        if (!created?.id) throw new Error('创建会话失败')

        this.sessions = upsertSession(this.sessions, created)
        if (options.switchTo !== false) {
          this.sessionId = created.id
          this.draftSession = false
          this.messages = [chatWelcomeMessage]
        }
        return created.id
      } finally {
        this.creatingSession = false
      }
    },
    setSessionTitle(sessionId: string, title: string) {
      const nextTitle = title.replace(/\s+/g, ' ').trim()
      if (!nextTitle) return
      const normalizedTitle = nextTitle.length > 30 ? `${nextTitle.slice(0, 30)}...` : nextTitle
      this.sessions = upsertSession(this.sessions, { id: sessionId, title: normalizedTitle })
    },
    beginDraftSession() {
      this.sessionId = ''
      this.draftSession = true
      this.draftVersion += 1
      this.messages = [chatWelcomeMessage]
    },
    async openSession(sessionId: string) {
      if (!sessionId) throw new Error('会话 ID 为空')

      this.loadingHistory = true
      try {
        const session = await this.loadSession(sessionId)
        this.sessionId = session.id
        this.draftSession = false
        this.sessions = upsertSession(this.sessions, session)
        this.replaceHistory(session.messages ?? [])
        return session.id
      } catch (error) {
        if (isNotFoundError(error)) {
          this.sessions = this.sessions.filter((session) => session.id !== sessionId)
          throw new Error('会话不存在或无权访问')
        }
        throw error
      } finally {
        this.loadingHistory = false
      }
    },
    async loadSession(sessionId: string) {
      const response = await sessionControllerGetMySession(sessionId)
      const session = readResponseData<SessionRecord>(response)
      if (!session?.id) throw new Error('会话数据为空')
      return session
    },
    async renameSession(sessionId: string, title: string) {
      const nextTitle = title.trim()
      if (!nextTitle) throw new Error('会话标题不能为空')

      this.updatingSession = true
      try {
        const updated = readResponseData<SessionRecord>(
          await sessionControllerUpdateSession(sessionId, { title: nextTitle }),
        )
        this.sessions = upsertSession(this.sessions, updated?.id ? updated : { id: sessionId, title: nextTitle })
      } finally {
        this.updatingSession = false
      }
    },
    async deleteSession(sessionId: string) {
      this.deletingSession = true
      try {
        await sessionControllerDeleteSession(sessionId)
        this.sessions = this.sessions.filter((session) => session.id !== sessionId)

        if (this.sessionId !== sessionId) return this.sessionId

        const nextSessionId = this.sessions[0]?.id
        if (nextSessionId) {
          await this.openSession(nextSessionId)
          return nextSessionId
        }

        const createdId = await this.createSession({ switchTo: true })
        return createdId
      } finally {
        this.deletingSession = false
      }
    },
    replaceHistory(history: SessionMessage[]) {
      const historyMessages = history.map(toChatMessage).filter(Boolean) as ChatMessagesData[]
      this.messages = historyMessages.length ? historyMessages : [chatWelcomeMessage]
    },
    syncMessages(messages: ChatMessagesData[]) {
      this.messages = messages.length ? [...messages] : [chatWelcomeMessage]
    },
    reset() {
      this.userId = ''
      this.sessionId = ''
      this.draftVersion = 0
      this.initialized = false
      this.draftSession = false
      this.loadingSessions = false
      this.loadingHistory = false
      this.creatingSession = false
      this.updatingSession = false
      this.deletingSession = false
      this.sessions = []
      this.messages = [chatWelcomeMessage]
    },
    showHistoryError(error: unknown) {
      MessagePlugin.error(error instanceof Error ? error.message : '加载会话记录失败')
    },
  },
})
