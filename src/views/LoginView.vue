<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import {
  ArrowRightIcon,
  ChartLineIcon,
  CheckIcon,
  EducationIcon,
  MapRoutePlanningIcon,
  RobotIcon,
  UserIcon,
} from 'tdesign-icons-vue-next'
import logoUrl from '@/assets/logo.webp'
import { useAuthStore } from '@/stores/auth'

type AuthTab = 'login' | 'register'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const activeTab = ref<AuthTab>(route.name === 'register' ? 'register' : 'login')
const loading = ref(false)
const error = ref('')
const remember = ref(true)
const agreed = ref(false)

const loginForm = reactive({
  account: '',
  password: '',
})

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student',
})

const features = [
  {
    icon: ChartLineIcon,
    iconClass: 'bg-blue-500/10 text-blue-600 ring-blue-500/20',
    title: '学术成长追踪',
    desc: '量化学习过程，观察知识掌握曲线与练习反馈。',
  },
  {
    icon: RobotIcon,
    iconClass: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20',
    title: '智能体协作',
    desc: '组合画像、路径、资源和评估智能体。',
  },
  {
    icon: MapRoutePlanningIcon,
    iconClass: 'bg-violet-500/10 text-violet-600 ring-violet-500/20',
    title: '个性化学习路径',
    desc: '根据课程目标和薄弱点推荐下一阶段任务。',
  },
]

watch(
  () => route.name,
  (name) => {
    activeTab.value = name === 'register' ? 'register' : 'login'
    error.value = ''
  },
)

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function setError(message: string) {
  error.value = message
  MessagePlugin.error(message)
}

function finishLogin() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  router.replace(redirect)
}

function handleLogin() {
  error.value = ''

  if (!loginForm.account.trim() || !loginForm.password) {
    setError('请输入账号和密码')
    return
  }

  loading.value = true
  window.setTimeout(() => {
    try {
      auth.login(loginForm)
      finishLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败')
    } finally {
      loading.value = false
    }
  }, 300)
}

function handleRegister() {
  error.value = ''

  if (
    !registerForm.name.trim() ||
    !registerForm.email.trim() ||
    !registerForm.password ||
    !registerForm.confirmPassword
  ) {
    setError('请完整填写注册信息')
    return
  }

  if (!isValidEmail(registerForm.email)) {
    setError('请输入有效邮箱')
    return
  }

  if (registerForm.password.length < 6) {
    setError('密码至少需要 6 位')
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    setError('两次输入的密码不一致')
    return
  }

  if (!agreed.value) {
    setError('请先阅读并同意服务协议')
    return
  }

  loading.value = true
  window.setTimeout(() => {
    try {
      auth.register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      })
      finishLogin()
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败')
    } finally {
      loading.value = false
    }
  }, 300)
}

