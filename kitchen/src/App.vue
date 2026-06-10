<template>
  <div class="kitchen-app">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-left">
        <div class="logo">🍳</div>
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
          <span class="clock-icon">🕐</span>
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
                  <span v-if="isUrgent(order)" class="urgent-icon">⚠️</span>
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
            <div class="empty-icon">✅</div>
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
                  <span v-if="isUrgent(order)" class="urgent-icon">⚠️</span>
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
            <div class="empty-icon">👨‍🍳</div>
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
            <div class="empty-icon">📋</div>
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
          {{ p.icon }} {{ p.label }}
        </button>
      </div>

      <!-- 数据卡片 -->
      <div class="stat-cards">
        <div class="stat-card card-orders">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <div class="stat-number">{{ statsData.totalOrders || 0 }}</div>
            <div class="stat-name">总订单</div>
          </div>
        </div>
        <div class="stat-card card-revenue">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-number">¥{{ formatMoney(statsData.totalAmount) }}</div>
            <div class="stat-name">总营收</div>
          </div>
        </div>
        <div class="stat-card card-types">
          <div class="stat-icon">🍽️</div>
          <div class="stat-content">
            <div class="stat-number">{{ statsData.dishes?.length || 0 }}</div>
            <div class="stat-name">菜品种类</div>
          </div>
        </div>
        <div class="stat-card card-quantity">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalDishQuantity }}</div>
            <div class="stat-name">总出餐</div>
          </div>
        </div>
      </div>

      <!-- 排行榜 -->
      <div class="ranking-panel">
        <div class="ranking-header">
          <h3>🏆 菜品销量排行榜</h3>
          <span class="ranking-sub">{{ periodLabel(selectedPeriod) }}</span>
        </div>
        <div class="ranking-body">
          <div v-for="(dish, i) in statsData.dishes" :key="dish.dishId" class="rank-row" :class="{ 'top-3': i < 3 }">
            <div class="rank-num" :class="'rank-' + (i + 1)">{{ i < 3 ? ['🥇','🥈','🥉'][i] : i + 1 }}</div>
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
            <div class="empty-icon">📊</div>
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
  { value: 'today', label: '今日', icon: '📅' },
  { value: 'week', label: '本周', icon: '📆' },
  { value: 'month', label: '本月', icon: '🗓️' },
  { value: 'quarter', label: '季度', icon: '📊' },
  { value: 'halfYear', label: '半年', icon: '📈' },
  { value: 'year', label: '全年', icon: '🎯' },
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
/* ========== 全局 ========== */
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --bg: #0f172a;
  --surface: #1e293b;
  --surface2: #273548;
  --border: #334155;
  --text: #f1f5f9;
  --text2: #94a3b8;
  --accent: #3b82f6;
  --green: #22c55e;
  --yellow: #eab308;
  --red: #ef4444;
  --orange: #f97316;
  --purple: #a855f7;
  --radius: 12px;
  --shadow: 0 4px 24px rgba(0,0,0,.3);
}
body { background: var(--bg); font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif; color: var(--text); }
.kitchen-app { min-height: 100vh; display: flex; flex-direction: column; }

/* ========== 头部 ========== */
.header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky; top: 0; z-index: 100;
  backdrop-filter: blur(12px);
}
.header-left { display: flex; align-items: center; gap: 12px; }
.logo { font-size: 28px; }
.header-info h1 { font-size: 18px; font-weight: 700; letter-spacing: -.5px; }
.restaurant-name { font-size: 12px; color: var(--text2); }

.header-nav { display: flex; gap: 4px; }
.nav-btn {
  display: flex; align-items: center; gap: 6px;
  background: transparent; border: none; color: var(--text2);
  padding: 8px 16px; border-radius: 8px; cursor: pointer;
  font-size: 14px; font-weight: 500; transition: all .2s;
}
.nav-btn svg { width: 18px; height: 18px; }
.nav-btn:hover { background: var(--surface2); color: var(--text); }
.nav-btn.active { background: var(--accent); color: #fff; }

.header-right { display: flex; align-items: center; gap: 16px; }
.live-clock {
  display: flex; align-items: center; gap: 6px;
  background: var(--surface2); padding: 6px 14px; border-radius: 8px;
}
.clock-icon { font-size: 14px; }
.clock-text { font-family: 'SF Mono', 'Consolas', monospace; font-size: 15px; font-weight: 600; color: var(--accent); letter-spacing: 1px; }
.online-dot { width: 8px; height: 8px; background: var(--green); border-radius: 50%; animation: pulse-dot 2s infinite; }
@keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: .4; } }

/* ========== 订单看板 ========== */
.board {
  flex: 1; display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 16px; padding: 16px; overflow: hidden;
}
.board-col {
  background: var(--surface); border-radius: var(--radius);
  display: flex; flex-direction: column; overflow: hidden;
  border: 1px solid var(--border);
}
.col-header {
  padding: 14px 16px; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid var(--border);
}
.col-title { display: flex; align-items: center; gap: 8px; }
.col-title h2 { font-size: 15px; font-weight: 600; }
.status-dot { width: 10px; height: 10px; border-radius: 50%; }
.pending-dot { background: var(--yellow); }
.cooking-dot { background: var(--accent); animation: pulse-dot 1.5s infinite; }
.done-dot { background: var(--green); }
.badge {
  font-size: 13px; font-weight: 700; padding: 2px 10px; border-radius: 20px;
  min-width: 28px; text-align: center;
}
.pending-badge { background: rgba(234,179,8,.15); color: var(--yellow); }
.cooking-badge { background: rgba(59,130,246,.15); color: var(--accent); }
.done-badge { background: rgba(34,197,94,.15); color: var(--green); }

