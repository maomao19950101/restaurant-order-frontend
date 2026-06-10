<template>
  <div>
    <div class="page-header">
      <h2>数据看板</h2>
      <div style="display: flex; align-items: center; gap: 12px">
        <span v-if="wsConnected" class="ws-dot online">● 实时连接</span>
        <span v-else class="ws-dot offline">● 未连接</span>
        <button class="refresh-btn" @click="loadStats">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
        </button>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="stat-grid">
      <div class="stat-item" v-for="(s, i) in statCards" :key="i">
        <div class="stat-icon" :style="{ background: s.bg }">
          <span v-html="s.icon"></span>
        </div>
        <div class="stat-info">
          <div class="stat-value" :style="{ color: s.color }">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">最新订单</span>
        <button class="link-btn" @click="$router.push('/orders')">查看全部 →</button>
      </div>
      <el-table :data="recentOrders" v-loading="loading" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="totalAmount" label="金额" width="100">
          <template #default="{ row }">
            <span style="color: var(--green); font-weight: 600">¥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span :class="['status-badge', statusClass(row.status)]">{{ statusText(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="itemCount" label="菜品数" width="80" />
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="下单时间" width="180" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElNotification } from 'element-plus'
import { getStats, getOrders } from '../api'

const stats = ref({})
const recentOrders = ref([])
const loading = ref(false)
const wsConnected = ref(false)

const statusText = (s) => ['待接单','已接单','制作中','已出餐','已完成','已取消'][s] || '未知'
const statusClass = (s) => ['pending','accepted','cooking','ready','done','cancelled'][s] || ''

const statCards = computed(() => [
  {
    label: '今日营收',
    value: `¥${stats.value.todayRevenue || 0}`,
    color: 'var(--green)',
    bg: 'rgba(34,197,94,.12)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2" width="22" height="22"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
  },
  {
    label: '今日订单',
    value: stats.value.todayOrderCount || 0,
    color: 'var(--accent)',
    bg: 'rgba(59,130,246,.12)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" width="22" height="22"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>`
  },
  {
    label: '待处理',
    value: stats.value.pendingCount || 0,
    color: 'var(--yellow)',
    bg: 'rgba(234,179,8,.12)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
  },
  {
    label: '已完成',
    value: stats.value.completedCount || 0,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,.12)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" width="22" height="22"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
  }
])

const loadStats = async () => {
  try { stats.value = await getStats() } catch (e) { console.error(e) }
}
const loadOrders = async () => {
  loading.value = true
  try { recentOrders.value = (await getOrders({ page: 1, size: 10 })).records } catch (e) { console.error(e) }
  loading.value = false
}

const handleNewOrder = () => {
  loadStats(); loadOrders()
  ElNotification({ title: '📊 数据刷新', message: '有新订单，数据已自动更新', type: 'info', duration: 2000 })
}

onMounted(() => { loadStats(); loadOrders(); window.addEventListener('new-order', handleNewOrder) })
onUnmounted(() => { window.removeEventListener('new-order', handleNewOrder) })
</script>

<style scoped>
.ws-dot {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
}
.ws-dot.online { background: rgba(34,197,94,.15); color: var(--green); }
.ws-dot.offline { background: rgba(148,163,184,.15); color: var(--text2); }
.refresh-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text2);
  width: 32px; height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.refresh-btn:hover { border-color: var(--accent); color: var(--accent); }

/* Stat Grid */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.stat-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: border-color .2s;
}
.stat-item:hover { border-color: var(--accent); }
.stat-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-value { font-size: 28px; font-weight: 700; line-height: 1.2; }
.stat-label { font-size: 13px; color: var(--text2); margin-top: 4px; }

/* Card */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}
.card-title { font-size: 15px; font-weight: 600; color: var(--text); }
.link-btn {
  background: none; border: none;
  color: var(--accent); font-size: 13px;
  cursor: pointer; font-weight: 500;
}
.link-btn:hover { text-decoration: underline; }

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.status-badge.pending { background: rgba(234,179,8,.15); color: var(--yellow); }
.status-badge.accepted { background: rgba(59,130,246,.15); color: var(--accent); }
.status-badge.cooking { background: rgba(249,115,22,.15); color: #f97316; }
.status-badge.ready { background: rgba(34,197,94,.15); color: var(--green); }
.status-badge.done { background: rgba(148,163,184,.15); color: var(--text2); }
.status-badge.cancelled { background: rgba(239,68,68,.15); color: var(--red); }

@media (max-width: 1200px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
