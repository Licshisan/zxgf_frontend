<template>
  <div class="flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-hidden">
    <div class="flex h-9 shrink-0 items-center px-3">
      <span class="text-xs font-medium" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
        最近会话
      </span>
    </div>

    <div class="app-scrollbar min-h-0 min-w-0 max-w-full flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4">
      <div v-if="loading" class="py-6 text-center text-xs text-gray-500">正在加载会话...</div>

      <div
        v-for="session in sessions"
        v-else-if="sessions.length"
        :key="session.id"
        role="button"
        tabindex="0"
        class="group mb-1 flex h-9 w-full min-w-0 max-w-full items-center gap-1 overflow-hidden rounded-md px-2 text-left transition-colors"
        :class="sessionItemClass(session.id)"
        @click="$emit('open', session.id)"
        @keydown.enter="$emit('open', session.id)"
      >
        <span class="min-w-0 flex-1 truncate text-sm">{{ sessionTitle(session) }}</span>

        <t-dropdown class="session-actions shrink-0" trigger="click" @click="handleMenuClick($event, session)">
          <t-button
            class="session-action-button opacity-70 group-hover:opacity-100"
            shape="square"
            size="small"
            variant="text"
            @click.stop
          >
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

      <div v-else class="px-3 py-6 text-center text-xs text-gray-500">暂无会话</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DropdownOption } from 'tdesign-vue-next'
import { DeleteIcon, EditIcon, MoreIcon } from 'tdesign-icons-vue-next'

import type { SessionSummary } from '@/stores/chat'

const props = defineProps<{
  sessions: SessionSummary[]
  activeSessionId: string
  loading: boolean
  isDark?: boolean
}>()

const emit = defineEmits<{
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

function sessionItemClass(sessionId: string) {
  if (sessionId === props.activeSessionId) {
    return props.isDark ? 'bg-blue-500/15 text-blue-300' : 'bg-blue-50 text-blue-700'
  }

  return props.isDark
    ? 'text-gray-300 hover:bg-white/5 hover:text-white'
    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
}
</script>

<style scoped>
:deep(.session-actions) {
  flex: 0 0 28px;
  width: 28px;
  min-width: 28px;
  max-width: 28px;
}

:deep(.session-action-button) {
  width: 28px;
  min-width: 28px;
  max-width: 28px;
}
</style>
