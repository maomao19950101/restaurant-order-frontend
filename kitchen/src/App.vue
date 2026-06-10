<template>
  <div class="kitchen-app">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-left">
        <div class="logo">K</div>
        <div class="header-info">
          <h1>厨房出餐系统</h1>
          <span class="restaurant-name">{{ restaurantName }}</span>
        </div>
      </div>
      <nav class="header-nav">
        <button class="nav-btn" :class="{ active: currentTab === 'orders' }" @click="currentTab = 'orders'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          订单看板
        </button>
        <button class="nav-btn" :class="{ active: currentTab === 'stats' }" @click="currentTab = 'stats'; loadStats()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          销售统计
        </button>
      </nav>
      <div class="header-right">
        <div class="live-clock">
          <span class="clock-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span>
          <span class="clock-text">{{ currentTime }}</span>
        </div>
        <div class="online-dot"></div>
      </div>
    </header>

    <!-- 订单看板 -->
    <main v-if="currentTab === 'orders'" class="board">
      <!-- 待制作 -->
      <section class="board-col">
        <div class="col-header pending-header">
          <div class="col-title">
            <span class="status-dot pending-dot"></span>
            <h2>待制作</h2>
          </div>
          <span class="badge pending-badge">{{ pendingOrders.length }}</span>
        </div>
        <div class="col-body">
          <TransitionGroup name="card">
            <div v-for="order in pendingOrders" :key="order.id" class="order-card" :class="{ urgent: isUrgent(order) }">
              <div class="card-top">
                <div class="table-tag">{{ order.tableNo || '桌' + order.tableId }}</div>
                <div class="time-tag">
                  <span v-if="isUrgent(order)" class="urgent-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>
                  {{ formatTime(order.createdAt) }}
                </div>
              </div>
              <div class="card-items">
                <div v-for="item in order.items" :key="item.id" class="card-item">
                  <span class="item-name">{{ item.dishName }}</span>
                  <span class="item-qty">×{{ item.quantity }}</span>
                </div>
              </div>
              <button class="btn btn-primary" @click="startCooking(order)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                开始制作
              </button>
            </div>
          </TransitionGroup>
          <div v-if="pendingOrders.length === 0" class="empty-state">
            <div class="empty-icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="20" cy="20" r="16" stroke-opacity="0.3"/><path d="M14 20l4 4 8-8" stroke-opacity="0.5"/></svg></div>
            <p>暂无待制作订单</p>
          </div>
        </div>
      </section>

      <!-- 制作中 -->
      <section class="board-col">
        <div class="col-header cooking-header">
          <div class="col-title">
            <span class="status-dot cooking-dot"></span>
            <h2>制作中</h2>
          </div>
          <span class="badge cooking-badge">{{ cookingOrders.length }}</span>
        </div>
        <div class="col-body">
          <TransitionGroup name="card">
            <div v-for="order in cookingOrders" :key="order.id" class="order-card cooking" :class="{ urgent: isUrgent(order) }">
              <div class="card-top">
                <div class="table-tag cooking-tag">{{ order.tableNo || '桌' + order.tableId }}</div>
                <div class="time-tag">
                  <span v-if="isUrgent(order)" class="urgent-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>
                  {{ formatTime(order.createdAt) }}
                </div>
              </div>
              <div class="card-items">
                <div v-for="item in order.items" :key="item.id" class="card-item">
                  <span class="item-name">{{ item.dishName }}</span>
                  <span class="item-qty">×{{ item.quantity }}</span>
                </div>
              </div>
              <button class="btn btn-success" @click="completeOrder(order)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                出餐完成
              </button>
            </div>
          </TransitionGroup>
          <div v-if="cookingOrders.length === 0" class="empty-state">
            <div class="empty-icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 28h16v-4c0-1-1-2-2-2H14c-1 0-2 1-2 2v4z" stroke-opacity="0.3"/><path d="M14 22v-4a6 6 0 0 1 12 0v4" stroke-opacity="0.5"/><circle cx="16" cy="14" r="3" stroke-opacity="0.3"/><circle cx="24" cy="14" r="3" stroke-opacity="0.3"/><circle cx="20" cy="12" r="3" stroke-opacity="0.3"/></svg></div>
            <p>暂无制作中订单</p>
          </div>
        </div>
      </section>

      <!-- 已出餐 -->
      <section class="board-col">
        <div class="col-header done-header">
          <div class="col-title">
            <span class="status-dot done-dot"></span>
            <h2>已出餐</h2>
          </div>
          <span class="badge done-badge">{{ doneOrders.length }}</span>
        </div>
        <div class="col-body">
          <TransitionGroup name="card">
            <div v-for="order in doneOrders" :key="order.id" class="order-card done">
              <div class="card-top">
                <div class="table-tag done-tag">{{ order.tableNo || '桌' + order.tableId }}</div>
                <div class="time-tag">{{ formatTime(order.createdAt) }}</div>
              </div>
              <div class="card-items">
                <div v-for="item in order.items" :key="item.id" class="card-item">
                  <span class="item-name">{{ item.dishName }}</span>
                  <span class="item-qty">×{{ item.quantity }}</span>
                </div>
              </div>
            </div>
          </TransitionGroup>
          <div v-if="doneOrders.length === 0" class="empty-state">
            <div class="empty-icon"><svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="10" y="8" width="20" height="24" rx="2" stroke-opacity="0.3"/><path d="M16 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-opacity="0.3"/><line x1="14" y1="16" x2="26" y2="16" stroke-opacity="0.5"/><line x1="14" y1="22" x2="26" y2="22" stroke-opacity="0.5"/><line x1="14" y1="28" x2="22" y2="28" stroke-opacity="0.5"/></svg></div>
            <p>暂无已出餐订单</p>
          </div>
        </div>
      </section>
    </main>

    <!-- 统计页面 -->
    <main v-if="currentTab === 'stats'" class="stats-page">
      <!-- 时间段选择 -->
      <div class="period-bar">
        <button v-for="p in periods" :key="p.value" class="period-pill" :class="{ active: selectedPeriod === p.value }" @click="selectedPeriod = p.value; loadStats()">
          {{ p.label }}
        </button>
      </div>

      <!-- 数据卡片 -->
      <div class="stat-cards">
        <div class="stat-card card-orders">
          <div class="stat-content">
            <div class="stat-number">{{ statsData.totalOrders || 0 }}</div>
            <div class="stat-name">总订单</div>
          </div>
        </div>
        <div class="stat-card card-revenue">
          <div class="stat-content">
            <div class="stat-number">¥{{ formatMoney(statsData.totalAmount) }}</div>
            <div class="stat-name">总营收</div>
          </div>
        </div>
        <div class="stat-card card-types">
          <div class="stat-content">
            <div class="stat-number">{{ statsData.dishes?.length || 0 }}</div>
            <div class="stat-name">菜品种类</div>
          </div>
        </div>
        <div class="stat-card card-quantity">
          <div class="stat-content">
            <div class="stat-number">{{ totalDishQuantity }}</div>
            <div class="stat-name">总出餐</div>
          </div>
        </div>
      </div>

      <!-- 排行榜 -->
      <div class="ranking-panel">
        <div class="ranking-header">
          <h3>菜品销量排行榜</h3>
          <span class="ranking-sub">{{ periodLabel(selectedPeriod) }}</span>
        </div>
        <div class="ranking-body">
          <div v-for="(dish, i) in statsData.dishes" :key="dish.dishId" class="rank-row" :class="{ 'top-3': i < 3 }">
            <div class="rank-num" :class="['rank-' + (i + 1), { top: i < 3 }]">{{ i + 1 }}</div>
            <div class="rank-name">{{ dish.dishName }}</div>
            <div class="rank-bar-col">
              <div class="rank-bar-track">
                <div class="rank-bar-fill" :class="'bar-' + (i + 1)" :style="{ width: barWidth(dish.quantity) }"></div>
              </div>
            </div>
            <div class="rank-qty">{{ dish.quantity }} 份</div>
            <div class="rank-amount">¥{{ formatMoney(dish.amount) }}</div>
          </div>
          <div v-if="!statsData.dishes?.length" class="empty-ranking">
            <div class="empty-icon"><svg width="32" height="32" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="10" y="8" width="20" height="24" rx="2" stroke-opacity="0.3"/><path d="M16 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-opacity="0.3"/><line x1="14" y1="16" x2="26" y2="16" stroke-opacity="0.5"/><line x1="14" y1="22" x2="26" y2="22" stroke-opacity="0.5"/><line x1="14" y1="28" x2="22" y2="28" stroke-opacity="0.5"/></svg></div>
            <p>暂无销售数据</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const restaurantId = 1
