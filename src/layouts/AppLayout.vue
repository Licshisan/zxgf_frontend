<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import {
  ChartAnalyticsIcon,
  ChatBubbleLockedIcon,
  MenuFoldIcon,
  MenuUnfoldIcon,
  RobotIcon,
  SettingIcon,
  TaskCheckedIcon,
  UserCircleIcon,
  SunnyIcon,
  MoonIcon,
} from 'tdesign-icons-vue-next'
import logoUrl from '@/assets/logo.webp'
import ChatSessionList from '@/components/ChatSessionList.vue'
import { useAuthStore } from '@/stores/auth'
import { type SessionSummary, useChatStore } from '@/stores/chat'

type ThemeMode = 'light' | 'dark'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const chatStore = useChatStore()
const themeMode = ref<ThemeMode>('light')
const routeMenuCollapsed = ref(false)
const renameDialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const renameTitle = ref('')
const operatingSessionId = ref('')

const activeMenu = computed(() => String(route.name || 'chat'))
const isDark = computed(() => themeMode.value === 'dark')

const topMenuItems = [
  { value: 'new-chat', label: '新建对话', icon: ChatBubbleLockedIcon },
  { value: 'resources', label: '我的资源', icon: RobotIcon },
  { value: 'evaluate', label: '测评中心', icon: TaskCheckedIcon },
  { value: 'profile', label: '学习画像', icon: ChartAnalyticsIcon },
]

const pageTitles: Record<string, string> = {
  profile: '学习画像',
  resources: '我的资源',
  chat: '新会话',
  evaluate: '测评中心',
  settings: '系统设置',
}

const pageTitle = computed(() => pageTitles[activeMenu.value] || 'AI 问答')
const topMenuValue = computed(() => {
  if (activeMenu.value === 'chat' && !chatStore.sessionId) return 'new-chat'
  return ['resources', 'evaluate', 'profile'].includes(activeMenu.value) ? activeMenu.value : ''
})
const headerTitle = computed(() =>
  activeMenu.value === 'chat' ? sessionTitle(chatStore.activeSession) : pageTitle.value,
)

function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle('dark', mode === 'dark')
  document.documentElement.setAttribute('theme-mode', mode)
  localStorage.setItem('theme-mode', mode)
}

function handleMenuChange(value: string | number) {
  router.push({ name: String(value) })
}

function handleTopMenuClick(value: string | number) {
  if (value === 'new-chat') {
    void handleCreateSession()
    return
  }

  router.push({ name: String(value) })
}

async function handleCreateSession() {
  chatStore.beginDraftSession()
  await router.push({ name: 'chat' })
}

async function handleOpenSession(sessionId: string) {
  if (!sessionId) return
  await router.push({
    name: 'chat',
    query: { sessionId },
  })
}

function openRenameDialog(session: SessionSummary) {
  operatingSessionId.value = session.id
  renameTitle.value = sessionTitle(session)
  renameDialogVisible.value = true
}

async function handleRenameConfirm() {
  try {
    await chatStore.renameSession(operatingSessionId.value, renameTitle.value)
    renameDialogVisible.value = false
    MessagePlugin.success('会话已重命名')
  } catch (error) {
    MessagePlugin.error(error instanceof Error ? error.message : '重命名失败')
  }
}

function openDeleteDialog(session: SessionSummary) {
  operatingSessionId.value = session.id
  deleteDialogVisible.value = true
}

async function handleDeleteConfirm() {
  try {
    const sessionId = await chatStore.deleteSession(operatingSessionId.value)
    deleteDialogVisible.value = false
    MessagePlugin.success('会话已删除')

    if (sessionId) {
      await router.push({
        name: 'chat',
        query: { sessionId },
      })
      return
    }

    await router.push({ name: 'chat' })
  } catch (error) {
    MessagePlugin.error(error instanceof Error ? error.message : '删除会话失败')
  }
}

function handleLogout() {
  auth.logout()
  router.replace('/login')
}

function toggleTheme(event: MouseEvent) {
  const nextMode: ThemeMode = themeMode.value === 'dark' ? 'light' : 'dark'

  if (!document.startViewTransition) {
    themeMode.value = nextMode
    return
  }

  const x = event.clientX
  const y = event.clientY
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  )
  const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]

  document.documentElement.classList.toggle('theme-transition-to-dark', nextMode === 'dark')
  document.documentElement.classList.toggle('theme-transition-to-light', nextMode === 'light')

  const transition = document.startViewTransition(async () => {
    themeMode.value = nextMode
    await nextTick()
  })

  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath,
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        fill: 'both',
        pseudoElement: '::view-transition-new(root)',
      },
    )
  })

  transition.finished.finally(() => {
    document.documentElement.classList.remove(
      'theme-transition-to-dark',
      'theme-transition-to-light',
    )
  })
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme-mode')
  themeMode.value = savedTheme === 'dark' ? 'dark' : 'light'
  applyTheme(themeMode.value)

  loadSidebarSessions()
})

watch(themeMode, applyTheme)

watch(
  () => auth.user?.id,
  () => {
    loadSidebarSessions()
  },
)

function loadSidebarSessions() {
  if (!auth.user || chatStore.loadingSessions) return
  void chatStore.loadSessions()
}

function sessionTitle(session?: SessionSummary | null) {
  return session?.title?.trim() || '新会话'
}
</script>

