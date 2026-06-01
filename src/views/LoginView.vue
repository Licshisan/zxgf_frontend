<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import type { FormInstanceFunctions, FormRules } from 'tdesign-vue-next'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChartLineIcon,
  CheckIcon,
  EducationIcon,
  MapRoutePlanningIcon,
  RobotIcon,
  UserIcon,
} from 'tdesign-icons-vue-next'
import logoUrl from '@/assets/logo.webp'
import {
  authControllerLogin,
  authControllerRegister,
  authControllerResetPassword,
  authControllerSendRegisterCode,
  authControllerSendResetCode,
} from '@/api/generated'
import { RegisterDtoRole } from '@/api/generated/model'
import { useAuthStore, type AuthUser } from '@/stores/auth'

type AuthMode = 'login' | 'register' | 'forgot'
type AuthResponseBody = {
  token?: string
  accessToken?: string
  data?: AuthResponseBody
  user?: Partial<AuthUser> & { displayName?: string }
}

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const mode = ref<AuthMode>(route.name === 'register' ? 'register' : 'login')
const loading = ref(false)
const sendingRegisterCode = ref(false)
const sendingResetCode = ref(false)
const registerCodeCountdown = ref(0)
const resetCodeCountdown = ref(0)
const loginFormRef = ref<FormInstanceFunctions>()
const registerFormRef = ref<FormInstanceFunctions>()
const resetFormRef = ref<FormInstanceFunctions>()

const loginForm = reactive({ account: '', password: '', remember: false })
const registerForm = reactive({
  username: '',
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
  role: RegisterDtoRole.STUDENT,
  agreed: false,
})
const resetForm = reactive({ email: '', code: '', password: '', confirmPassword: '' })

const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
const loginRules: FormRules = {
  account: [{ required: true, message: '请输入用户名或邮箱' }],
  password: [{ required: true, message: '请输入密码' }],
}
const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名' },
    { pattern: /^[A-Za-z0-9_-]{3,64}$/, message: '用户名需为 3-64 位字母、数字、下划线或短横线' },
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    { email: true, message: '请输入有效邮箱' },
  ],
  code: [{ required: true, message: '请输入邮箱验证码' }],
  password: [
    { required: true, message: '请输入密码' },
    { pattern: passwordPattern, message: '密码至少 8 位，且包含字母和数字' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码' },
    { validator: (value) => value === registerForm.password, message: '两次输入的密码不一致' },
  ],
  agreed: [{ validator: (value) => value === true, message: '请先阅读并同意服务协议' }],
}
const resetRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { email: true, message: '请输入有效邮箱' },
  ],
  code: [{ required: true, message: '请输入邮箱验证码' }],
  password: [
    { required: true, message: '请输入新密码' },
    { pattern: passwordPattern, message: '新密码至少 8 位，且包含字母和数字' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码' },
    { validator: (value) => value === resetForm.password, message: '两次输入的密码不一致' },
  ],
}

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
    desc: '组合画像、路径、资源和评估智能体，辅助日常学习决策。',
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
    mode.value = name === 'register' ? 'register' : 'login'
  },
)

function valid(result: unknown) {
  return result === true
}

function startCountdown(target: typeof registerCodeCountdown | typeof resetCodeCountdown) {
  target.value = 60
  const timer = window.setInterval(() => {
    target.value -= 1
    if (target.value <= 0) window.clearInterval(timer)
  }, 1000)
}

function backToLogin(account = '') {
  mode.value = 'login'
  loginForm.account = account
  loginForm.password = ''
}

function parseSession(data: unknown, account: string) {
  const body = (data || {}) as AuthResponseBody
  const payload = body.data || body
  const user = payload.user || {}
  const email = user.email || (account.includes('@') ? account : '')
  const name = user.name || user.displayName || user.username || email.split('@')[0] || account
  return { token: payload.token || payload.accessToken || '', user: { ...user, email, name } }
}

async function handleLogin() {
  if (!valid(await loginFormRef.value?.validate())) return

  loading.value = true
  try {
    const response = await authControllerLogin({
      account: loginForm.account,
      password: loginForm.password,
    })
    const session = parseSession(response.data, loginForm.account)
    auth.setSession(session.user, session.token, loginForm.remember)
    router.push(
      (typeof route.query.redirect === 'string' && route.query.redirect) || { name: 'dashboard' },
    )
  } finally {
    loading.value = false
  }
}