const restaurantName = ref('示例餐厅')
const currentTab = ref('orders')
const currentTime = ref('')
const pendingOrders = ref([])
const cookingOrders = ref([])
const doneOrders = ref([])

const selectedPeriod = ref('today')
const statsData = ref({})
const periods = [
  { value: 'today', label: '今日', icon: '' },
  { value: 'week', label: '本周', icon: '' },
  { value: 'month', label: '本月', icon: '' },
  { value: 'quarter', label: '季度', icon: '' },
  { value: 'halfYear', label: '半年', icon: '' },
  { value: 'year', label: '全年', icon: '' },
]

const totalDishQuantity = computed(() => {
  return statsData.value.dishes?.reduce((sum, d) => sum + d.quantity, 0) || 0
})

const periodLabel = (val) => periods.find(p => p.value === val)?.label || ''

const barWidth = (qty) => {
  const max = statsData.value.dishes?.[0]?.quantity || 1
  return Math.max(8, (qty / max) * 100) + '%'
}

const formatMoney = (val) => {
  if (!val) return '0.00'
  return parseFloat(val).toFixed(2)
}

const loadOrders = async () => {
  try {
    const res = await fetch(`/api/kitchen/orders?restaurantId=${restaurantId}`)
    const data = await res.json()
    if (data.code === 200) {
      const orders = data.data || []
      pendingOrders.value = orders.filter(o => o.status === 1)
      cookingOrders.value = orders.filter(o => o.status === 2)
      doneOrders.value = orders.filter(o => o.status === 3)
    }
  } catch (e) { console.error('加载订单失败:', e) }
}

