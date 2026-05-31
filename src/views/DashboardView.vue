<script setup lang="ts">
import { Icon } from '@iconify/vue'

const tasks = [
  { title: '阅读神经网络基础章节', type: '理论', time: '45 分钟', done: true },
  { title: '完成反向传播推导练习', type: 'AI 推荐', time: '30 分钟', done: false },
  { title: '观看感知机模型讲解视频', type: '视频', time: '20 分钟', done: false },
]

const weakPoints = [
  { title: '梯度消失问题', progress: 35, theme: 'danger', icon: 'material-symbols:trending-down' },
  { title: '激活函数选择', progress: 55, theme: 'warning', icon: 'material-symbols:functions' },
  {
    title: '反向传播链式法则',
    progress: 48,
    theme: 'primary',
    icon: 'material-symbols:device-hub',
  },
]

const agents = [
  {
    name: '画像分析师',
    status: '运行中',
    icon: 'material-symbols:psychology',
    desc: '发现推导环节耗时偏长，建议加入可视化材料。',
  },
  {
    name: '资源生成器',
    status: '生成中',
    icon: 'material-symbols:magic-button',
    desc: '正在生成反向传播互动图解与专项练习。',
  },
  {
    name: '路径规划师',
    status: '待命',
    icon: 'material-symbols:route',
    desc: '等待任务完成情况，自动调整明日学习队列。',
  },
]

const resources = [
  {
    title: 'CS229 神经网络基础讲义',
    desc: '包含详细数学推导，适合补充理论知识',
    type: 'PDF',
    icon: 'material-symbols:picture-as-pdf',
  },
  {
    title: '3Blue1Brown 深度学习系列',
    desc: '用可视化方式解释梯度下降与反向传播',
    type: '视频',
    icon: 'material-symbols:play-circle',
  },
  {
    title: 'NumPy 实现 MLP 实验',
    desc: '从零实现前向传播、损失函数与参数更新',
    type: '实验',
    icon: 'material-symbols:science',
  },
]
</script>

