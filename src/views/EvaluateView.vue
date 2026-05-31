<script setup lang="ts">
import { Icon } from '@iconify/vue'
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const trendChartRef = ref<HTMLDivElement>()
const resourceChartRef = ref<HTMLDivElement>()
let trendChart: ECharts | null = null
let resourceChart: ECharts | null = null

const weakPoints = [
  {
    title: '反向传播算法推导',
    desc: '本周错题 12 道，主要集中在链式法则与梯度更新。',
    rate: 68,
    tag: '需要攻克',
    theme: 'danger',
  },
  {
    title: '卷积神经网络特征提取',
    desc: '特征图尺寸计算和卷积核参数理解仍不稳定。',
    rate: 45,
    tag: '欠缺巩固',
    theme: 'warning',
  },
  {
    title: '损失函数对比与选择',
    desc: '分类任务和回归任务的函数选择容易混淆。',
    rate: 30,
    tag: '复习中',
    theme: 'primary',
  },
]

const resources = [
  { name: '视频课程', value: '45%', color: '#0052d9' },
  { name: 'AI 文献研读', value: '30%', color: '#00a870' },
  { name: '在线测验', value: '15%', color: '#7b61ff' },
  { name: '拓展阅读', value: '10%', color: '#8b949e' },
]

function getTrendOption(): EChartsOption {
  return {
    color: ['#dbeafe', '#0052d9'],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      borderColor: '#e5e7eb',
      textStyle: { color: '#111827' },
    },
    legend: {
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#6b7280' },
    },
    grid: { top: 30, left: 8, right: 8, bottom: 44, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' },
    },
    yAxis: [
      {
        type: 'value',
        name: '完成量',
        min: 0,
        max: 50,
        interval: 10,
        axisLabel: { color: '#6b7280' },
        splitLine: { lineStyle: { color: '#eef2f7', type: 'dashed' } },
      },
      {
        type: 'value',
        name: '准确率',
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: { formatter: '{value}%', color: '#6b7280' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '完成量',
        type: 'bar',
        data: [15, 22, 18, 35, 28, 42, 30],
        barWidth: 22,
        itemStyle: { borderRadius: [6, 6, 0, 0] },
      },
      {
        name: '准确率',
        type: 'line',
        yAxisIndex: 1,
        data: [75, 78, 72, 85, 82, 88, 86],
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3 },
      },
    ],
  }
}

function getResourceOption(): EChartsOption {
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    series: [
      {
        name: '学习资源',
        type: 'pie',
        radius: ['56%', '80%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 3,
          borderRadius: 6,
        },
        data: [
          { value: 45, name: '视频课程', itemStyle: { color: '#0052d9' } },
          { value: 30, name: 'AI 文献研读', itemStyle: { color: '#00a870' } },
          { value: 15, name: '在线测验', itemStyle: { color: '#7b61ff' } },
          { value: 10, name: '拓展阅读', itemStyle: { color: '#8b949e' } },
        ],
      },
    ],
  }
}

function resizeCharts() {
  trendChart?.resize()
  resourceChart?.resize()
}

onMounted(async () => {
  await nextTick()
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption(getTrendOption())
  }
  if (resourceChartRef.value) {
    resourceChart = echarts.init(resourceChartRef.value)
    resourceChart.setOption(getResourceOption())
  }
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  trendChart?.dispose()
  resourceChart?.dispose()
})
</script>