const loadStats = async () => {
  try {
    const res = await fetch(`/api/kitchen/stats/dish-sales?restaurantId=${restaurantId}&period=${selectedPeriod.value}`)
    const data = await res.json()
    if (data.code === 200) statsData.value = data.data
  } catch (e) { console.error('加载统计失败:', e) }
}

const startCooking = async (order) => {
  try {
    await fetch(`/api/kitchen/order/${order.id}/cooking`, { method: 'PUT' })
    loadOrders()
    playSound()
  } catch (e) { console.error('更新失败:', e) }
}

const completeOrder = async (order) => {
  try {
    await fetch(`/api/kitchen/order/${order.id}/done`, { method: 'PUT' })
    loadOrders()
  } catch (e) { console.error('更新失败:', e) }
}

const isUrgent = (order) => {
  return Date.now() - new Date(order.createdAt).getTime() > 15 * 60 * 1000
}

const formatTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const updateTime = () => {
  const now = new Date()
  currentTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

const playSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 800; gain.gain.value = 0.3
    osc.start()
    setTimeout(() => { osc.stop(); ctx.close() }, 200)
  } catch (e) {}
}

let timeTimer, pollTimer
onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
  loadOrders()
  pollTimer = setInterval(loadOrders, 30000)
})
onUnmounted(() => { clearInterval(timeTimer); clearInterval(pollTimer) })
</script>

<style>
/* ========== Design Tokens ========== */
:root {
  --bg: #0c0d0f;
  --surface: #1a1b1e;
  --surface2: #222326;
  --border: rgba(255,255,255,0.06);
  --border-strong: rgba(255,255,255,0.12);
  --text: #f1f3f5;
  --text2: #9ca3af;
  --brand: #6366f1;
  --brand-hover: #5558e6;
  --success: #10b981;
  --success-hover: #0d9668;
  --warning: #f59e0b;
  --danger: #ef4444;
  --radius: 10px;
  --radius-sm: 6px;
  --radius-lg: 14px;
  --shadow: 0 2px 12px rgba(0,0,0,.25);
  --transition: .2s cubic-bezier(.4,0,.2,1);
}

.kitchen-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

/* ========== Header ========== */
.header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 28px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--brand), #8b5cf6);
  border-radius: var(--radius-sm);
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -1px;
}

.header-info h1 {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -.3px;
  color: var(--text);
}

.restaurant-name {
  font-size: 12px;
  color: var(--text2);
  font-weight: 400;
}

