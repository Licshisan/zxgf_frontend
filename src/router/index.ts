import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const layoutPages = [
  { path: '', name: 'dashboard' },
  { path: 'profile', name: 'profile' },
  { path: 'resources', name: 'resources' },
  { path: 'chat', name: 'chat' },
  { path: 'evaluate', name: 'evaluate' },
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
        component: () => import('@/views/BlankView.vue'),
      })),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && auth.isLoggedIn) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