async function sendRegisterCode() {
  if (!valid(await registerFormRef.value?.validateOnly({ fields: ['email'] }))) return

  sendingRegisterCode.value = true
  try {
    await authControllerSendRegisterCode({ email: registerForm.email.trim() })
    MessagePlugin.success('验证码已发送，请查收邮箱')
    startCountdown(registerCodeCountdown)
  } finally {
    sendingRegisterCode.value = false
  }
}

async function handleRegister() {
  if (!valid(await registerFormRef.value?.validate())) return

  loading.value = true
  try {
    await authControllerRegister({
      username: registerForm.username.trim(),
      email: registerForm.email.trim(),
      code: registerForm.code.trim(),
      password: registerForm.password,
      role: registerForm.role,
      displayName: registerForm.username.trim(),
    })
    MessagePlugin.success('注册成功，请登录')
    backToLogin(registerForm.email)
  } finally {
    loading.value = false
  }
}

async function sendResetCode() {
  if (!valid(await resetFormRef.value?.validateOnly({ fields: ['email'] }))) return

  sendingResetCode.value = true
  try {
    await authControllerSendResetCode({ email: resetForm.email.trim() })
    MessagePlugin.success('验证码已发送，请查收邮箱')
    startCountdown(resetCodeCountdown)
  } finally {
    sendingResetCode.value = false
  }
}

async function handleResetPassword() {
  if (!valid(await resetFormRef.value?.validate())) return

  loading.value = true
  try {
    await authControllerResetPassword({
      email: resetForm.email.trim(),
      code: resetForm.code.trim(),
      newPassword: resetForm.password,
    })
    MessagePlugin.success('密码已重置，请使用新密码登录')
    backToLogin(resetForm.email)
  } finally {
    loading.value = false
  }
}