<template>
  <main
    class="mx-auto grid max-w-[1440px] grid-cols-1 items-stretch gap-4 p-4 md:p-6 lg:grid-cols-[minmax(0,1fr)_360px]"
  >
    <section class="flex min-w-0 flex-col gap-4">
      <t-card
        :bordered="true"
        class="overflow-hidden bg-gradient-to-l from-cyan-50 via-blue-50 to-white bg-no-repeat"
      >
        <div
          class="flex flex-col gap-6 py-4 md:flex-row md:items-center md:justify-between md:py-6"
        >
          <div>
            <h1 class="m-0 flex items-center gap-2 text-3xl font-semibold text-gray-900">
              早上好，同学
              <Icon icon="material-symbols:waving-hand" class="text-cyan-600" width="30" />
            </h1>
            <p class="mb-0 mt-4 max-w-2xl text-sm leading-7 text-gray-600">
              今天你的主要目标是
              <strong class="text-blue-700">掌握神经网络基础</strong>
              。你的多智能体团队已准备就绪，为你生成了定制化的学习资源。
            </p>
          </div>
          <div class="flex min-w-[160px] flex-col items-center gap-2">
            <t-progress theme="circle" :percentage="68" />
          </div>
        </div>
      </t-card>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <t-card :bordered="true" class="dashboard-card">
          <template #title>
            <div class="card-title">
              <Icon icon="material-symbols:task-alt" class="text-blue-600" width="28" />
              <span>今日任务</span>
            </div>
          </template>
          <template #actions>
            <t-button variant="text" theme="primary">查看全部</t-button>
          </template>
          <t-list :split="false">
            <t-list-item v-for="task in tasks" :key="task.title">
              <div class="flex w-full items-start gap-3 rounded-md p-2 hover:bg-gray-50">
                <t-checkbox :model-value="task.done" />
                <div class="min-w-0 flex-1">
                  <p class="m-0 truncate text-sm font-medium text-gray-900">{{ task.title }}</p>
                  <t-space class="mt-2" size="small">
                    <t-tag size="small" :theme="task.done ? 'success' : 'primary'" variant="light">
                      {{ task.type }}
                    </t-tag>
                    <span class="flex items-center gap-1 text-xs text-gray-500">
                      <Icon icon="material-symbols:schedule" width="14" />
                      {{ task.time }}
                    </span>
                  </t-space>
                </div>
              </div>
            </t-list-item>
          </t-list>
        </t-card>

        <t-card :bordered="true" class="dashboard-card">
          <template #title>
            <div class="card-title">
              <Icon icon="material-symbols:troubleshoot" class="text-cyan-600" width="28" />
              <span>薄弱知识点突破</span>
            </div>
          </template>
          <div class="flex flex-col gap-4">
            <div v-for="point in weakPoints" :key="point.title" class="rounded-md bg-gray-50 p-3">
              <div class="mb-2 flex items-center justify-between">
                <span class="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Icon :icon="point.icon" class="text-gray-500" width="16" />
                  {{ point.title }}
                </span>
                <t-tag size="small" :theme="point.theme" variant="light"
                  >{{ point.progress }}%</t-tag
                >
              </div>
              <t-progress :percentage="point.progress" :theme="point.theme" />
            </div>
            <t-button theme="primary" variant="outline" block>
              <template #icon><Icon icon="material-symbols:smart-toy" /></template>
              生成专项强化练习
            </t-button>
          </div>
        </t-card>
      </div>

      <t-card :bordered="true" class="dashboard-card">
        <template #title>
          <div class="card-title">
            <Icon icon="material-symbols:hub" class="text-purple-600" width="28" />
            <span>协同工作台</span>
          </div>
        </template>
        <template #actions>
          <t-tag theme="success" variant="light">3 个智能体在线</t-tag>
        </template>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div
            v-for="agent in agents"
            :key="agent.name"
            class="rounded-md border border-gray-200 p-4"
          >
            <t-space align="center">
              <t-avatar theme="primary">
                <template #icon><Icon :icon="agent.icon" /></template>
              </t-avatar>
              <div>
                <p class="m-0 text-sm font-semibold text-gray-900">{{ agent.name }}</p>
                <p class="m-0 text-xs text-emerald-600">{{ agent.status }}</p>
              </div>
            </t-space>
            <p class="mb-0 mt-4 rounded-md bg-gray-50 p-3 text-sm leading-6 text-gray-600">
              {{ agent.desc }}
            </p>
          </div>
        </div>
      </t-card>

      <t-card :bordered="true" class="dashboard-card">
        <template #title>
          <div class="card-title">
            <Icon icon="material-symbols:library-books" class="text-blue-600" width="28" />
            <span>推荐学习资源</span>
          </div>
        </template>
        <t-list>
          <t-list-item v-for="resource in resources" :key="resource.title">
            <div class="flex w-full items-center gap-3">
              <t-avatar shape="round" theme="primary">
                <template #icon><Icon :icon="resource.icon" /></template>
              </t-avatar>
              <div class="min-w-0 flex-1">
                <p class="m-0 truncate text-sm font-medium text-gray-900">{{ resource.title }}</p>
                <p class="m-0 truncate text-xs text-gray-500">{{ resource.desc }}</p>
              </div>
              <t-button variant="outline" size="small">学习</t-button>
            </div>
          </t-list-item>
        </t-list>
      </t-card>
    </section>

    <aside class="min-w-0">
      <t-card :bordered="true" class="dashboard-card h-full">
        <template #title>
          <div class="card-title">
            <Icon icon="material-symbols:account-circle" class="text-blue-600" width="28" />
            <span>学习画像摘要</span>
          </div>
        </template>
        <div class="flex h-full flex-col gap-4">
          <div class="summary-card">
            <t-space align="center" size="small">
              <Icon icon="material-symbols:database" class="summary-icon" width="17" />
              <span class="text-sm font-semibold text-gray-900">当前知识储备</span>
            </t-space>
            <div class="mt-3 flex flex-wrap gap-2">
              <t-tag>Python 熟练</t-tag>
              <t-tag>线性代数良好</t-tag>
              <t-tag>微积分基础</t-tag>
              <t-tag theme="primary" variant="light">机器学习入门</t-tag>
            </div>
          </div>

          <div class="summary-card">
            <t-space align="center" size="small">
              <Icon icon="material-symbols:flag" class="summary-icon" width="17" />
              <span class="text-sm font-semibold text-gray-900">本周核心目标</span>
            </t-space>
            <p class="mb-0 mt-3 text-sm leading-6 text-gray-600">
              掌握多层感知机的前向传播与反向传播机制，并能使用 NumPy 实现简单模型。
            </p>
          </div>

          <div class="summary-card">
            <t-space align="center" size="small">
              <Icon icon="material-symbols:tune" class="summary-icon" width="17" />
              <span class="text-sm font-semibold text-gray-900">学习偏好</span>
            </t-space>
            <t-descriptions class="mt-3" layout="vertical" :column="1" size="small">
              <t-descriptions-item label="输入偏好">可视化图解优先</t-descriptions-item>
              <t-descriptions-item label="专注时长">25 分钟学习 / 5 分钟休息</t-descriptions-item>
              <t-descriptions-item label="反馈机制">即时纠错型</t-descriptions-item>
            </t-descriptions>
          </div>

          <div class="summary-card flex-1">
            <t-space align="center" size="small">
              <Icon icon="material-symbols:history" class="summary-icon" width="17" />
              <span class="text-sm font-semibold text-gray-900">最近 AI 干预</span>
            </t-space>
            <div class="mt-4 border-l-2 border-gray-200 pl-4">
              <div class="relative pb-4">
                <span
                  class="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-white"
                ></span>
                <p class="m-0 text-xs text-gray-500">10:30</p>
                <p class="mb-0 mt-1 text-sm leading-6 text-gray-700">
                  降低推导难度，增加几何解释图例。
                </p>
              </div>
              <div class="relative">
                <span
                  class="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-gray-400 ring-4 ring-white"
                ></span>
                <p class="m-0 text-xs text-gray-500">昨天</p>
                <p class="mb-0 mt-1 text-sm leading-6 text-gray-700">
                  检测到连续答错，插入基础复习卡片。
                </p>
              </div>
            </div>
          </div>
        </div>
      </t-card>
    </aside>
  </main>
</template>

<style scoped>
.card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.summary-card {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
  padding: 12px;
}

.summary-icon {
  color: #6b7280;
}

:deep(.dashboard-card .t-card__header) {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 12px;
}

:deep(.dashboard-card .t-card__body) {
  height: calc(100% - 49px);
}
</style>
