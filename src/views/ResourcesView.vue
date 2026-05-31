<script setup lang="ts">
import { Icon } from '@iconify/vue'

const agents = [
  {
    name: 'Persona Agent',
    desc: '画像分析',
    status: '已完成',
    theme: 'success',
    icon: 'material-symbols:face',
  },
  {
    name: 'Planner Agent',
    desc: '路径规划',
    status: '已完成',
    theme: 'success',
    icon: 'material-symbols:account-tree',
  },
  {
    name: 'Doc Agent',
    desc: '文档生成',
    status: '生成中',
    theme: 'primary',
    icon: 'material-symbols:description',
  },
  {
    name: 'Mindmap Agent',
    desc: '导图整理',
    status: '等待中',
    theme: 'default',
    icon: 'material-symbols:hub',
  },
  {
    name: 'Quiz Agent',
    desc: '题库生成',
    status: '等待中',
    theme: 'default',
    icon: 'material-symbols:quiz',
  },
]

const resourceCards = [
  {
    title: '课程讲解文档',
    desc: '解析 A* 与 Minimax 算法的核心概念、伪代码实现和典型应用场景。',
    status: '正在生成',
    statusTheme: 'primary',
    icon: 'material-symbols:description',
    progress: 75,
    tags: ['中等难度', '预计 20 分钟'],
    reason: '基于先修测评结果，优先强化启发式函数构建和搜索剪枝思路。',
    action: '预览草稿',
  },
  {
    title: '知识点思维导图',
    desc: '从 DFS、BFS、贪心搜索到 A*，串联搜索算法族的演进关系。',
    status: '已完成',
    statusTheme: 'success',
    icon: 'material-symbols:account-tree',
    progress: 100,
    tags: ['结构化视图', '快速概览'],
    reason: '适合先建立全局框架，再进入重点算法的局部推导。',
    action: '查看大图',
  },
  {
    title: '分层练习题',
    desc: '包含基础概念题、情景计算题和开放式算法设计题。',
    status: '已完成',
    statusTheme: 'success',
    icon: 'material-symbols:quiz',
    progress: 100,
    tags: ['动态自适应', '预计 30 分钟'],
    reason: '当前阶段需要通过高频实战巩固短期记忆并转化为长期理解。',
    action: '开始练习',
  },
  {
    title: '拓展阅读材料',
    desc: '补充经典论文、前沿讨论和工业界案例，帮助建立应用视角。',
    status: '等待中',
    statusTheme: 'default',
    icon: 'material-symbols:menu-book',
    progress: 0,
    tags: ['进阶挑战'],
    reason: '等待 Planner Agent 完成优先级分配后生成。',
    action: '等待生成',
  },
  {
    title: '代码实践案例',
    desc: '生成 Python Notebook，通过迷宫寻路示例完成 A* 算法实践。',
    status: '等待中',
    statusTheme: 'default',
    icon: 'material-symbols:code',
    progress: 0,
    tags: ['动手实践'],
    reason: '等待 Doc Agent 输出规范后同步生成代码模板。',
    action: '等待生成',
  },
]
</script>