/* ========== Navigation ========== */
.header-nav {
  display: flex;
  gap: 6px;
  background: var(--surface2);
  padding: 4px;
  border-radius: var(--radius);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  background: transparent;
  border: none;
  color: var(--text2);
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all var(--transition);
}

.nav-btn svg {
  width: 16px;
  height: 16px;
  opacity: .7;
}

.nav-btn:hover {
  color: var(--text);
  background: rgba(255,255,255,.05);
}

.nav-btn:hover svg {
  opacity: 1;
}

.nav-btn.active {
  background: var(--brand);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99,102,241,.3);
}

.nav-btn.active svg {
  opacity: 1;
}

/* ========== Header Right ========== */
.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.live-clock {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  background: rgba(255,255,255,.03);
  border: 1px solid var(--border);
}

.clock-icon {
  font-size: 13px;
  opacity: .6;
}

.clock-text {
  font-family: 'JetBrains Mono', 'SF Mono', 'Consolas', monospace;
  font-size: 14px;
  font-weight: 500;
  color: var(--text2);
  letter-spacing: .5px;
}

.online-dot {
  width: 8px;
  height: 8px;
  background: var(--success);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(16,185,129,.5);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: .4; }
}

/* ========== Board Layout ========== */
.board {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px 24px;
  overflow: hidden;
}

.board-col {
  background: var(--surface);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
}

/* ========== Column Headers ========== */
.col-header {
  padding: 16px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}

.col-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.col-title h2 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.pending-dot {
  background: var(--warning);
  box-shadow: 0 0 6px rgba(245,158,11,.4);
}

.cooking-dot {
  background: var(--brand);
  box-shadow: 0 0 6px rgba(99,102,241,.4);
  animation: pulse-dot 1.5s infinite;
}

.done-dot {
  background: var(--success);
  box-shadow: 0 0 6px rgba(16,185,129,.4);
}

.badge {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  min-width: 26px;
  text-align: center;
}

.pending-badge {
  background: rgba(245,158,11,.12);
  color: var(--warning);
}

.cooking-badge {
  background: rgba(99,102,241,.12);
  color: var(--brand);
}

.done-badge {
  background: rgba(16,185,129,.12);
  color: var(--success);
}

/* ========== Column Body ========== */
.col-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
}

.col-body::-webkit-scrollbar {
  width: 4px;
}

.col-body::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,.08);
  border-radius: 4px;
}

/* ========== Order Cards ========== */
.order-card {
  background: var(--surface2);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 14px;
  border: 1px solid var(--border);
  transition: all var(--transition);
}

.order-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow);
}

.order-card.cooking {
  border-left: 3px solid var(--brand);
}

.order-card.cooking:hover {
  border-color: var(--brand);
}

.order-card.done {
  border-left: 3px solid var(--success);
  opacity: .55;
}

.order-card.urgent {
  border-left: 3px solid var(--danger);
  animation: card-urgent 2.5s infinite;
}

@keyframes card-urgent {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,.25); }
  50% { box-shadow: 0 0 0 5px rgba(239,68,68,0); }
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.table-tag {
  background: rgba(245,158,11,.1);
  color: var(--warning);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
}

.table-tag.cooking-tag {
  background: rgba(99,102,241,.1);
  color: var(--brand);
}

.table-tag.done-tag {
  background: rgba(16,185,129,.1);
  color: var(--success);
}

.time-tag {
  font-size: 12px;
  color: var(--text2);
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
}

.urgent-icon {
  font-size: 13px;
}

.card-items {
  margin-bottom: 14px;
}

.card-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  font-size: 13px;
  border-bottom: 1px solid var(--border);
}

.card-item:last-child {
  border-bottom: none;
}

.item-name {
  color: var(--text);
  font-weight: 450;
}

.item-qty {
  color: var(--brand);
  font-weight: 700;
  font-size: 14px;
}

/* ========== Buttons ========== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 10px 0;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
}

.btn svg {
  width: 15px;
  height: 15px;
}

.btn-primary {
  background: var(--brand);
  color: #fff;
}

.btn-primary:hover {
  background: var(--brand-hover);
  box-shadow: 0 4px 12px rgba(99,102,241,.3);
}

.btn-success {
  background: var(--success);
  color: #fff;
}

.btn-success:hover {
  background: var(--success-hover);
  box-shadow: 0 4px 12px rgba(16,185,129,.3);
}

/* ========== Empty States ========== */
.empty-state {
  text-align: center;
  padding: 56px 20px;
  color: var(--text2);
}

