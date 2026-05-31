import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const layoutPages = [
  { path: '', name: 'dashboard' },
  { path: 'profile', name: 'profile' },
  { path: 'resources', name: 'resources' },
  { path: 'chat', name: 'chat' },
  { path: 'evaluate', name: 'evaluate' },
  { path: 'knowledge', name: 'knowledge' },
  { path: 'settings', name: 'settings' },
  { path: 'help', name: 'help' },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: layoutPages.map((item) => ({
        path: item.path,
        name: item.name,
        component: () =>
          item.name === 'dashboard'
            ? import('@/views/DashboardView.vue')
            : item.name === 'profile'
              ? import('@/views/ProfileView.vue')
              : item.name === 'knowledge'
                ? import('@/views/KnowledgeView.vue')
              : import('@/views/BlankView.vue'),
      })),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
  ],
})

export default router