function showUnavailable() {
  MessagePlugin.info('暂未开放')
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-6 py-8 text-[#191c1e]">
    <section class="flex w-full max-w-6xl items-center gap-14">
      <aside class="flex min-w-0 flex-1 flex-col gap-10">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <img :src="logoUrl" alt="智学工坊" class="h-12 w-12 shrink-0 rounded-xl object-cover" />
            <h1 class="m-0 text-[32px] font-semibold text-blue-700">智学工坊</h1>
          </div>
          <p class="m-0 max-w-[440px] text-[15px] leading-7 text-gray-600">
            AI 驱动的沉浸式学术工作空间，专注能力与效率的双重提升。
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

        <template v-if="mode !== 'forgot'">
          <t-tabs v-model="mode" theme="normal" size="medium" class="auth-tabs">
            <t-tab-panel value="login" label="登录">
              <t-form
                ref="loginFormRef"
                :data="loginForm"
                :rules="loginRules"
                layout="vertical"
                label-align="top"
                class="!my-4"
              >
                <t-form-item label="账号" name="account" class="!mb-3">
                  <t-input v-model="loginForm.account" placeholder="请输入用户名或邮箱" clearable />
                </t-form-item>
                <t-form-item label="密码" name="password" class="!mb-3">
                  <t-input
                    v-model="loginForm.password"
                    type="password"
                    placeholder="请输入密码"
                    clearable
                  />
                </t-form-item>
                <t-form-item class="!mb-3">
                  <div class="flex w-full items-center">
                    <t-checkbox v-model="loginForm.remember">保持登录状态</t-checkbox>
                    <t-link theme="primary" class="ml-auto" @click="mode = 'forgot'"
                      >忘记密码？</t-link
                    >
                  </div>
                </t-form-item>
                <t-button theme="primary" block :loading="loading" @click="handleLogin">
                  登录
                  <template #suffix><ArrowRightIcon /></template>
                </t-button>
              </t-form>
            </t-tab-panel>

            <t-tab-panel value="register" label="注册">
              <t-form
                ref="registerFormRef"
                :data="registerForm"
                :rules="registerRules"
                layout="vertical"
                label-align="top"
                class="!my-4"
              >
                <t-form-item label="用户名" name="username" class="!mb-3">
                  <t-input
                    v-model="registerForm.username"
                    placeholder="请输入用户名，支持字母、数字、下划线或短横线"
                    clearable
                  />
                </t-form-item>
                <t-form-item label="邮箱" name="email" class="!mb-3">
                  <t-input
                    v-model="registerForm.email"
                    placeholder="请输入邮箱，用于登录和接收验证码"
                    clearable
                  />
                </t-form-item>
                <t-form-item label="邮箱验证码" name="code" class="!mb-3">
                  <t-input
                    v-model="registerForm.code"
                    placeholder="请输入 6 位邮箱验证码"
                    clearable
                  >
                    <template #suffix>
                      <t-button
                        theme="primary"
                        variant="text"
                        size="small"
                        :disabled="registerCodeCountdown > 0"
                        :loading="sendingRegisterCode"
                        @click.stop="sendRegisterCode"
                      >
                        {{ registerCodeCountdown > 0 ? `${registerCodeCountdown}s` : '获取验证码' }}
                      </t-button>
                    </template>
                  </t-input>
                </t-form-item>
                <t-form-item label="密码" name="password" class="!mb-3">
                  <t-input
                    v-model="registerForm.password"
                    type="password"
                    placeholder="请输入至少 8 位且包含字母和数字的密码"
                    clearable
                  />
                </t-form-item>
                <t-form-item label="确认密码" name="confirmPassword" class="!mb-3">
                  <t-input
                    v-model="registerForm.confirmPassword"
                    type="password"
                    placeholder="请再次输入密码"
                    clearable
                  />
                </t-form-item>
                <t-form-item label="身份" name="role" class="!mb-3">
                  <t-radio-group
                    v-model="registerForm.role"
                    variant="default-filled"
                    class="flex !w-full"
                  >
                    <t-radio-button :value="RegisterDtoRole.STUDENT" class="flex-1 justify-center">
                      <UserIcon />
                      学生
                    </t-radio-button>
                    <t-radio-button :value="RegisterDtoRole.TEACHER" class="flex-1 justify-center">
                      <EducationIcon />
                      教师 / 导师
                    </t-radio-button>
                  </t-radio-group>
                </t-form-item>
                <t-form-item name="agreed" class="!mb-3">
                  <t-checkbox v-model="registerForm.agreed" class="my-5">
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
        </template>

        <template v-else>
          <div class="mb-5 flex items-center gap-3">
            <t-button shape="square" variant="text" @click="backToLogin()">
              <ArrowLeftIcon />
            </t-button>
            <div>
              <h2 class="m-0 text-[22px] font-semibold text-gray-900">找回密码</h2>
              <p class="m-0 mt-1 text-[14px] text-gray-500">通过邮箱验证码设置新密码</p>
            </div>
          </div>

          <t-form
            ref="resetFormRef"
            :data="resetForm"
            :rules="resetRules"
            layout="vertical"
            label-align="top"
            class="!my-4"
          >
            <t-form-item label="邮箱" name="email" class="!mb-3">
              <t-input v-model="resetForm.email" placeholder="请输入注册邮箱" clearable />
            </t-form-item>
            <t-form-item label="邮箱验证码" name="code" class="!mb-3">
              <t-input v-model="resetForm.code" placeholder="请输入 6 位邮箱验证码" clearable>
                <template #suffix>
                  <t-button
                    theme="primary"
                    variant="text"
                    size="small"
                    :disabled="resetCodeCountdown > 0"
                    :loading="sendingResetCode"
                    @click.stop="sendResetCode"
                  >
                    {{ resetCodeCountdown > 0 ? `${resetCodeCountdown}s` : '获取验证码' }}
                  </t-button>
                </template>
              </t-input>
            </t-form-item>
            <t-form-item label="新密码" name="password" class="!mb-3">
              <t-input
                v-model="resetForm.password"
                type="password"
                placeholder="请输入至少 8 位且包含字母和数字的新密码"
                clearable
              />
            </t-form-item>
            <t-form-item label="确认新密码" name="confirmPassword" class="!mb-3">
              <t-input
                v-model="resetForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                clearable
              />
            </t-form-item>
            <t-button theme="primary" block :loading="loading" @click="handleResetPassword">
              重置密码
              <template #suffix><CheckIcon /></template>
            </t-button>
          </t-form>
        </template>
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