<template>
  <main class="mx-auto flex max-w-[1440px] flex-col gap-4 p-4 md:p-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="m-0 text-3xl font-semibold text-gray-900">测评中心</h1>
        <p class="mb-0 mt-2 text-sm text-gray-500">
          全面分析你的知识掌握情况，定位薄弱环节并生成针对性练习建议。
        </p>
      </div>
      <t-space>
        <t-button variant="outline">
          <template #icon><Icon icon="material-symbols:history" /></template>
          历史报告
        </t-button>
        <t-button theme="primary">
          <template #icon><Icon icon="material-symbols:play-arrow" /></template>
          开始新测验
        </t-button>
      </t-space>
    </div>

    <section class="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <t-card :bordered="true" class="evaluate-card xl:col-span-4">
        <template #title>
          <div class="card-title">
            <Icon icon="material-symbols:donut-large" class="text-blue-600" width="24" />
            <span>综合掌握度</span>
          </div>
        </template>
        <template #actions>
          <t-tag theme="success" variant="light">优秀</t-tag>
        </template>
        <div class="flex min-h-[260px] flex-col items-center justify-center gap-5">
          <t-progress theme="circle" :percentage="85" size="160" />
          <div class="w-full rounded-md border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-1 text-rose-600">
                <Icon icon="material-symbols:trending-up" />
                较上周提升 5%
              </span>
              <span>击败 78% 同学</span>
            </div>
          </div>
        </div>
      </t-card>

      <t-card :bordered="true" class="evaluate-card xl:col-span-8">
        <template #title>
          <div class="card-title">
            <Icon icon="material-symbols:monitoring" class="text-blue-600" width="24" />
            <span>练习完成度与准确率趋势</span>
          </div>
        </template>
        <template #actions>
          <t-select value="7" size="small" class="w-28">
            <t-option value="7" label="近 7 天" />
            <t-option value="30" label="近 30 天" />
          </t-select>
        </template>
        <div ref="trendChartRef" class="h-[300px] w-full"></div>
      </t-card>

      <t-card :bordered="true" class="evaluate-card xl:col-span-6">
        <template #title>
          <div class="card-title">
            <Icon icon="material-symbols:pie-chart" class="text-emerald-600" width="24" />
            <span>学习资源分布</span>
          </div>
        </template>
        <div class="grid min-h-[250px] grid-cols-1 items-center gap-4 md:grid-cols-[240px_1fr]">
          <div ref="resourceChartRef" class="h-[220px] w-full"></div>
          <div class="flex flex-col gap-3">
            <div
              v-for="item in resources"
              :key="item.name"
              class="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 px-3 py-2"
            >
              <span class="flex items-center gap-2 text-sm text-gray-700">
                <i class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: item.color }"></i>
                {{ item.name }}
              </span>
              <strong class="text-sm text-gray-900">{{ item.value }}</strong>
            </div>
          </div>
        </div>
      </t-card>

      <t-card :bordered="true" class="evaluate-card xl:col-span-6">
        <template #title>
          <div class="card-title">
            <Icon icon="material-symbols:troubleshoot" class="text-orange-500" width="24" />
            <span>薄弱知识点图谱</span>
          </div>
        </template>
        <template #actions>
          <t-button variant="text" theme="primary">查看完整图谱</t-button>
        </template>
        <div class="flex flex-col gap-3">
          <div
            v-for="point in weakPoints"
            :key="point.title"
            class="rounded-md border border-gray-200 bg-white p-3"
          >
            <div class="mb-2 flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="m-0 text-sm font-semibold text-gray-900">{{ point.title }}</p>
                <p class="mb-0 mt-1 text-xs leading-5 text-gray-500">{{ point.desc }}</p>
              </div>
              <t-tag size="small" :theme="point.theme" variant="light">{{ point.tag }}</t-tag>
            </div>
            <t-progress :percentage="point.rate" :theme="point.theme" size="small" />
          </div>
        </div>
      </t-card>

      <div class="xl:col-span-12">
        <div
          class="overflow-hidden rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-cyan-50 p-5 shadow-sm"
        >
          <div class="flex flex-col gap-4 md:flex-row md:items-center">
            <t-avatar shape="round" size="56px" class="bg-gradient-to-br from-blue-600 to-cyan-500">
              <template #icon><Icon icon="material-symbols:smart-toy" width="28" /></template>
            </t-avatar>
            <div class="min-w-0 flex-1">
              <div class="mb-2 flex flex-wrap items-center gap-2">
                <h2 class="m-0 text-xl font-semibold text-gray-900">智学 AI 导师建议</h2>
                <t-tag theme="primary" variant="light">智能生成</t-tag>
              </div>
              <p class="m-0 text-sm leading-7 text-gray-600">
                根据近期测评数据，你在
                <strong class="text-blue-700">反向传播算法</strong>
                上的错误率偏高。建议优先补齐基础推导，再进入专项题库进行分层训练。
              </p>
            </div>
            <t-space>
              <t-button theme="primary">
                <template #icon><Icon icon="material-symbols:route" /></template>
                调整学习路径
              </t-button>
              <t-button variant="outline">
                <template #icon><Icon icon="material-symbols:menu-book" /></template>
                进入专项题库
              </t-button>
            </t-space>
          </div>
        </div>
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

:deep(.evaluate-card .t-card__header) {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 12px;
}

:deep(.evaluate-card .t-card__body) {
  height: calc(100% - 53px);
}
</style>
