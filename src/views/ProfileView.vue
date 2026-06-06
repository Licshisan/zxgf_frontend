<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { MessagePlugin } from 'tdesign-vue-next'

import { profileControllerMe } from '@/api/generated'

type ProfileDimensionKey =
  | 'learningLevel'
  | 'goalClarity'
  | 'interestDirection'
  | 'communicationPreference'
  | 'engagement'
  | 'knowledgeWeakness'

interface ProfileDimensionValue {
  score: number
  label: string
  summary: string
  confidence: number
  evidence: string[]
  updatedAt?: string
}

type UserProfileData = Record<ProfileDimensionKey, ProfileDimensionValue | null>

const dimensionMeta: Record<
  ProfileDimensionKey,
  {
    title: string
    desc: string
    icon: string
    accent: string
  }
> = {
  learningLevel: {
    title: '学习水平',
    desc: '当前知识储备与理解深度',
    icon: 'material-symbols:school',
    accent: 'text-blue-600',
  },
  goalClarity: {
    title: '目标清晰度',
    desc: '学习目标是否明确、可执行',
    icon: 'material-symbols:flag',
    accent: 'text-emerald-600',
  },
  interestDirection: {
    title: '兴趣方向',
    desc: '偏好的主题、领域和任务类型',
    icon: 'material-symbols:explore',
    accent: 'text-cyan-600',
  },
  communicationPreference: {
    title: '沟通偏好',
    desc: '适合的解释方式与反馈节奏',
    icon: 'material-symbols:forum',
    accent: 'text-violet-600',
  },
  engagement: {
    title: '参与状态',
    desc: '学习投入、互动频率和持续性',
    icon: 'material-symbols:monitoring',
    accent: 'text-orange-600',
  },
  knowledgeWeakness: {
    title: '知识薄弱点',
    desc: '需要重点补强的概念和能力',
    icon: 'material-symbols:troubleshoot',
    accent: 'text-rose-600',
  },
}

const dimensionKeys = Object.keys(dimensionMeta) as ProfileDimensionKey[]
const profile = ref<UserProfileData>(createEmptyProfile())
const loading = ref(false)

const dimensions = computed(() =>
  dimensionKeys.map((key) => ({
    key,
    ...dimensionMeta[key],
    value: profile.value[key],
  })),
)

const validDimensions = computed(() =>
  dimensions.value.filter((dimension) => Boolean(dimension.value)),
)

const averageScore = computed(() => {
  if (!validDimensions.value.length) return 0
  const total = validDimensions.value.reduce((sum, dimension) => sum + dimension.value!.score, 0)
  return Math.round(total / validDimensions.value.length)
})

const strongestDimension = computed(() =>
  [...validDimensions.value].sort((a, b) => b.value!.score - a.value!.score)[0],
)

const weakestDimension = computed(() =>
  [...validDimensions.value].sort((a, b) => a.value!.score - b.value!.score)[0],
)

const updatedAtText = computed(() => {
  const latest = validDimensions.value
    .map((dimension) => dimension.value?.updatedAt)
    .filter(Boolean)
    .sort()
    .at(-1)

  return latest ? formatDate(latest) : '暂无更新'
})

onMounted(() => {
  void loadProfile()
})

async function loadProfile() {
  loading.value = true
  try {
    const response = await profileControllerMe()
    profile.value = normalizeProfile(response.data as unknown)
  } catch (error) {
    MessagePlugin.error(error instanceof Error ? error.message : '读取用户画像失败')
  } finally {
    loading.value = false
  }
}

function createEmptyProfile(): UserProfileData {
  return dimensionKeys.reduce((result, key) => {
    result[key] = null
    return result
  }, {} as UserProfileData)
}

function normalizeProfile(value: unknown): UserProfileData {
  const result = createEmptyProfile()
  if (!value || typeof value !== 'object') return result

  const raw = value as Record<string, unknown>
  for (const key of dimensionKeys) {
    const item = raw[key]
    if (isProfileDimensionValue(item)) {
      result[key] = item
    }
  }

  return result
}

function isProfileDimensionValue(value: unknown): value is ProfileDimensionValue {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<ProfileDimensionValue>

  return (
    typeof item.score === 'number' &&
    typeof item.label === 'string' &&
    typeof item.summary === 'string' &&
    typeof item.confidence === 'number' &&
    Array.isArray(item.evidence)
  )
}

function progressTheme(score: number) {
  if (score >= 75) return 'success'
  if (score >= 50) return 'primary'
  if (score >= 30) return 'warning'
  return 'danger'
}

function confidenceText(confidence: number) {
  return `${Math.round(confidence * 100)}%`
}