.col-body { flex: 1; overflow-y: auto; padding: 12px; }
.col-body::-webkit-scrollbar { width: 4px; }
.col-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

/* ========== 订单卡片 ========== */
.order-card {
  background: var(--surface2); border-radius: 10px; padding: 14px;
  margin-bottom: 10px; border: 1px solid var(--border);
  transition: all .3s;
}
.order-card:hover { border-color: var(--accent); transform: translateY(-1px); }
.order-card.cooking { border-left: 3px solid var(--accent); }
.order-card.done { border-left: 3px solid var(--green); opacity: .65; }
.order-card.urgent { border-left: 3px solid var(--red); animation: card-urgent 2s infinite; }
@keyframes card-urgent {
  0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,.3); }
  50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
}

.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.table-tag {
  background: rgba(234,179,8,.15); color: var(--yellow);
  padding: 3px 10px; border-radius: 6px; font-size: 13px; font-weight: 700;
}
.table-tag.cooking-tag { background: rgba(59,130,246,.15); color: var(--accent); }
.table-tag.done-tag { background: rgba(34,197,94,.15); color: var(--green); }
.time-tag { font-size: 12px; color: var(--text2); display: flex; align-items: center; gap: 4px; }
.urgent-icon { font-size: 14px; }

.card-items { margin-bottom: 12px; }
.card-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 4px 0; font-size: 14px;
}
.item-name { color: var(--text); }
.item-qty { color: var(--accent); font-weight: 700; font-size: 15px; }

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 9px 0; border: none; border-radius: 8px;
  font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s;
}
.btn svg { width: 16px; height: 16px; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: #2563eb; }
.btn-success { background: var(--green); color: #fff; }
.btn-success:hover { background: #16a34a; }

.empty-state { text-align: center; padding: 48px 16px; color: var(--text2); }
.empty-icon { font-size: 40px; margin-bottom: 8px; }

/* ========== 卡片动画 ========== */
.card-enter-active { animation: card-in .3s ease-out; }
.card-leave-active { animation: card-out .2s ease-in; }
@keyframes card-in { from { opacity: 0; transform: translateY(-10px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes card-out { to { opacity: 0; transform: translateX(30px); } }

/* ========== 统计页 ========== */
.stats-page { flex: 1; padding: 20px 24px; overflow-y: auto; }

.period-bar { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.period-pill {
  background: var(--surface); border: 1px solid var(--border); color: var(--text2);
  padding: 8px 18px; border-radius: 24px; cursor: pointer;
  font-size: 13px; font-weight: 500; transition: all .2s;
}
.period-pill:hover { border-color: var(--accent); color: var(--text); }
.period-pill.active { background: var(--accent); border-color: var(--accent); color: #fff; }

.stat-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
.stat-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 18px;
  display: flex; align-items: center; gap: 14px;
  transition: all .2s;
}
.stat-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: var(--shadow); }
.stat-icon { font-size: 32px; }
.stat-number { font-size: 26px; font-weight: 800; letter-spacing: -.5px; }
.stat-name { font-size: 12px; color: var(--text2); margin-top: 2px; }
.card-orders .stat-number { color: var(--accent); }
.card-revenue .stat-number { color: var(--green); }
.card-types .stat-number { color: var(--orange); }
.card-quantity .stat-number { color: var(--purple); }

/* ========== 排行榜 ========== */
.ranking-panel {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden;
}
.ranking-header {
  padding: 16px 20px; border-bottom: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
}
.ranking-header h3 { font-size: 16px; font-weight: 700; }
.ranking-sub { font-size: 13px; color: var(--text2); }

.ranking-body { padding: 8px 16px; }
.rank-row {
  display: grid; grid-template-columns: 48px 120px 1fr 70px 80px;
  align-items: center; gap: 12px; padding: 10px 4px;
  border-bottom: 1px solid var(--border); transition: background .15s;
}
.rank-row:last-child { border-bottom: none; }
.rank-row:hover { background: var(--surface2); }
.rank-row.top-3 { background: rgba(59,130,246,.04); }

.rank-num {
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; font-size: 14px; font-weight: 700; background: var(--surface2); color: var(--text2);
}
.rank-1 { background: linear-gradient(135deg,#fbbf24,#f59e0b); color: #000; }
.rank-2 { background: linear-gradient(135deg,#d1d5db,#9ca3af); color: #000; }
.rank-3 { background: linear-gradient(135deg,#d97706,#b45309); color: #fff; }

.rank-name { font-size: 14px; font-weight: 500; }

.rank-bar-col { padding-right: 8px; }
.rank-bar-track { height: 8px; background: var(--surface2); border-radius: 4px; overflow: hidden; }
.rank-bar-fill { height: 100%; border-radius: 4px; transition: width .6s ease; }
.bar-1 { background: linear-gradient(90deg, var(--accent), var(--green)); }
.bar-2 { background: linear-gradient(90deg, var(--accent), var(--purple)); }
.bar-3 { background: linear-gradient(90deg, var(--orange), var(--yellow)); }
.rank-bar-fill:not(.bar-1):not(.bar-2):not(.bar-3) { background: var(--border); }

.rank-qty { font-size: 14px; font-weight: 700; color: var(--accent); text-align: right; }
.rank-amount { font-size: 13px; color: var(--text2); text-align: right; }

.empty-ranking { text-align: center; padding: 48px; color: var(--text2); }

/* ========== 响应式 ========== */
@media (max-width: 1024px) {
  .board { grid-template-columns: 1fr; }
  .board-col { min-height: 300px; }
  .stat-cards { grid-template-columns: repeat(2, 1fr); }
  .rank-row { grid-template-columns: 40px 100px 1fr 60px 70px; font-size: 13px; }
}
</style>