<template>
  <t-layout class="h-screen overflow-hidden">
    <t-aside
      v-show="!routeMenuCollapsed"
      width="240px"
      class="hidden h-screen shrink-0 flex-col overflow-hidden border-r md:flex"
      :class="isDark ? 'border-gray-800 bg-[#15171a]' : 'border-gray-200 bg-white'"
    >
      <div class="flex shrink-0 items-center gap-3 px-4 pb-3 pt-4">
        <img :src="logoUrl" alt="智学工坊" class="h-10 w-10 shrink-0 rounded-lg object-cover" />
        <div>
          <h1 class="m-0 text-xl font-semibold text-blue-600">智学工坊</h1>
          <p class="m-0 text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
            AI 学习智能体
          </p>
        </div>
      </div>

      <t-menu
        :value="topMenuValue"
        :theme="themeMode"
        class="compact-route-menu shrink-0 border-r-0"
      >
        <t-menu-item
          v-for="item in topMenuItems"
          :key="item.value"
          :value="item.value"
          @click="handleTopMenuClick(item.value)"
        >
          <template #icon><component :is="item.icon" /></template>
          {{ item.label }}
        </t-menu-item>
      </t-menu>

      <div class="flex h-0 min-h-[180px] min-w-0 max-w-full flex-1 overflow-hidden pt-1">
        <ChatSessionList
          :sessions="chatStore.sessions"
          :active-session-id="chatStore.sessionId"
          :loading="chatStore.loadingSessions"
          :is-dark="isDark"
          @open="handleOpenSession"
          @rename="openRenameDialog"
          @delete="openDeleteDialog"
        />
      </div>

      <div class="shrink-0 border-t pb-3 pt-2" :class="isDark ? 'border-gray-800' : 'border-gray-200'">
        <t-menu
          :value="activeMenu"
          :theme="themeMode"
          class="compact-route-menu shrink-0 border-r-0"
          @change="handleMenuChange"
        >
          <t-menu-item value="settings">
            <template #icon><SettingIcon /></template>
            系统设置
          </t-menu-item>
        </t-menu>
      </div>
    </t-aside>

    <t-layout class="h-screen min-w-0 overflow-hidden">
      <t-header
        class="relative flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6"
        :class="isDark ? 'border-gray-800 bg-[#15171a]' : 'border-gray-200 bg-white'"
      >
        <div class="flex min-w-0 items-center gap-2">
          <t-tooltip :content="routeMenuCollapsed ? '显示路由菜单' : '隐藏路由菜单'">
            <t-button
              variant="text"
              shape="square"
              class="route-menu-toggle"
              @click="routeMenuCollapsed = !routeMenuCollapsed"
            >
              <template #icon>
                <MenuUnfoldIcon v-if="routeMenuCollapsed" />
                <MenuFoldIcon v-else />
              </template>
            </t-button>
          </t-tooltip>
        </div>

        <h2
          class="pointer-events-none absolute left-1/2 m-0 max-w-[48vw] -translate-x-1/2 truncate text-base font-semibold"
          :class="isDark ? 'text-gray-100' : 'text-gray-900'"
        >
          {{ headerTitle }}
        </h2>

        <t-space align="center">
          <t-tooltip :content="isDark ? '切换浅色主题' : '切换暗黑主题'">
            <t-button variant="text" shape="square" @click="toggleTheme">
              <template #icon>
                <MoonIcon v-if="!isDark" />
                <SunnyIcon v-else />
              </template>
            </t-button>
          </t-tooltip>
          <t-dropdown>
            <t-avatar shape="round">{{ auth.user?.name?.slice(0, 1) || 'U' }}</t-avatar>
            <template #dropdown>
              <t-dropdown-menu>
                <t-dropdown-item>
                  <UserCircleIcon />
                  {{ auth.user?.name || '用户' }}
                </t-dropdown-item>
                <t-dropdown-item @click="handleLogout">退出登录</t-dropdown-item>
              </t-dropdown-menu>
            </template>
          </t-dropdown>
        </t-space>
      </t-header>

      <t-content
        class="app-scrollbar min-w-0 flex-1 overflow-y-auto"
        :class="isDark ? 'bg-[#101214]' : 'bg-white'"
      >
        <router-view />
      </t-content>
    </t-layout>

    <t-dialog
      v-model:visible="renameDialogVisible"
      header="重命名会话"
      confirm-btn="保存"
      cancel-btn="取消"
      :confirm-loading="chatStore.updatingSession"
      @confirm="handleRenameConfirm"
    >
      <t-input
        v-model="renameTitle"
        placeholder="请输入会话标题"
        clearable
        @enter="handleRenameConfirm"
      />
    </t-dialog>

    <t-dialog
      v-model:visible="deleteDialogVisible"
      header="删除会话"
      confirm-btn="删除"
      cancel-btn="取消"
      theme="warning"
      :confirm-loading="chatStore.deletingSession"
      @confirm="handleDeleteConfirm"
    >
      删除后该会话和历史消息将不可恢复。
    </t-dialog>
  </t-layout>
</template>

<style scoped>
:deep(.t-menu__item) {
  margin-bottom: 2px;
  border-right: 3px solid transparent;
}

:deep(.compact-route-menu .t-menu__item) {
  height: 32px;
  margin: 0 6px;
  border-radius: 6px;
  border-right: 0;
  padding-left: 10px !important;
  padding-right: 10px !important;
  font-size: 14px;
}

:deep(.compact-route-menu) {
  height: auto !important;
  flex: 0 0 auto;
  padding: 0 !important;
}

:deep(.t-menu__item.t-is-active) {
  color: #2563eb;
  background-color: rgba(37, 99, 235, 0.08);
}

.route-menu-toggle {
  display: none;
}

@media (min-width: 768px) {
  .route-menu-toggle {
    display: inline-flex;
  }
}

:global(::view-transition-old(root)),
:global(::view-transition-new(root)) {
  animation: none;
  mix-blend-mode: normal;
}

:global(::view-transition-new(root)) {
  z-index: 100;
}

:global(::view-transition-old(root)) {
  z-index: 1;
}
</style>
