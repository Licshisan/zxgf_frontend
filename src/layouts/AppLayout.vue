<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AppIcon,
  ChartAnalyticsIcon,
  ChatBubbleLockedIcon,
  DashboardIcon,
  HelpCircleIcon,
  NotificationIcon,
  RobotIcon,
  SettingIcon,
  TaskCheckedIcon,
  UserCircleIcon,
} from 'tdesign-icons-vue-next'
import logoUrl from '@/assets/logo.webp'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const activeMenu = computed(() => String(route.name || 'dashboard'))

const navItems = [
  { value: 'dashboard', label: '仪表盘', icon: DashboardIcon },
  { value: 'profile', label: '学习画像', icon: ChartAnalyticsIcon },
  { value: 'resources', label: '资源生成', icon: RobotIcon },
  { value: 'chat', label: 'AI 问答', icon: ChatBubbleLockedIcon },
  { value: 'evaluate', label: '测评中心', icon: TaskCheckedIcon },
]

function handleMenuChange(value: string | number) {
  router.push({ name: String(value) })
}

function handleLogout() {
  auth.logout()
  router.replace('/login')
}
</script>

<template>
  <t-layout class="min-h-screen">
    <t-aside
      width="240px"
      class="hidden flex-col gap-4 border-r border-gray-200 bg-white px-3 py-5 md:flex"
    >
      <div class="flex items-center gap-3 px-2">
        <img
          :src="logoUrl"
          alt="智学工坊"
          class="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
        <div>
          <h1 class="m-0 text-lg font-semibold text-blue-700">智学工坊</h1>
          <p class="m-0 text-xs text-gray-500">AI 学习空间</p>
        </div>
      </div>

      <t-menu :value="activeMenu" class="border-r-0" @change="handleMenuChange">
        <t-menu-item v-for="item in navItems" :key="item.value" :value="item.value">
          <template #icon><component :is="item.icon" /></template>
          {{ item.label }}
        </t-menu-item>
      </t-menu>

      <div class="mt-auto border-t border-gray-200 pt-3">
        <t-menu :value="activeMenu" class="border-r-0" @change="handleMenuChange">
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

    <t-layout>
      <t-header
        class="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6"
      >
        <t-breadcrumb>
          <t-breadcrumb-item>人工智能导论</t-breadcrumb-item>
          <t-breadcrumb-item>{{ activeMenu }}</t-breadcrumb-item>
        </t-breadcrumb>

        <t-space align="center">
          <t-button variant="text" shape="square">
            <template #icon><NotificationIcon /></template>
          </t-button>
          <t-button variant="text" shape="square">
            <template #icon><AppIcon /></template>
          </t-button>
          <t-dropdown>
            <t-avatar>{{ auth.user?.name?.slice(0, 1) || 'U' }}</t-avatar>
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

      <t-content class="min-w-0 bg-[#f7f9fc]">
        <router-view />
      </t-content>
    </t-layout>
  </t-layout>
</template>
