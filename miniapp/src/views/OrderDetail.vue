<template>
  <div class="detail-page">
    <!-- Header -->
    <div class="detail-header" :class="'status-' + (order?.status ?? 0)">
      <div class="header-nav">
        <div class="back-btn" @click="$router.back()">
          <van-icon name="arrow-left" size="20" />
        </div>
        <div class="header-title">订单详情</div>
        <div class="header-placeholder"></div>
      </div>
      <div class="status-info" v-if="order">
        <div class="status-icon">{{ statusIcon }}</div>
        <div class="status-text">{{ statusText }}</div>
        <div class="status-desc">{{ statusDesc }}</div>
      </div>
    </div>

    <div class="detail-content" v-if="order">
      <!-- Status timeline -->
      <div class="timeline-card">
        <div class="timeline">
          <div
            v-for="(step, idx) in timelineSteps"
            :key="idx"
            class="timeline-item"
            :class="{ active: idx <= statusStep, current: idx === statusStep }"
          >
            <div class="timeline-dot">
              <van-icon v-if="idx <= statusStep" name="success" size="14" />
            </div>
            <div class="timeline-content">
              <div class="timeline-title">{{ step.title }}</div>
              <div class="timeline-time" v-if="step.time">{{ step.time }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order info -->
      <div class="section-card">
        <div class="section-title">
          <span class="section-icon">📋</span>
          订单信息
        </div>
        <div class="info-rows">
          <div class="info-row">
            <span class="info-label">订单号</span>
            <span class="info-value">{{ order.orderNo }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">桌号</span>
            <span class="info-value">{{ order.tableId }}号桌</span>
          </div>
          <div class="info-row">
            <span class="info-label">下单时间</span>
            <span class="info-value">{{ formatTime(order.createTime) }}</span>
          </div>
        </div>
      </div>

      <!-- Items -->
      <div class="section-card">
        <div class="section-title">
          <span class="section-icon">🍽️</span>
          菜品明细
        </div>
        <div class="items-list">
          <div v-for="(item, idx) in order.items" :key="idx" class="order-item">
            <div class="item-left">
              <div class="item-name">{{ item.dishName }}</div>
              <div class="item-specs" v-if="item.specText">{{ item.specText }}</div>
            </div>
            <div class="item-right">
              <span class="item-qty">×{{ item.quantity }}</span>
              <span class="price">{{ item.subtotal.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Remark -->
      <div class="section-card" v-if="order.remark">
        <div class="section-title">
          <span class="section-icon">📝</span>
          备注
        </div>
        <div class="remark-text">{{ order.remark }}</div>
      </div>

      <!-- Total -->
      <div class="section-card total-card">
        <div class="total-row">
          <span class="total-label">订单合计</span>
          <span class="price total">{{ order.totalAmount.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-else class="loading-wrap">
      <van-loading type="spinner" color="#ff6b35" vertical>加载中...</van-loading>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { getOrderDetail } from '../api'

const route = useRoute()
const order = ref(null)
let ws = null

const statusTexts = ['待接单', '已接单', '制作中', '已出餐', '已完成', '已取消']
const statusIcons = ['⏳', '✅', '👨‍🍳', '🔔', '🎉', '❌']
const statusDescs = ['请耐心等待商家接单', '商家已确认您的订单', '厨师正在精心制作中', '菜品已准备好，请取餐', '感谢您的光临', '订单已取消']

const statusStep = computed(() => {
  if (!order.value) return 0
  const s = order.value.status
  return s >= 5 ? 0 : s
})

const statusText = computed(() => {
  if (!order.value) return ''
  return statusTexts[order.value.status] || '未知'
})

const statusIcon = computed(() => {
  if (!order.value) return '⏳'
  return statusIcons[order.value.status] || '⏳'
})

const statusDesc = computed(() => {
  if (!order.value) return ''
  return statusDescs[order.value.status] || ''
})

const timelineSteps = computed(() => {
  const steps = [
    { title: '提交订单', time: order.value ? formatTime(order.value.createTime) : '' },
    { title: '商家接单', time: '' },
    { title: '制作中', time: '' },
    { title: '已出餐', time: '' },
    { title: '已完成', time: '' },
  ]
  return steps
})

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function connectWebSocket() {
  const orderNo = route.params.orderNo
  if (!orderNo) return
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${location.host}/ws`
  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    ws.send('CONNECT\naccept-version:1.1,1.0\nheart-beat:10000,10000\n\n\x00')
    setTimeout(() => {
      ws.send(`SUBSCRIBE\nid:sub-0\ndestination:/topic/order/${orderNo}\n\n\x00`)
    }, 200)
  }

  ws.onmessage = (event) => {
    const data = event.data
    if (data.includes('MESSAGE') && data.includes('destination')) {
      const jsonStart = data.lastIndexOf('{')
      const jsonEnd = data.lastIndexOf('}')
      if (jsonStart !== -1 && jsonEnd !== -1) {
        try {
          const payload = JSON.parse(data.substring(jsonStart, jsonEnd + 1))
          if (payload.status !== undefined && order.value) {
            order.value.status = payload.status
          }
        } catch (e) { /* ignore */ }
      }
    }
  }

  ws.onerror = () => console.log('WebSocket error')
  ws.onclose = () => {}
}

onMounted(async () => {
  const orderNo = route.params.orderNo
  try {
    const res = await getOrderDetail(orderNo)
    order.value = res.data
    if (order.value?.status < 4) connectWebSocket()
  } catch (e) {
    console.error('Failed to load order:', e)
  }
})

onUnmounted(() => {
  if (ws) ws.close()
})
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: var(--bg);
}

/* Header */
.detail-header {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%);
  padding: 12px 16px 24px;
  padding-top: calc(12px + env(safe-area-inset-top, 0));
  color: #fff;
}

.detail-header.status-4 {
  background: linear-gradient(135deg, #22c55e 0%, #4ade80 100%);
}

.detail-header.status-5 {
  background: linear-gradient(135deg, #999 0%, #bbb 100%);
}

.header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
}

.header-title {
  font-size: 17px;
  font-weight: 600;
}

.header-placeholder {
  width: 36px;
}

.status-info {
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.status-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.status-text {
  font-size: 20px;
  font-weight: 700;
}

.status-desc {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 4px;
}

/* Content */
.detail-content {
  padding: 16px;
  padding-bottom: 30px;
  margin-top: -8px;
}

/* Timeline card */
.timeline-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 20px 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}

.timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  height: 2px;
  background: var(--border);
}

.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  flex: 1;
}

.timeline-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.timeline-item.active .timeline-dot {
  background: var(--primary);
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.timeline-item.current .timeline-dot {
  width: 22px;
  height: 22px;
  animation: pulse 1.5s infinite;
}

.timeline-item.active .timeline-dot :deep(.van-icon) {
  color: #fff;
}

.timeline-content {
  text-align: center;
}

.timeline-title {
  font-size: 11px;
  color: var(--text3);
  white-space: nowrap;
}

.timeline-item.active .timeline-title {
  color: var(--primary);
  font-weight: 600;
}

.timeline-time {
  font-size: 10px;
  color: var(--text3);
  margin-top: 2px;
}

/* Section card */
.section-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-icon {
  font-size: 16px;
}

/* Info rows */
.info-rows {
  border-top: 1px solid var(--border);
  padding-top: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-label {
  font-size: 14px;
  color: var(--text3);
}

.info-value {
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
}

/* Items list */
.items-list {
  border-top: 1px solid var(--border);
}

.order-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.order-item:last-child {
  border-bottom: none;
}

.item-left {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.item-specs {
  font-size: 12px;
  color: var(--text3);
  margin-top: 3px;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.item-qty {
  color: var(--text3);
  font-size: 13px;
}

/* Remark */
.remark-text {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.6;
  padding: 10px 12px;
  background: var(--bg);
  border-radius: var(--radius-sm);
}

/* Total */
.total-card {
  padding: 16px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.total-row .total {
  font-size: 24px;
  font-weight: 700;
}

/* Loading */
.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}
</style>
