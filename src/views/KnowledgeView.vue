<script setup lang="ts">
import { Icon } from '@iconify/vue'

const stats = [
  {
    label: '总文档数',
    value: '1,284',
    desc: '+12 本周',
    icon: 'material-symbols:description',
    theme: 'primary',
  },
  {
    label: '知识点覆盖率',
    value: '87%',
    desc: '核心章节已覆盖',
    icon: 'material-symbols:donut-large',
    theme: 'success',
  },
  {
    label: '最后同步时间',
    value: '10 分钟前',
    desc: '自动解析运行中',
    icon: 'material-symbols:update',
    theme: 'warning',
  },
]

const documents = [
  {
    name: '深度学习导论_第三版_Ch1-3.pdf',
    detail: '包含 34 个核心知识点',
    status: '已解析',
    statusTheme: 'success',
    updatedAt: '2026-05-31 14:30',
    coverage: 100,
    icon: 'material-symbols:picture-as-pdf',
  },
  {
    name: 'CNN 架构演进与优化策略.docx',
    detail: '识别到复杂表格结构',
    status: 'AI 提取中',
    statusTheme: 'primary',
    updatedAt: '2026-05-31 09:15',
    coverage: 45,
    icon: 'material-symbols:description',
  },
  {
    name: '神经网络数学基础_手写笔记扫描.pdf',
    detail: '图像质量过低，OCR 失败',
    status: '解析失败',
    statusTheme: 'danger',
    updatedAt: '2026-05-30 16:40',
    coverage: 0,
    icon: 'material-symbols:article',
  },
  {
    name: 'Transformer 模型 PyTorch 实现片段',
    detail: '代码片段，关联知识点 Attention 机制',
    status: '已解析',
    statusTheme: 'success',
    updatedAt: '2026-05-29 11:20',
    coverage: 100,
    icon: 'material-symbols:code',
  },
]
</script>

<template>
  <main class="mx-auto flex max-w-[1440px] flex-col gap-4 p-4 md:p-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="m-0 text-3xl font-semibold text-gray-900">知识库管理</h1>
        <p class="mb-0 mt-2 text-sm text-gray-500">管理学术文档与 AI 解析状态</p>
      </div>
      <t-space>
        <t-button variant="outline">
          <template #icon><Icon icon="material-symbols:sync" /></template>
          强制同步
        </t-button>
        <t-button theme="primary">
          <template #icon><Icon icon="material-symbols:upload-file" /></template>
          上传文档
        </t-button>
      </t-space>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <t-card v-for="item in stats" :key="item.label" :bordered="true">
        <div class="flex items-center gap-4">
          <t-avatar shape="round" :theme="item.theme" size="56px">
            <template #icon><Icon :icon="item.icon" width="26" /></template>
          </t-avatar>
          <div class="min-w-0 flex-1">
            <p class="m-0 text-sm text-gray-500">{{ item.label }}</p>
            <div class="mt-1 flex items-baseline gap-2">
              <strong class="text-2xl text-gray-900">{{ item.value }}</strong>
              <t-tag size="small" :theme="item.theme" variant="light">{{ item.desc }}</t-tag>
            </div>
          </div>
        </div>
      </t-card>
    </div>

    <t-card :bordered="true" class="min-h-0 flex-1">
      <template #title>
        <t-tabs default-value="all" theme="normal">
          <t-tab-panel value="all" label="全部文档" />
          <t-tab-panel value="pending" label="待解析 (3)" />
          <t-tab-panel value="failed" label="解析失败 (1)" />
        </t-tabs>
      </template>
      <template #actions>
        <t-space>
          <t-input placeholder="搜索知识点或文档" clearable>
            <template #prefixIcon><Icon icon="material-symbols:search" /></template>
          </t-input>
          <t-button variant="text" shape="square">
            <template #icon><Icon icon="material-symbols:filter-list" /></template>
          </t-button>
          <t-button variant="text" shape="square">
            <template #icon><Icon icon="material-symbols:view-column" /></template>
          </t-button>
        </t-space>
      </template>

      <t-table
        row-key="name"
        :data="documents"
        :columns="[
          { colKey: 'row-select', type: 'multiple', width: 48 },
          { colKey: 'name', title: '文档名称', minWidth: 320 },
          { colKey: 'status', title: '解析状态', width: 140 },
          { colKey: 'updatedAt', title: '更新时间', width: 180 },
          { colKey: 'coverage', title: '知识覆盖', width: 160 },
          { colKey: 'operation', title: '操作', width: 90, align: 'right' },
        ]"
        :pagination="{ current: 1, pageSize: 10, total: 1284, showJumper: false }"
        hover
      >
        <template #name="{ row }">
          <div class="flex items-center gap-3">
            <Icon :icon="row.icon" class="text-blue-600" width="24" />
            <div>
              <p class="m-0 font-medium text-gray-900">{{ row.name }}</p>
              <p class="m-0 text-xs text-gray-500">{{ row.detail }}</p>
            </div>
          </div>
        </template>
        <template #status="{ row }">
          <t-tag :theme="row.statusTheme" variant="light">
            <template #icon>
              <Icon
                :icon="row.statusTheme === 'success' ? 'material-symbols:check-circle' : row.statusTheme === 'danger' ? 'material-symbols:error' : 'material-symbols:sync'"
                :class="{ 'animate-spin': row.statusTheme === 'primary' }"
              />
            </template>
            {{ row.status }}
          </t-tag>
        </template>
        <template #coverage="{ row }">
          <div v-if="row.coverage" class="flex items-center gap-2">
            <t-progress :percentage="row.coverage" theme="primary" size="small" />
          </div>
          <span v-else class="text-gray-400">-</span>
        </template>
        <template #operation>
          <t-button variant="text" shape="square">
            <template #icon><Icon icon="material-symbols:more-vert" /></template>
          </t-button>
        </template>
      </t-table>
    </t-card>
  </main>
</template>