function formatDate(value?: string) {
  if (!value) return '暂无更新'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <main class="h-full min-h-0 overflow-y-auto bg-[#f7f9fc]">
    <div class="mx-auto flex max-w-[1280px] flex-col gap-4 p-4 md:p-6">
      <section class="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <t-space align="center" size="small">
              <Icon icon="material-symbols:account-circle" class="text-blue-600" width="26" />
              <h1 class="m-0 text-2xl font-semibold text-gray-900">多维学习画像</h1>
            </t-space>
            <p class="mb-0 mt-2 text-sm leading-6 text-gray-500">
              根据学习对话、资源使用和评测表现持续更新，用于辅助个性化资源生成与学习路径规划。
            </p>
          </div>

          <t-button theme="primary" variant="outline" :loading="loading" @click="loadProfile">
            <template #icon><Icon icon="material-symbols:refresh" /></template>
            刷新画像
          </t-button>
        </div>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div class="profile-stat">
            <span class="text-xs text-gray-500">综合画像分</span>
            <strong class="text-2xl text-gray-900">{{ averageScore }}</strong>
            <t-progress :percentage="averageScore" :theme="progressTheme(averageScore)" />
          </div>
          <div class="profile-stat">
            <span class="text-xs text-gray-500">优势维度</span>
            <strong class="truncate text-base text-gray-900">
              {{ strongestDimension?.title || '暂无数据' }}
            </strong>
            <p class="m-0 truncate text-sm text-gray-500">
              {{ strongestDimension?.value?.label || '完成更多对话后生成' }}
            </p>
          </div>
          <div class="profile-stat">
            <span class="text-xs text-gray-500">最近更新</span>
            <strong class="text-base text-gray-900">{{ updatedAtText }}</strong>
            <p class="m-0 truncate text-sm text-gray-500">
              待关注：{{ weakestDimension?.title || '暂无数据' }}
            </p>
          </div>
        </div>
      </section>

      <t-loading :loading="loading" text="正在读取画像...">
        <section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <t-card
            v-for="dimension in dimensions"
            :key="dimension.key"
            :bordered="true"
            class="profile-card"
          >
            <template #title>
              <div class="flex min-w-0 items-center gap-2">
                <Icon :icon="dimension.icon" :class="dimension.accent" width="22" />
                <span class="truncate">{{ dimension.title }}</span>
              </div>
            </template>

            <template #actions>
              <t-tag
                v-if="dimension.value"
                size="small"
                :theme="progressTheme(dimension.value.score)"
                variant="light"
              >
                {{ dimension.value.score }} 分
              </t-tag>
              <t-tag v-else size="small" variant="light">待生成</t-tag>
            </template>

            <div v-if="dimension.value" class="flex flex-col gap-4">
              <div>
                <div class="mb-2 flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="m-0 truncate text-lg font-semibold text-gray-900">
                      {{ dimension.value.label }}
                    </p>
                    <p class="mb-0 mt-1 text-xs text-gray-500">{{ dimension.desc }}</p>
                  </div>
                  <t-tag size="small" theme="primary" variant="light">
                    置信度 {{ confidenceText(dimension.value.confidence) }}
                  </t-tag>
                </div>
                <t-progress
                  :percentage="dimension.value.score"
                  :theme="progressTheme(dimension.value.score)"
                />
              </div>

              <p class="m-0 rounded-md bg-gray-50 p-3 text-sm leading-6 text-gray-700">
                {{ dimension.value.summary }}
              </p>

              <div>
                <div class="mb-2 flex items-center justify-between text-xs text-gray-500">
                  <span>依据证据</span>
                  <span>{{ formatDate(dimension.value.updatedAt) }}</span>
                </div>
                <div class="flex flex-col gap-2">
                  <div
                    v-for="evidence in dimension.value.evidence.slice(0, 3)"
                    :key="evidence"
                    class="flex items-start gap-2 rounded-md border border-gray-100 px-3 py-2 text-sm leading-6 text-gray-600"
                  >
                    <Icon icon="material-symbols:check-circle" class="mt-0.5 text-emerald-600" />
                    <span>{{ evidence }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="flex min-h-[210px] flex-col items-center justify-center text-center">
              <Icon icon="material-symbols:data-object" class="text-gray-300" width="42" />
              <p class="mb-0 mt-3 text-sm font-medium text-gray-700">暂无画像数据</p>
              <p class="mb-0 mt-1 text-xs leading-5 text-gray-500">
                完成更多学习对话或评测后，该维度会自动生成。
              </p>
            </div>
          </t-card>
        </section>
      </t-loading>
    </div>
  </main>
</template>

<style scoped>
.profile-stat {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  padding: 12px;
}

:deep(.profile-card .t-card__header) {
  border-bottom: 1px solid #e5e7eb;
}

:deep(.profile-card .t-card__body) {
  min-height: 280px;
}
</style>
