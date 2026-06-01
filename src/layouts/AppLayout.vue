<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AppIcon,
  ChartAnalyticsIcon,
  ChatBubbleLockedIcon,
  DashboardIcon,
  HelpCircleIcon,
  MenuFoldIcon,
  NotificationIcon,
  RobotIcon,
  SettingIcon,
  TaskCheckedIcon,
  UserCircleIcon,
  FolderIcon,
  SunnyIcon,
  MoonIcon,
} from 'tdesign-icons-vue-next'
import logoUrl from '@/assets/logo.webp'
import { useAuthStore } from '@/stores/auth'

type ThemeMode = 'light' | 'dark'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const themeMode = ref<ThemeMode>('light')
const mobileMenuVisible = ref(false)

const activeMenu = computed(() => String(route.name || 'chat'))
const isDark = computed(() => themeMode.value === 'dark')

const navItems = [
  { value: 'chat', label: 'AI 问答', icon: ChatBubbleLockedIcon },
  { value: 'dashboard', label: '仪表盘', icon: DashboardIcon },
  { value: 'profile', label: '学习画像', icon: ChartAnalyticsIcon },
  { value: 'resources', label: '资源生成', icon: RobotIcon },
  { value: 'evaluate', label: '测评中心', icon: TaskCheckedIcon },
  { value: 'knowledge', label: '知识库', icon: FolderIcon },
]

const pageTitles: Record<string, string> = {
  dashboard: '仪表盘',
  profile: '学习画像',
  resources: '资源生成',
  chat: 'AI 问答',
  evaluate: '测评中心',
  knowledge: '知识库',
  settings: '系统设置',
  help: '帮助中心',
}

const pageTitle = computed(() => pageTitles[activeMenu.value] || 'AI 问答')

function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle('dark', mode === 'dark')
  document.documentElement.setAttribute('theme-mode', mode)
  localStorage.setItem('theme-mode', mode)
}

function handleMenuChange(value: string | number) {
  router.push({ name: String(value) })
  mobileMenuVisible.value = false
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
})

watch(themeMode, applyTheme)
</script>

<template>
  <t-layout class="h-screen overflow-hidden">
    <t-aside
      width="240px"
      class="hidden h-screen shrink-0 flex-col gap-4 overflow-hidden border-r pt-5 md:flex"
      :class="isDark ? 'border-gray-800 bg-[#15171a]' : 'border-gray-200 bg-white'"
    >
      <div class="flex items-center gap-3 px-4">
        <img :src="logoUrl" alt="智学工坊" class="h-10 w-10 shrink-0 rounded-lg object-cover" />
        <div>
          <h1 class="m-0 text-xl font-semibold text-blue-600">智学工坊</h1>
          <p class="m-0 text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
            AI 学习智能体
          </p>
        </div>
      </div>

      <t-menu :value="activeMenu" :theme="themeMode" class="border-r-0" @change="handleMenuChange">
        <t-menu-item v-for="item in navItems" :key="item.value" :value="item.value">
          <template #icon><component :is="item.icon" /></template>
          {{ item.label }}
        </t-menu-item>
      </t-menu>

      <div class="mt-auto border-t pt-2" :class="isDark ? 'border-gray-800' : 'border-gray-200'">
        <t-menu :value="activeMenu" :theme="themeMode" @change="handleMenuChange">
          <t-menu-item value="settings">
            <template #icon><SettingIcon /></template>
            系统设置
          </t-menu-item>
          <t-menu-item value="help">
            <template #icon><HelpCircleIcon /></template>
            帮助中心
          </t-menu-item>
        </t-menu>
      </div>
    </t-aside>

    <t-layout class="h-screen min-w-0 overflow-hidden">
      <t-header
        class="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6"
        :class="isDark ? 'border-gray-800 bg-[#15171a]' : 'border-gray-200 bg-white'"
      >
        <div class="flex min-w-0 items-center gap-2">
          <t-button
            variant="text"
            shape="square"
            class="mobile-menu-button"
            @click="mobileMenuVisible = true"
          >
            <template #icon><MenuFoldIcon /></template>
          </t-button>

          <t-breadcrumb class="min-w-0">
            <t-breadcrumb-item class="font-semibold !text-blue-600">智学工坊</t-breadcrumb-item>
            <t-breadcrumb-item>{{ pageTitle }}</t-breadcrumb-item>
          </t-breadcrumb>
        </div>

        <t-space align="center">
          <t-tooltip :content="isDark ? '切换浅色主题' : '切换暗黑主题'">
            <t-button variant="text" shape="square" @click="toggleTheme">
              <template #icon>
                <MoonIcon v-if="!isDark" />
                <SunnyIcon v-else />
              </template>
            </t-button>
          </t-tooltip>
          <t-button variant="text" shape="square">
            <template #icon><NotificationIcon /></template>
          </t-button>
          <t-button variant="text" shape="square">
            <template #icon><AppIcon /></template>
          </t-button>
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

      <t-drawer
        v-model:visible="mobileMenuVisible"
        placement="left"
        :footer="false"
        size="280px"
        :header="false"
      >
        <div
          class="flex h-full flex-col gap-4 pt-1"
          :class="isDark ? 'bg-[#15171a] text-gray-100' : 'bg-white text-gray-900'"
        >
          <div class="flex items-center gap-3 px-1 pb-3">
            <img :src="logoUrl" alt="智学工坊" class="h-10 w-10 shrink-0 rounded-lg object-cover" />
            <div class="min-w-0">
              <h2 class="m-0 text-lg font-semibold text-blue-600">智学工坊</h2>
              <p class="m-0 text-xs" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
                AI 学习智能体
              </p>
            </div>
          </div>

          <t-menu
            :value="activeMenu"
            :theme="themeMode"
            class="border-r-0"
            @change="handleMenuChange"
          >
            <t-menu-item v-for="item in navItems" :key="item.value" :value="item.value">
              <template #icon><component :is="item.icon" /></template>
              {{ item.label }}
            </t-menu-item>
          </t-menu>

          <div
            class="mt-auto border-t pt-2"
            :class="isDark ? 'border-gray-800' : 'border-gray-200'"
          >
            <t-menu :value="activeMenu" :theme="themeMode" @change="handleMenuChange">
              <t-menu-item value="settings">
                <template #icon><SettingIcon /></template>
                系统设置
              </t-menu-item>
              <t-menu-item value="help">
                <template #icon><HelpCircleIcon /></template>
                帮助中心
              </t-menu-item>
            </t-menu>
          </div>
        </div>
      </t-drawer>

      <t-content
        class="app-scrollbar min-w-0 flex-1 overflow-y-auto"
        :class="isDark ? 'bg-[#101214]' : 'bg-white'"
      >
        <router-view />
      </t-content>
    </t-layout>
  </t-layout>
</template>

<style scoped>
:deep(.t-menu__item) {
  margin-bottom: 12px;
  border-right: 3px solid transparent;
}

:deep(.t-menu__item.t-is-active) {
  border-right-color: #2563eb;
}

.mobile-menu-button {
  display: inline-flex;
}

@media (min-width: 768px) {
  .mobile-menu-button {
    display: none !important;
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
