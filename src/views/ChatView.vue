<template>
  <div class="flex h-full w-full min-h-0 flex-col overflow-hidden px-1">
    <t-chat-list ref="listRef" class="chat-list" :clear-history="false">
      <div class="mx-auto w-full max-w-[860px] pt-4">
        <div
          v-if="chatStore.loadingHistory"
          class="flex items-center justify-center py-8 text-sm text-gray-500"
        >
          正在加载会话记录...
        </div>

        <t-chat-message
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :placement="message.role === 'user' ? 'right' : 'left'"
          :variant="message.role === 'user' ? 'base' : 'text'"
          :handle-actions="{
            suggestion: ({ content }: { content: { prompt: string } }) =>
              handleSuggestionClick(content.prompt),
          }"
        />
      </div>
    </t-chat-list>

    <div class="w-full shrink-0 pb-4">
      <div class="mx-auto w-full max-w-[900px]">
        <t-chat-sender
          v-model="inputValue"
          class="w-full"
          placeholder="请输入内容，体验 AG-UI 协议"
          :loading="chatStore.loadingHistory || status === 'pending' || status === 'streaming'"
          @send="handleSend"
          @stop="handleStop"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import {
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

const inputValue = ref('')
const listRef = ref<TdChatListApi | null>(null)
const auth = useAuthStore()
const chatStore = useChatStore()

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
  try {
    await chatStore.ensureSession(auth.user)
    chatEngine.value?.setMessages(chatStore.messages)
    await nextTick()
    listRef.value?.scrollToBottom()
  } catch (error) {
    chatStore.showHistoryError(error)
  }
})

watch(
  messages,
  (value) => {
    chatStore.syncMessages(value)
  },
  { deep: true },
)

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
    await chatStore.ensureSession(auth.user)
    await chatEngine.value?.sendUserMessage({ prompt })
    inputValue.value = ''
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
</script>

<style scoped>
.chat-list :deep(.t-chat__to-bottom) {
  bottom: 50px;
}
</style>
