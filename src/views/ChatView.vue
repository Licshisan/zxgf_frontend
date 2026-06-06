<template>
  <div class="flex h-full min-h-0 overflow-hidden bg-[#f7f9fc] dark:bg-[#101214]">
    <section class="flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-[#101214]">
      <t-chat-list ref="listRef" class="chat-list min-h-0 flex-1" :clear-history="false">
        <div class="mx-auto w-full max-w-[860px] pt-5">
          <div v-if="chatStore.loadingHistory" class="px-4 py-6">
            <t-chat-loading animation="skeleton" />
          </div>

          <t-chat-message
            v-for="message in messages"
            :key="message.id"
            :message="message"
            :placement="message.role === 'user' ? 'right' : 'left'"
            :variant="message.role === 'user' ? 'base' : 'text'"
            allow-content-segment-custom
            :handle-actions="{
              suggestion: ({ content }: { content: { prompt: string } }) =>
                handleSuggestionClick(content.prompt),
            }"
          >
            <template v-for="(item, index) in message.content" :key="`toolcall-${message.id}-${index}`">
              <div v-if="isToolCallSegment(item)" :slot="`${item.type}-${index}`" class="chat-tool-call">
                <div class="flex items-center gap-2">
                  <t-loading v-if="item.status !== 'complete'" size="small" />
                  <span class="font-medium">{{ toolCallStatusText(item) }}</span>
                </div>
                <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ toolCallDetailText(item) }}
                </div>
              </div>
            </template>
          </t-chat-message>
        </div>
      </t-chat-list>

      <div class="w-full shrink-0 bg-white px-3 pb-4 pt-0 dark:bg-[#101214]">
        <div class="mx-auto w-full max-w-[900px]">
          <t-chat-sender
            v-model="inputValue"
            class="w-full"
            placeholder="请输入内容，体验 AG-UI 协议"
            :loading="isChatBusy"
            @send="handleSend"
            @stop="handleStop"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  type AIMessageContent,
  type ChatMessagesData,
  type ChatRequestParams,
  type TdChatListApi,
  useChat,
} from '@tdesign-vue-next/chat'
import { MessagePlugin } from 'tdesign-vue-next'

import { useAuthStore } from '@/stores/auth'
import { chatWelcomeMessage, useChatStore } from '@/stores/chat'

interface AguiMessage {
  id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatStreamRequest {
  sessionId: string
  threadId: string
  messages: AguiMessage[]
  forwardedProps: {
    rag: { enabled: boolean; topK: number }
    profile: { enabled: boolean; update: boolean }
  }
}

type ChatContentSegment = AIMessageContent | { type: string; data?: unknown; status?: string; id?: string }

const route = useRoute()
const router = useRouter()
const inputValue = ref('')
const listRef = ref<TdChatListApi | null>(null)
const auth = useAuthStore()
const chatStore = useChatStore()

const isChatBusy = computed(
  () => chatStore.loadingHistory || status.value === 'pending' || status.value === 'streaming',
)

const { chatEngine, messages, status } = useChat({
  defaultMessages: chatStore.messages,
  chatServiceConfig: {
    endpoint: '/api/chat/stream',
    protocol: 'agui',
    stream: true,
    onRequest: (params: ChatRequestParams) => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (auth.token) headers.Authorization = `Bearer ${auth.token}`

      return {
        body: JSON.stringify(createRequestBody(params)),
        headers,
      }
    },
    onError: (error) => {
      MessagePlugin.error(error instanceof Error ? error.message : '对话请求失败')
    },
  },
})

onMounted(async () => {
  await initializeFromRoute()
})

watch(
  () => route.query.sessionId,
  async (sessionId) => {
    const nextSessionId = typeof sessionId === 'string' ? sessionId : ''
    if (!nextSessionId) {
      if (chatStore.sessionId || !chatStore.draftSession) {
        chatStore.beginDraftSession()
        chatEngine.value?.setMessages(chatStore.messages)
        await scrollToBottom()
      }
      return
    }

    if (nextSessionId === chatStore.sessionId) return
    await openSessionAndSyncRoute(nextSessionId, false)
  },
)

watch(
  () => chatStore.sessionId,
  async (sessionId) => {
    if (sessionId) {
      if (route.query.sessionId !== sessionId) await syncRouteSession(sessionId)
      chatEngine.value?.setMessages(chatStore.messages)
    } else {
      await clearRouteSession()
      chatEngine.value?.setMessages(chatStore.messages)
    }
    await scrollToBottom()
  },
)

watch(
  () => chatStore.draftVersion,
  async () => {
    if (chatStore.sessionId) return
    await clearRouteSession()
    chatEngine.value?.setMessages(chatStore.messages)
    await scrollToBottom()
  },
)

watch(
  messages,
  (value) => {
    chatStore.syncMessages(value)
  },
  { deep: true },
)

async function initializeFromRoute() {
  try {
    const routeSessionId = typeof route.query.sessionId === 'string' ? route.query.sessionId : undefined

    if (!routeSessionId && chatStore.draftSession) {
      chatEngine.value?.setMessages(chatStore.messages)
      await clearRouteSession()
      await scrollToBottom()
      return
    }

    const sessionId = await chatStore.initialize(auth.user, routeSessionId)
    chatEngine.value?.setMessages(chatStore.messages)
    await syncRouteSession(sessionId)
    await scrollToBottom()
  } catch (error) {
    chatStore.showHistoryError(error)
  }
}

