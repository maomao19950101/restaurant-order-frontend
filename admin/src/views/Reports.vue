<template>
  <div class="reports-page">
    <div class="page-header">
      <h2>数据分析</h2>
      <div class="header-actions">
        <el-select v-model="period" @change="loadData" style="width: 120px">
          <el-option label="今日" value="today" />
          <el-option label="本周" value="week" />
          <el-option label="本月" value="month" />
          <el-option label="本季度" value="quarter" />
          <el-option label="本年" value="year" />
        </el-select>
      </div>
    </div>

    <!-- 概览卡片 -->
    <div class="overview-cards">
      <div class="overview-card">
        <div class="card-icon revenue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="card-info">
          <div class="card-value">¥{{ formatMoney(overview.totalRevenue) }}</div>
          <div class="card-label">总营收</div>
        </div>
        <div class="card-trend" :class="{ up: comparison.revenueGrowth > 0, down: comparison.revenueGrowth < 0 }">
          {{ comparison.revenueGrowth > 0 ? '+' : '' }}{{ comparison.revenueGrowth }}%
        </div>
      </div>
      <div class="overview-card">
        <div class="card-icon orders">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
          </svg>
        </div>
        <div class="card-info">
          <div class="card-value">{{ overview.totalOrders }}</div>
          <div class="card-label">总订单</div>
        </div>
        <div class="card-trend" :class="{ up: comparison.orderGrowth > 0, down: comparison.orderGrowth < 0 }">
          {{ comparison.orderGrowth > 0 ? '+' : '' }}{{ comparison.orderGrowth }}%
        </div>
      </div>
      <div class="overview-card">
        <div class="card-icon avg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <div class="card-info">
          <div class="card-value">¥{{ formatMoney(overview.avgOrderAmount) }}</div>
          <div class="card-label">客单价</div>
        </div>
      </div>
      <div class="overview-card">
        <div class="card-icon members">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="card-info">
          <div class="card-value">{{ memberStats.totalMembers || 0 }}</div>
          <div class="card-label">会员数</div>
        </div>
        <div class="card-sub">今日新增 {{ memberStats.todayNew || 0 }}</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 销售趋势 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>销售趋势</h3>
        </div>
        <div class="chart-body">
          <div ref="trendChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 订单状态分布 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>订单状态分布</h3>
        </div>
        <div class="chart-body">
          <div ref="statusChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 菜品销量排行 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>菜品销量TOP10</h3>
        </div>
        <div class="chart-body">
          <div ref="dishRankChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 时段热力图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>时段热力图</h3>
          <span class="chart-sub">高峰: {{ dayNames[heatmap.peakDay - 1] }} {{ heatmap.peakHour }}:00</span>
        </div>
        <div class="chart-body">
          <div ref="heatmapChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 菜品毛利分析 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>菜品毛利TOP10</h3>
        </div>
        <div class="chart-body">
          <div ref="profitChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 会员消费分析 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>会员消费分析</h3>
        </div>
        <div class="chart-body">
          <div ref="memberChart" class="chart-container"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  getReportOverview, getSalesTrend, getDishRank, getTimeAnalysis,
  getOrderStatus, getMemberStats, getDishProfit, getMemberConsumption,
  getRepeatCustomer, getHeatmap, getSalesComparison
} from '../api'

const period = ref('today')
const overview = ref({})
const comparison = ref({})
const memberStats = ref({})
const heatmap = ref({})
const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

// Chart refs
const trendChart = ref(null)
const statusChart = ref(null)
const dishRankChart = ref(null)
const heatmapChart = ref(null)
const profitChart = ref(null)
const memberChart = ref(null)

// Chart instances
let charts = []

const formatMoney = (val) => {
  if (!val) return '0.00'
  return parseFloat(val).toFixed(2)
}

// 加载数据
const loadData = async () => {
  try {
    const [overviewRes, comparisonRes, memberRes, heatmapRes] = await Promise.all([
      getReportOverview(period.value),
      getSalesComparison(period.value),
      getMemberStats(),
      getHeatmap(7)
    ])

    overview.value = overviewRes || {}
    comparison.value = comparisonRes || {}
    memberStats.value = memberRes || {}
    heatmap.value = heatmapRes || {}

    // 加载图表数据
    await Promise.all([
      loadTrendChart(),
      loadStatusChart(),
      loadDishRankChart(),
      loadHeatmapChart(),
      loadProfitChart(),
      loadMemberChart()
    ])
  } catch (error) {
    console.error('加载报表数据失败:', error)
  }
}