.empty-icon {
  font-size: 36px;
  margin-bottom: 10px;
  opacity: .6;
}

.empty-state p {
  font-size: 13px;
}

/* ========== Card Animations ========== */
.card-enter-active {
  animation: card-in .35s ease-out;
}

.card-leave-active {
  animation: card-out .25s ease-in;
}

@keyframes card-in {
  from { opacity: 0; transform: translateY(-12px) scale(.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes card-out {
  to { opacity: 0; transform: translateX(24px) scale(.95); }
}

/* ========== Stats Page ========== */
.stats-page {
  flex: 1;
  padding: 24px 28px;
  overflow-y: auto;
}

/* ========== Period Bar ========== */
.period-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  background: var(--surface);
  padding: 6px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  width: fit-content;
}

.period-pill {
  background: transparent;
  border: none;
  color: var(--text2);
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all var(--transition);
}

.period-pill:hover {
  color: var(--text);
  background: rgba(255,255,255,.04);
}

.period-pill.active {
  background: var(--brand);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99,102,241,.25);
}

/* ========== Stat Cards ========== */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all var(--transition);
}

.stat-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface2);
  border-radius: var(--radius);
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -.5px;
}

.stat-name {
  font-size: 12px;
  color: var(--text2);
  margin-top: 3px;
  font-weight: 450;
}

.card-orders .stat-number { color: var(--brand); }
.card-revenue .stat-number { color: var(--success); }
.card-types .stat-number { color: var(--warning); }
.card-quantity .stat-number { color: #a78bfa; }

/* ========== Ranking Panel ========== */
.ranking-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.ranking-header {
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ranking-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.ranking-sub {
  font-size: 12px;
  color: var(--text2);
  background: var(--surface2);
  padding: 4px 12px;
  border-radius: var(--radius-sm);
}

.ranking-body {
  padding: 10px 18px;
}

.rank-row {
  display: grid;
  grid-template-columns: 44px 130px 1fr 72px 80px;
  align-items: center;
  gap: 14px;
  padding: 12px 6px;
  border-bottom: 1px solid var(--border);
  transition: background var(--transition);
  border-radius: var(--radius-sm);
}

.rank-row:last-child {
  border-bottom: none;
}

.rank-row:hover {
  background: rgba(255,255,255,.02);
}

.rank-row.top-3 {
  background: rgba(99,102,241,.03);
}

.rank-row.top-3:hover {
  background: rgba(99,102,241,.06);
}

.rank-num {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 700;
  background: var(--surface2);
  color: var(--text2);
}

.rank-num.top {
  color: #f59e0b;
  font-weight: 800;
}

.rank-1 {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #000;
}

.rank-2 {
  background: linear-gradient(135deg, #d1d5db, #9ca3af);
  color: #1a1b1e;
}

.rank-3 {
  background: linear-gradient(135deg, #d97706, #b45309);
  color: #fff;
}

.rank-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
}

.rank-bar-col {
  padding-right: 8px;
}

.rank-bar-track {
  height: 6px;
  background: var(--surface2);
  border-radius: 3px;
  overflow: hidden;
}

.rank-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width .7s cubic-bezier(.4,0,.2,1);
}

.bar-1 { background: linear-gradient(90deg, var(--brand), #8b5cf6); }
.bar-2 { background: linear-gradient(90deg, var(--brand), var(--success)); }
.bar-3 { background: linear-gradient(90deg, var(--warning), #fb923c); }
.rank-bar-fill:not(.bar-1):not(.bar-2):not(.bar-3) { background: var(--border-strong); }

.rank-qty {
  font-size: 13px;
  font-weight: 700;
  color: var(--brand);
  text-align: right;
}

.rank-amount {
  font-size: 12px;
  color: var(--text2);
  text-align: right;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
}

.empty-ranking {
  text-align: center;
  padding: 56px;
  color: var(--text2);
}

/* ========== Responsive ========== */
@media (max-width: 1024px) {
  .board {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .board-col {
    min-height: 280px;
  }
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .rank-row {
    grid-template-columns: 40px 110px 1fr 64px 72px;
    font-size: 12px;
    gap: 10px;
  }
}
</style>
