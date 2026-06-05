import { defineStore } from 'pinia'
import type { ChatMessagesData } from '@tdesign-vue-next/chat'
import { MessagePlugin } from 'tdesign-vue-next'

import { sessionControllerCreateSession, sessionControllerGetMySession } from '@/api/generated'
import type { AuthUser } from '@/stores/auth'

type ChatRole = 'user' | 'assistant'

interface SessionMessage {
  id: string
  role: ChatRole | string
  content: string
  createdAt?: string
}

interface SessionRecord {
  id: string
  messages?: SessionMessage[]
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
  if (message.role !== 'user' && message.role !== 'assistant') return null

  return {
    id: message.id,
    role: message.role,
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
    initialized: false,
    loadingHistory: false,
    messages: [chatWelcomeMessage] as ChatMessagesData[],
  }),
  actions: {
    async ensureSession(user: AuthUser | null) {
      const defaultSessionId = getUserSessionId(user)
      if (!defaultSessionId) throw new Error('无法获取当前用户 ID')

      if (this.initialized && this.userId === defaultSessionId && this.sessionId) {
        return this.sessionId
      }

      this.userId = defaultSessionId
      this.sessionId = defaultSessionId
      this.loadingHistory = true

      try {
        const session = await this.loadSession(defaultSessionId)
        this.sessionId = session.id
        this.replaceHistory(session.messages ?? [])
      } catch (error) {
        if (!isNotFoundError(error)) throw error

        const created = readResponseData<SessionRecord>(
          await sessionControllerCreateSession({
            title: '默认会话',
            metadata: { source: 'chat-default', defaultUserSessionId: defaultSessionId },
          }),
        )
        if (!created?.id) throw new Error('创建默认会话失败')

        this.sessionId = created.id
        this.messages = [chatWelcomeMessage]
      } finally {
        this.initialized = true
        this.loadingHistory = false
      }

      return this.sessionId
    },
    async loadSession(sessionId: string) {
      const response = await sessionControllerGetMySession(sessionId)
      const session = readResponseData<SessionRecord>(response)
      if (!session?.id) throw new Error('会话数据为空')
      return session
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
      this.initialized = false
      this.loadingHistory = false
      this.messages = [chatWelcomeMessage]
    },
    showHistoryError(error: unknown) {
      MessagePlugin.error(error instanceof Error ? error.message : '加载会话记录失败')
    },
  },
})
