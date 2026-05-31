<template>
  <main class="grid h-full min-h-0 grid-cols-1 bg-[#f7f9fc] lg:grid-cols-[minmax(0,1fr)_420px]">
    <section class="min-h-0 bg-white">
      <t-chatbot class="h-full" :chat-service-config="chatServiceConfig" />
    </section>

    <aside class="flex min-h-0 flex-col border-l border-gray-200 bg-white">
      <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <t-space align="center">
          <Icon icon="material-symbols:person-search" class="text-blue-600" width="22" />
          <h2 class="m-0 text-lg font-semibold text-gray-900">动态学习画像</h2>
        </t-space>
        <t-tag theme="success" variant="light">实时更新</t-tag>
      </div>

      <div class="app-scrollbar flex-1 overflow-y-auto p-5">
        <div class="flex flex-col gap-4">
          <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div class="mb-2 flex items-center justify-between">
              <span class="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Icon icon="material-symbols:psychology" class="text-gray-500" />
                认知风格
              </span>
              <Icon icon="material-symbols:check-circle" class="text-emerald-600" />
            </div>
            <div class="flex items-end gap-2">
              <span class="text-2xl font-semibold text-blue-700">实践型</span>
              <span class="pb-1 text-xs text-gray-500">Project-Based Learner</span>
            </div>
            <t-progress class="mt-3" :percentage="76" theme="success" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="card in portraitCards"
              :key="card.label"
              class="rounded-lg border border-gray-200 bg-white p-4"
            >
              <Icon :icon="card.icon" class="mb-3 text-gray-500" width="22" />
              <p class="m-0 text-xs text-gray-500">{{ card.label }}</p>
              <p class="mb-1 mt-2 text-base font-semibold text-gray-900">{{ card.value }}</p>
              <p class="m-0 text-xs leading-5 text-gray-500">{{ card.desc }}</p>
            </div>
          </div>

          <t-card :bordered="true">
            <template #title>
              <t-space align="center" size="small">
                <Icon icon="material-symbols:label" class="text-gray-500" />
                <span>画像标签</span>
              </t-space>
            </template>
            <div class="flex flex-wrap gap-2">
              <t-tag v-for="tag in skillTags" :key="tag" theme="primary" variant="light">
                {{ tag }}
              </t-tag>
            </div>
          </t-card>

          <t-card :bordered="true">
            <template #title>
              <t-space align="center" size="small">
                <Icon icon="material-symbols:troubleshoot" class="text-gray-500" />
                <span>潜在薄弱点</span>
              </t-space>
            </template>
            <div
              class="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-8 text-gray-500"
            >
              <Icon icon="material-symbols:sync" class="mb-2 animate-spin" width="28" />
              <span class="text-sm">正在推断潜在薄弱点...</span>
            </div>
          </t-card>
        </div>
      </div>
    </aside>
  </main>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { SSEChunkData, AIMessageContent, ChatServiceConfig } from '@tdesign-vue-next/chat'

/**
 * 快速开始示例
 *
 * 学习目标：
 * - 了解 Chatbot 组件的最小配置
 * - 理解 endpoint 和 onMessage 的作用
 * - 实现一个基于SSE流式传输的最简可用的对话界面
 */

const portraitCards = [
  { label: '当前知识储备', value: 'Python 基础', desc: 'Level 2 / 5', icon: 'material-symbols:database' },
  { label: '预期投入', value: '2 小时/天', desc: '适合短周期项目任务', icon: 'material-symbols:schedule' },
  { label: '学习偏好', value: '项目驱动', desc: '实践优先，理论辅助', icon: 'material-symbols:construction' },
  { label: '反馈方式', value: '即时纠错', desc: '适合边做边改', icon: 'material-symbols:fact-check' },
]

const skillTags = ['Python', '算法基础', '项目实践', '可视化学习']

// 聊天服务配置
const chatServiceConfig: ChatServiceConfig = {
  // 对话服务地址
  endpoint: 'https://1257786608-9i9j1kpa67.ap-guangzhou.tencentscf.com/sse/normal',
  // 开启流式传输
  stream: true,
  // 解析后端返回的数据，转换为组件所需格式
  onMessage: (chunk: SSEChunkData): AIMessageContent => {
    const { ...rest } = chunk.data as any
    return {
      type: 'markdown',
      data: rest?.msg || '',
    }
  },
}
</script>
