<template>
  <div class="flex h-full w-full min-h-0 flex-col overflow-hidden px-1">
    <t-chat-list ref="listRef" class="chat-list" :clear-history="false">
        <div class="mx-auto w-full max-w-[860px] pt-4">
        <t-chat-message
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :placement="message.role === 'user' ? 'right' : 'left'"
          :variant="message.role === 'user' ? 'base' : 'text'"
          :handle-actions="{
            suggestion: ({ content }) => handleSuggestionClick(content.prompt),
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
  type ChatMessagesData,
  type ChatRequestParams,
  type TdChatListApi,
  useChat,
} from '@tdesign-vue-next/chat'
import { MessagePlugin } from 'tdesign-vue-next'

const inputValue = ref<string>('')
const listRef = ref<TdChatListApi | null>(null)

// 初始化消息
const defaultMessages: ChatMessagesData[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: [
      {
        type: 'text',
        status: 'complete',
        data: '你好！欢迎使用智博工坊，本系统是基于大模型打造的个性化资源生成与学习多智能体系统，可定制学习资料、习题、教案与专项学习方案，需要我帮你开启学习规划吗？',
      },
      {
        type: 'suggestion',
        status: 'complete',
        data: [
          {
            title: '介绍智博工坊多智能体运行原理',
            prompt: '详细介绍智博工坊多智能体系统运行原理',
          },
          {
            title: '如何生成定制化学习资源？',
            prompt: '在智博工坊中如何生成个性化定制学习资源',
          },
          {
            title: '智博工坊支持哪些学习场景？',
            prompt: '智博工坊能够覆盖哪些学习与资源生成场景',
          },
        ],
      },
    ],
  },
];

const { chatEngine, messages, status } = useChat({
  defaultMessages,
  chatServiceConfig: {
    endpoint: '/api/chat/stream',
    protocol: 'agui',
    stream: true,
    onRequest: (params: ChatRequestParams) => {
      console.log('请求参数:', messages.value)
      const newMessages = [...messages.value, { role: 'user', content: [{ type: 'text', data: params.prompt }] }]
      return {
        body: JSON.stringify({
          uid: 'agui-demo',
          messages: newMessages
        }),
      }
    }
  },
})

// 加载历史消息
onMounted(async () => {
  // try {
  //   const response = await fetch(
  //     'https://1257786608-9i9j1kpa67.ap-guangzhou.tencentscf.com/api/conversation/history?type=simple',
  //   )
  //   const result = await response.json()
  //   if (result.success && result.data) {
  //     const convertedMessages = AGUIAdapter.convertHistoryMessages(result.data)
  //     messages.value?.push(...convertedMessages)
  //     console.log(listRef.value)
  //     listRef.value?.scrollToBottom()
  //   }
  // } catch (error) {
  //   console.error('加载历史消息出错:', error)
  //   MessagePlugin.error('加载历史消息出错')
  // }
})

// 发送消息
const handleSend = async (params: string) => {
  await chatEngine.value?.sendUserMessage({ prompt: params })
  inputValue.value = ''
}

// 点击建议问题
const handleSuggestionClick = (prompt: string) => {
  inputValue.value = prompt;
};

// 停止生成
const handleStop = () => {
  chatEngine.value?.abortChat()
}
</script>
<style scoped>
.chat-list :deep(.t-chat__to-bottom) {
  bottom: 50px;
}
</style>