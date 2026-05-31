<template>
  <main class="grid h-full min-h-0 grid-cols-1 bg-[#f7f9fc] lg:grid-cols-[280px_minmax(0,1fr)]">
    <aside class="hidden min-h-0 flex-col border-r border-gray-200 bg-white lg:flex">
      <div class="border-b border-gray-200 p-4">
        <h1 class="m-0 text-lg font-semibold text-gray-900">知识目录</h1>
        <p class="mb-0 mt-1 text-xs text-gray-500">《人工智能导论》</p>
        <t-input class="mt-3" size="small" placeholder="搜索知识点" clearable>
          <template #prefixIcon><Icon icon="material-symbols:search" /></template>
        </t-input>
      </div>

      <div class="app-scrollbar flex-1 overflow-y-auto p-3">
        <t-collapse default-value="ml">
          <t-collapse-panel value="overview" header="1. 概述与历史">
            <div class="flex flex-col gap-1 text-sm text-gray-500">
              <button class="catalog-item">1.1 人工智能定义</button>
              <button class="catalog-item">1.2 发展阶段</button>
            </div>
          </t-collapse-panel>
          <t-collapse-panel value="ml" header="2. 机器学习基础">
            <div class="flex flex-col gap-1 text-sm">
              <button class="catalog-item">2.1 监督学习与无监督学习</button>
              <button class="catalog-item">2.2 线性回归与逻辑回归</button>
              <button class="catalog-item active">2.3 神经网络初步</button>
              <button class="catalog-item">2.4 支持向量机</button>
            </div>
          </t-collapse-panel>
          <t-collapse-panel value="deep" header="3. 深度学习进阶">
            <div class="flex flex-col gap-1 text-sm text-gray-500">
              <button class="catalog-item">3.1 卷积神经网络</button>
              <button class="catalog-item">3.2 循环神经网络</button>
            </div>
          </t-collapse-panel>
        </t-collapse>
      </div>
    </aside>

    <section class="flex min-h-0 flex-col bg-white">
      <div class="flex items-center justify-between border-b border-gray-200 px-5 py-3">
        <t-space align="center">
          <t-avatar shape="round" theme="primary">
            <template #icon><Icon icon="material-symbols:forum" /></template>
          </t-avatar>
          <div>
            <h2 class="m-0 text-lg font-semibold text-gray-900">AI 问答</h2>
            <p class="m-0 text-xs text-gray-500">学习目标：掌握神经网络基础</p>
          </div>
        </t-space>
        <t-tag theme="primary" variant="light">课程知识库问答</t-tag>
      </div>

      <t-chatbot class="min-h-0 flex-1" :chat-service-config="chatServiceConfig" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { AIMessageContent, ChatServiceConfig, SSEChunkData } from '@tdesign-vue-next/chat'

const chatServiceConfig: ChatServiceConfig = {
  endpoint: 'https://1257786608-9i9j1kpa67.ap-guangzhou.tencentscf.com/sse/normal',
  stream: true,
  onMessage: (chunk: SSEChunkData): AIMessageContent => {
    const { ...rest } = chunk.data as any
    return {
      type: 'markdown',
      data: rest?.msg || '',
    }
  },
}
</script>

<style scoped>
.catalog-item {
  width: 100%;
  border: 0;
  border-radius: 6px;
  background: transparent;
  padding: 6px 8px;
  color: #4b5563;
  text-align: left;
  cursor: pointer;
}

.catalog-item:hover {
  background: #f3f4f6;
  color: #0052d9;
}

.catalog-item.active {
  background: #eff6ff;
  color: #0052d9;
  font-weight: 600;
}
</style>
