<template>
  <div class="flex h-full w-full min-h-0 flex-col overflow-hidden">
    <div class="min-h-0 w-full flex-1 overflow-y-auto pt-4">
      <div class="mx-auto w-full max-w-[860px]">
        <t-chat-list ref="listRef" class="w-full" :clear-history="false">
          <t-chat-message
            v-for="message in messages"
            :key="message.id"
            :message="message"
            :placement="message.role === 'user' ? 'right' : 'left'"
            :variant="message.role === 'user' ? 'base' : 'text'"
          />
        </t-chat-list>
      </div>
    </div>

    <div class="w-full shrink-0 pb-4">
      <div class="mx-auto w-full max-w-[900px]">
        <t-chat-sender
          v-model="inputValue"
          class="w-full"
          placeholder="请输入内容，体验 AG-UI 协议"
          :loading="status === 'pending' || status === 'streaming'"
          @send="handleSend"
          @stop="handleStop"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  type ChatRequestParams,
  type TdChatListApi,
  AGUIAdapter,
  useChat,
} from '@tdesign-vue-next/chat'
import { MessagePlugin } from 'tdesign-vue-next'

const inputValue = ref<string>('')
const listRef = ref<TdChatListApi | null>(null)

const { chatEngine, messages, status } = useChat({
  defaultMessages: [],
  chatServiceConfig: {
    endpoint: '/api/chat/stream',
    protocol: 'agui',
    stream: true,
    onRequest: (params: ChatRequestParams) => ({
      body: JSON.stringify({
        uid: 'agui-demo',
        prompt: params.prompt,
      }),
    }),
    onStart: (chunk) => {
      console.log('AG-UI 流式传输开始:', chunk)
    },
    onComplete: (aborted, params, event) => {
      console.log('AG-UI 流式传输完成:', { aborted, event })
    },
    onError: (err) => {
      console.error('AG-UI 错误:', err)
    },
  },
})

onMounted(async () => {
  try {
    const response = await fetch(
      'https://1257786608-9i9j1kpa67.ap-guangzhou.tencentscf.com/api/conversation/history?type=simple',
    )
    const result = await response.json()
    if (result.success && result.data) {
      const convertedMessages = AGUIAdapter.convertHistoryMessages(result.data)
      chatEngine.value?.setMessages(convertedMessages)
      listRef.value?.scrollList()
    }
  } catch (error) {
    console.error('加载历史消息出错:', error)
    MessagePlugin.error('加载历史消息出错')
  }
})

// 发送消息
const handleSend = async (params: string) => {
  await chatEngine.value?.sendUserMessage({ prompt: params })
  inputValue.value = ''
}

// 停止生成
const handleStop = () => {
  chatEngine.value?.abortChat()
}
</script>