// 销售趋势图
const loadTrendChart = async () => {
  const data = await getSalesTrend(7)
  if (!data || !trendChart.value) return

  const chart = echarts.init(trendChart.value)
  charts.push(chart)

  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date)
    },
    yAxis: [
      { type: 'value', name: '营收(元)' },
      { type: 'value', name: '订单数', position: 'right' }
    ],
    series: [
      {
        name: '营收',
        type: 'line',
        smooth: true,
        data: data.map(d => d.revenue),
        itemStyle: { color: '#6366f1' },
        areaStyle: { color: 'rgba(99, 102, 241, 0.1)' }
      },
      {
        name: '订单数',
        type: 'bar',
        yAxisIndex: 1,
        data: data.map(d => d.orders),
        itemStyle: { color: '#f59e0b' }
      }
    ]
  })
}

// 订单状态分布
const loadStatusChart = async () => {
  const data = await getOrderStatus(period.value)
  if (!data || !statusChart.value) return

  const chart = echarts.init(statusChart.value)
  charts.push(chart)

  const statusNames = ['待接单', '已接单', '制作中', '已出餐', '已完成', '已取消']
  const statusColors = ['#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#6b7280']
  const values = [data.pending, data.accepted, data.cooking, data.served, data.completed, data.cancelled]

  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '0' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      data: statusNames.map((name, i) => ({
        name,
        value: values[i],
        itemStyle: { color: statusColors[i] }
      }))
    }]
  })
}

// 菜品销量排行
const loadDishRankChart = async () => {
  const data = await getDishRank(period.value, 10)
  if (!data || !dishRankChart.value) return

  const chart = echarts.init(dishRankChart.value)
  charts.push(chart)

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: data.map(d => d.dishName).reverse(),
      axisLabel: { width: 80, overflow: 'truncate' }
    },
    series: [{
      type: 'bar',
      data: data.map(d => d.quantity).reverse(),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#6366f1' },
          { offset: 1, color: '#a78bfa' }
        ])
      }
    }]
  })
}

// 时段热力图
const loadHeatmapChart = async () => {
  if (!heatmap.value.data || !heatmapChart.value) return

  const chart = echarts.init(heatmapChart.value)
  charts.push(chart)

  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const data = heatmap.value.data.map(d => [d.hour, d.day - 1, d.value])

  chart.setOption({
    tooltip: { formatter: (p) => `${days[p.value[1]]} ${hours[p.value[0]]}<br/>订单数: ${p.value[2]}` },
    grid: { left: '10%', right: '10%', bottom: '15%' },
    xAxis: { type: 'category', data: hours, splitArea: { show: true } },
    yAxis: { type: 'category', data: days, splitArea: { show: true } },
    visualMap: {
      min: 0,
      max: Math.max(...data.map(d => d[2]), 1),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: { color: ['#f7fafc', '#6366f1'] }
    },
    series: [{
      type: 'heatmap',
      data,
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  })
}

// 菜品毛利分析
const loadProfitChart = async () => {
  const data = await getDishProfit(period.value, 10)
  if (!data || !profitChart.value) return

  const chart = echarts.init(profitChart.value)
  charts.push(chart)

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['营收', '成本', '毛利'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.dishName),
      axisLabel: { rotate: 30 }
    },
    yAxis: { type: 'value', name: '金额(元)' },
    series: [
      { name: '营收', type: 'bar', data: data.map(d => d.revenue), itemStyle: { color: '#6366f1' } },
      { name: '成本', type: 'bar', data: data.map(d => d.cost), itemStyle: { color: '#f59e0b' } },
      { name: '毛利', type: 'bar', data: data.map(d => d.profit), itemStyle: { color: '#10b981' } }
    ]
  })
}

// 会员消费分析
const loadMemberChart = async () => {
  const data = await getMemberConsumption(period.value)
  if (!data || !memberChart.value) return

  const chart = echarts.init(memberChart.value)
  charts.push(chart)

  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: '0' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { name: '会员订单', value: data.memberOrderCount, itemStyle: { color: '#6366f1' } },
        { name: '非会员订单', value: data.nonMemberOrderCount, itemStyle: { color: '#e5e7eb' } }
      ]
    }]
  })
}

// 窗口大小变化时重绘图表
const handleResize = () => {
  charts.forEach(chart => chart.resize())
}

onMounted(() => {
  nextTick(() => {
    loadData()
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(chart => chart.dispose())
})
</script>

<style scoped>
.reports-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 概览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.overview-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon.revenue { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
.card-icon.orders { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.card-icon.avg { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.card-icon.members { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

.card-info {
  flex: 1;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--text);
}

.card-label {
  font-size: 13px;
  color: var(--text2);
  margin-top: 4px;
}

.card-trend {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.card-trend.up { color: #10b981; background: rgba(16, 185, 129, 0.1); }
.card-trend.down { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

.card-sub {
  font-size: 12px;
  color: var(--text3);
}

/* 图表网格 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.chart-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.chart-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.chart-sub {
  font-size: 12px;
  color: var(--text3);
}

.chart-body {
  padding: 16px;
}

.chart-container {
  width: 100%;
  height: 300px;
}
</style>
