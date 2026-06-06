<template>
  <aside class="hidden min-h-0 border-r border-gray-200 bg-white md:flex">
    <div class="flex h-full min-h-0 w-full flex-col bg-white">
      <div class="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-4">
        <div class="flex min-w-0 items-center gap-2">
          <ChatBubbleHistoryIcon class="text-blue-600" size="20px" />
          <span class="font-semibold text-gray-900">历史会话</span>
        </div>
        <t-button
          shape="square"
          theme="primary"
          variant="text"
          :loading="creatingSession"
          @click="$emit('create')"
        >
          <template #icon><AddIcon /></template>
        </t-button>
      </div>

      <div class="app-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
        <div v-if="loading" class="py-8 text-center text-sm text-gray-500">正在加载会话...</div>

        <div
          v-for="session in sessions"
          v-else-if="sessions.length"
          :key="session.id"
          role="button"
          tabindex="0"
          class="group mb-2 flex w-full min-w-0 items-start gap-2 rounded-md border p-3 text-left transition-colors"
          :class="
            session.id === activeSessionId
              ? 'border-blue-200 bg-blue-50'
              : 'border-transparent bg-white hover:border-gray-200 hover:bg-gray-50'
          "
          @click="$emit('open', session.id)"
          @keydown.enter="$emit('open', session.id)"
        >
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium text-gray-900">{{ sessionTitle(session) }}</div>
            <div class="mt-2 text-xs text-gray-400">{{ formatSessionTime(session.updatedAt) }}</div>
          </div>

          <t-dropdown trigger="click" @click="handleMenuClick($event, session)">
            <t-button shape="square" size="small" variant="text" @click.stop>
              <template #icon><MoreIcon /></template>
            </t-button>
            <template #dropdown>
              <t-dropdown-menu>
                <t-dropdown-item value="rename">
                  <EditIcon />
                  重命名
                </t-dropdown-item>
                <t-dropdown-item value="delete" theme="error">
                  <DeleteIcon />
                  删除
                </t-dropdown-item>
              </t-dropdown-menu>
            </template>
          </t-dropdown>
        </div>

        <div v-else class="py-8 text-center text-sm text-gray-500">暂无会话</div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { DropdownOption } from 'tdesign-vue-next'
import {
  AddIcon,
  ChatBubbleHistoryIcon,
  DeleteIcon,
  EditIcon,
  MoreIcon,
} from 'tdesign-icons-vue-next'

import type { SessionSummary } from '@/stores/chat'

defineProps<{
  sessions: SessionSummary[]
  activeSessionId: string
  loading: boolean
  creatingSession: boolean
}>()

const emit = defineEmits<{
  create: []
  open: [sessionId: string]
  rename: [session: SessionSummary]
  delete: [session: SessionSummary]
}>()

function handleMenuClick(item: DropdownOption, session: SessionSummary) {
  if (item.value === 'rename') {
    emit('rename', session)
    return
  }

  if (item.value === 'delete') {
    emit('delete', session)
  }
}

function sessionTitle(session?: SessionSummary | null) {
  return session?.title?.trim() || '新会话'
}

function formatSessionTime(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