async function openSessionAndSyncRoute(sessionId: string, updateRoute: boolean) {
  try {
    await chatStore.openSession(sessionId)
    chatEngine.value?.setMessages(chatStore.messages)
    if (updateRoute) await syncRouteSession(sessionId)
    await scrollToBottom()
  } catch (error) {
    MessagePlugin.error(error instanceof Error ? error.message : '打开会话失败')
    if (updateRoute) await initializeFromRoute()
  }
}

function isToolCallSegment(content: unknown): content is ChatContentSegment & {
  type: 'toolcall'
  data: Record<string, unknown>
} {
  return !!content && typeof content === 'object' && (content as { type?: string }).type === 'toolcall'
}

function toolCallStatusText(content: ChatContentSegment) {
  const name = toolCallDisplayName(content)
  if (content.status === 'complete') return `${name}已完成`
  if (content.status === 'error') return `${name}失败`
  return `正在${name}`
}

function toolCallDetailText(content: ChatContentSegment) {
  const data = getRecord(content.data)
  const argsText = typeof data.args === 'string' ? data.args : ''
  const resultText = typeof data.result === 'string' ? data.result : ''
  const query = extractJsonValue(argsText, 'query')
  const resultCount = extractJsonArrayLength(resultText, 'results')

  if (query && resultCount !== null) return `查询：${query}，命中 ${resultCount} 条结果`
  if (query) return `查询：${query}`
  if (resultCount !== null) return `命中 ${resultCount} 条结果`
  return typeof data.toolCallId === 'string' ? `调用 ID：${data.toolCallId}` : '工具调用进行中'
}

function toolCallDisplayName(content: ChatContentSegment) {
  const data = getRecord(content.data)
  const name = typeof data.toolCallName === 'string' ? data.toolCallName : '工具调用'

  const labels: Record<string, string> = {
    rag_search: '检索知识库',
    search: '检索',
  }

  return labels[name] || `调用 ${name}`
}

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function extractJsonValue(jsonText: string, key: string) {
  const parsed = parseJsonObject(jsonText)
  const value = parsed?.[key]
  return typeof value === 'string' ? value : ''
}

function extractJsonArrayLength(jsonText: string, key: string) {
  const parsed = parseJsonObject(jsonText)
  const value = parsed?.[key]
  return Array.isArray(value) ? value.length : null
}

function parseJsonObject(jsonText: string) {
  if (!jsonText.trim()) return null
  try {
    const parsed: unknown = JSON.parse(jsonText)
    return getRecord(parsed)
  } catch {
    return null
  }
}

function extractText(message: ChatMessagesData) {
  return (
    message.content
      ?.filter((item) => item.type === 'text' || item.type === 'markdown')
      .map((item) => String(item.data || ''))
      .join('\n')
      .trim() || ''
  )
}

function toAguiMessages(currentMessages: ChatMessagesData[], prompt: string): AguiMessage[] {
  const history = currentMessages
    .filter((message) => message.id !== chatWelcomeMessage.id)
    .map((message) => {
      const content = extractText(message)
      if (!content) return null

      return {
        id: message.id,
        role: message.role,
        content,
      } satisfies AguiMessage
    })
    .filter(Boolean) as AguiMessage[]

  const hasCurrentPrompt = [...history]
    .reverse()
    .some((message) => message.role === 'user' && message.content === prompt)

  if (!hasCurrentPrompt) {
    history.push({
      role: 'user',
      content: prompt,
    })
  }

  return history
}

function createRequestBody(params: ChatRequestParams): ChatStreamRequest {
  const sessionId = chatStore.sessionId || chatStore.userId

  return {
    sessionId,
    threadId: sessionId,
    messages: toAguiMessages(messages.value, params.prompt || ''),
    forwardedProps: {
      rag: { enabled: true, topK: 5 },
      profile: { enabled: true, update: true },
    },
  }
}

async function handleSend(params: string) {
  const prompt = params.trim()
  if (!prompt) return

  try {
    if (chatStore.draftSession || !chatStore.sessionId) {
      const sessionId = await chatStore.createSession({ switchTo: true })
      await syncRouteSession(sessionId)
    } else {
      await chatStore.ensureSession(auth.user)
    }

    if (!chatStore.activeSession?.title?.trim()) {
      chatStore.setSessionTitle(chatStore.sessionId, prompt)
    }

    await chatEngine.value?.sendUserMessage({ prompt })
    inputValue.value = ''
    window.setTimeout(() => {
      void chatStore.loadSessions({ silent: true })
    }, 1200)
  } catch (error) {
    MessagePlugin.error(error instanceof Error ? error.message : '发送消息失败')
  }
}

function handleSuggestionClick(prompt: string) {
  inputValue.value = prompt
}

function handleStop() {
  chatEngine.value?.abortChat()
}

async function syncRouteSession(sessionId: string) {
  if (!sessionId || route.query.sessionId === sessionId) return
  await router.replace({
    name: 'chat',
    query: { ...route.query, sessionId },
  })
}

async function clearRouteSession() {
  if (!route.query.sessionId) return
  const { sessionId, ...query } = route.query
  void sessionId
  await router.replace({
    name: 'chat',
    query,
  })
}

async function scrollToBottom() {
  await nextTick()
  listRef.value?.scrollToBottom()
}

</script>

<style scoped>
.chat-list :deep(.t-chat__to-bottom) {
  bottom: 50px;
}

.chat-tool-call {
  margin: 6px 0;
  border-radius: 6px;
  border: 1px solid #dbe3ee;
  background: #f8fafc;
  padding: 8px 10px;
  color: #334155;
  font-size: 13px;
}

:global(.dark) .chat-tool-call {
  border-color: #334155;
  background: #15171a;
  color: #d1d5db;
}

:global(.dark) .chat-list :deep(.t-chat__inner) {
  background: #101214;
}
</style>