<template>
  <main class="mx-auto flex max-w-[1440px] flex-col gap-5 p-4 md:p-6">
    <t-card :bordered="true" class="resource-card">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 class="m-0 flex items-center gap-2 text-3xl font-semibold text-gray-900">
            多智能体资源生成
            <Icon icon="material-symbols:auto-awesome" class="text-blue-600" width="30" />
          </h1>
          <p class="mb-0 mt-3 max-w-3xl text-sm leading-7 text-gray-500">
            配置并监控专属 AI 智能体集群，针对选定知识点自动构建文档、导图、练习题和实践案例。
          </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <t-select value="search" class="min-w-64">
            <t-option value="search" label="搜索算法（A* / Minimax）" />
            <t-option value="ml" label="机器学习基础" />
            <t-option value="nn" label="神经网络原理" />
            <t-option value="nlp" label="自然语言处理入门" />
          </t-select>
          <t-button theme="primary">
            <template #icon><Icon icon="material-symbols:play-arrow" /></template>
            重新生成
          </t-button>
        </div>
      </div>
    </t-card>

    <section class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h2 class="m-0 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Icon icon="material-symbols:schema" class="text-blue-600" width="22" />
          Agent 协作流程
        </h2>
        <t-tag theme="primary" variant="light">3 个智能体运行中</t-tag>
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-5">
        <t-card
          v-for="(agent, index) in agents"
          :key="agent.name"
          :bordered="true"
          class="agent-card relative overflow-visible"
          :class="{ 'opacity-70 grayscale': agent.theme === 'default' }"
        >
          <div
            v-if="index < agents.length - 1"
            class="pointer-events-none absolute -right-3 top-1/2 hidden h-px w-6 bg-gray-300 md:block"
          ></div>
          <div class="flex items-center gap-3">
            <t-avatar shape="round" :theme="agent.theme === 'default' ? undefined : agent.theme">
              <template #icon>
                <Icon
                  :icon="agent.icon"
                  :class="{ 'animate-spin': agent.status === '生成中' }"
                  width="22"
                />
              </template>
            </t-avatar>
            <div class="min-w-0">
              <p class="m-0 truncate text-sm font-semibold text-gray-900">{{ agent.name }}</p>
              <p class="m-0 text-xs text-gray-500">{{ agent.desc }}</p>
            </div>
          </div>
          <t-tag class="mt-4" size="small" :theme="agent.theme" variant="light">
            {{ agent.status }}
          </t-tag>
        </t-card>
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="m-0 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Icon icon="material-symbols:dataset" class="text-blue-600" width="22" />
          生成资源矩阵
        </h2>
        <t-progress class="w-full sm:w-56" :percentage="40" label="2 / 5 模块已就绪" />
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <t-card
          v-for="item in resourceCards"
          :key="item.title"
          :bordered="true"
          class="resource-card overflow-hidden"
          :class="{ 'opacity-75': item.statusTheme === 'default' }"
        >
          <template #title>
            <div class="card-title">
              <Icon :icon="item.icon" class="text-blue-600" width="24" />
              <span>{{ item.title }}</span>
            </div>
          </template>
          <template #actions>
            <t-tag size="small" :theme="item.statusTheme" variant="light">
              {{ item.status }}
            </t-tag>
          </template>

          <div class="flex h-full flex-col gap-4">
            <t-progress
              v-if="item.progress"
              :percentage="item.progress"
              :theme="item.statusTheme"
              size="small"
            />
            <div v-else class="h-1 rounded-full bg-gray-100"></div>

            <p class="m-0 min-h-12 text-sm leading-6 text-gray-600">{{ item.desc }}</p>

            <div class="flex flex-wrap gap-2">
              <t-tag v-for="tag in item.tags" :key="tag" variant="outline" size="small">
                {{ tag }}
              </t-tag>
            </div>

            <div class="mt-auto rounded-md border border-gray-100 bg-gray-50 p-3">
              <p class="m-0 text-xs font-semibold text-gray-500">适合原因</p>
              <p class="mb-0 mt-2 text-sm leading-6 text-gray-700">{{ item.reason }}</p>
            </div>

            <t-button
              block
              :theme="item.statusTheme === 'default' ? 'default' : 'primary'"
              :variant="item.statusTheme === 'default' ? 'outline' : 'base'"
              :disabled="item.statusTheme === 'default'"
            >
              {{ item.action }}
            </t-button>
          </div>
        </t-card>
      </div>
    </section>
  </main>
</template>

<style scoped>
.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

:deep(.resource-card .t-card__header) {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 12px;
}

:deep(.resource-card .t-card__body) {
  height: calc(100% - 53px);
}
</style>