function showUnavailable() {
  MessagePlugin.info('暂无')
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-6 py-8 text-[#191c1e]">
    <section class="flex w-full max-w-6xl items-center gap-14">
      <aside class="flex min-w-0 flex-1 flex-col gap-10">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <img
              :src="logoUrl"
              alt="智学工坊"
              class="h-12 w-12 shrink-0 rounded-xl object-cover"
            />
            <h1 class="m-0 text-[32px] font-semibold text-blue-700">智学工坊</h1>
          </div>
          <p class="m-0 max-w-[440px] text-[15px] leading-7 text-gray-600">
            AI 驱动的沉浸式学术工作空间，专注力与效率的双重提升。
          </p>
        </div>

        <div class="flex flex-col gap-6">
          <div
            v-for="item in features"
            :key="item.title"
            class="flex max-w-[520px] items-start gap-4 rounded-lg border border-transparent p-3 transition-colors"
          >
            <div
              :class="[
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1',
                item.iconClass,
              ]"
            >
              <component :is="item.icon" size="22px" />
            </div>
            <div>
              <h3 class="m-0 mb-1 text-[20px] font-semibold text-gray-900">{{ item.title }}</h3>
              <p class="m-0 text-[15px] leading-6 text-gray-600">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </aside>

      <t-card class="ml-auto w-[480px] shrink-0" :bordered="true">
        <div class="mb-4 hidden items-center gap-2 text-blue-700 max-[820px]:flex">
          <img :src="logoUrl" alt="智学工坊" class="h-6 w-6 shrink-0 rounded-md object-cover" />
          <span class="font-semibold">智学工坊</span>
        </div>

        <t-tabs v-model="activeTab" theme="normal" size="medium" class="auth-tabs">
          <t-tab-panel value="login" label="登录">
            <t-form layout="vertical" label-align="top" class="!my-4">
              <t-form-item label="手机号 / 邮箱" class="!mb-3">
                <t-input v-model="loginForm.account" placeholder="请输入账号" clearable />
              </t-form-item>

              <t-form-item label="密码" class="!mb-3">
                <t-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  clearable
                />
              </t-form-item>

              <t-form-item class="!mb-3">
                <div class="flex w-full items-center">
                  <t-checkbox v-model="remember">保持登录状态</t-checkbox>
                  <t-link theme="primary" class="ml-auto">忘记密码？</t-link>
                </div>
              </t-form-item>


              <t-button theme="primary" block :loading="loading" @click="handleLogin">
                进入学习空间
                <template #suffix><ArrowRightIcon /></template>
              </t-button>
            </t-form>
          </t-tab-panel>

          <t-tab-panel value="register" label="注册">
            <t-form layout="vertical" label-align="top" class="!my-4">
              <t-form-item label="用户名" class="!mb-3">
                <t-input
                  v-model="registerForm.name"
                  placeholder="设置你的学习昵称"
                  clearable
                />
              </t-form-item>

              <t-form-item label="邮箱" class="!mb-3">
                <t-input
                  v-model="registerForm.email"
                  placeholder="用于接收通知和找回密码"
                  clearable
                />
              </t-form-item>

              <t-form-item label="密码" class="!mb-3">
                <t-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="不少于 6 位字符"
                  clearable
                />
              </t-form-item>

              <t-form-item label="确认密码" class="!mb-3">
                <t-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="再次输入密码"
                  clearable
                />
              </t-form-item>

              <t-form-item label="选择身份" class="!mb-3">
                <t-radio-group
                  v-model="registerForm.role"
                  variant="default-filled"
                  class="flex !w-full"
                >
                  <t-radio-button value="student" class="flex-1 justify-center">
                    <UserIcon />
                    学生
                  </t-radio-button>
                  <t-radio-button value="teacher" class="flex-1 justify-center">
                    <EducationIcon />
                    教师 / 导师
                  </t-radio-button>
                </t-radio-group>
              </t-form-item>

              <t-form-item class="!mb-3">
                <t-checkbox v-model="agreed" class="my-5">
                  我已阅读并同意
                  <t-link theme="primary" @click.stop.prevent="showUnavailable">服务协议</t-link>
                  和
                  <t-link theme="primary" @click.stop.prevent="showUnavailable">隐私政策</t-link>
                </t-checkbox>
              </t-form-item>

              <t-button theme="primary" block :loading="loading" @click="handleRegister">
                创建账号
                <template #suffix><CheckIcon /></template>
              </t-button>
            </t-form>
          </t-tab-panel>
        </t-tabs>
      </t-card>
    </section>
  </main>
</template>

<style scoped>
.auth-tabs :deep(.t-tabs__nav) {
  width: 100%;
}

.auth-tabs :deep(.t-tabs__nav-container),
.auth-tabs :deep(.t-tabs__nav-scroll),
.auth-tabs :deep(.t-tabs__nav-wrap) {
  width: 100%;
}

.auth-tabs :deep(.t-tabs__nav-item) {
  flex: 1;
  justify-content: center;
}

.auth-tabs :deep(.t-tabs__nav-item-wrapper) {
  justify-content: center;
  width: 100%;
}

.role-group {
  display: flex;
  width: 100%;
}

.role-group :deep(.t-radio-button) {
  flex: 1;
  justify-content: center;
}

@media (max-width: 820px) {
  main {
    padding: 24px 12px;
  }

  section {
    flex-direction: column;
    align-items: center;
  }

  aside {
    display: none;
  }

  .t-card {
    width: min(480px, 100%);
  }
}
</style>
