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
        <div class="status-icon" v-html="statusSvg"></div>
        <div class="status-text">{{ statusText }}</div>
        <div class="status-desc">{{ statusDesc }}</div>
      </div>
    </div>

    <!-- 支付状态提示条 -->
    <div v-if="order && order.status === -1" class="payment-bar">
      <div class="payment-info">
        <van-icon name="warning-o" size="16" />
        <span>订单待支付，请在15分钟内完成支付</span>
      </div>
      <van-button type="primary" size="small" round @click="openPayDialog">
        去支付
      </van-button>
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
          <span class="section-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="3" width="14" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg></span>
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
          <span class="section-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11h18l-1.5 7a2 2 0 0 1-2 1.5H6.5a2 2 0 0 1-2-1.5L3 11z"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
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
          <span class="section-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span>
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

    <!-- 催单/叫号提示 -->
    <div v-if="order && order.called === 1" class="call-bar">
      <div class="call-info">
        <van-icon name="volume-o" size="20" color="#f59e0b" />
        <span>您的餐品已出餐，请尽快取餐！</span>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div v-if="order" class="bottom-bar safe-bottom">
      <van-button
        v-if="order.status === -1"
        type="primary"
        block
        round
        @click="openPayDialog"
        class="pay-btn"
      >
        立即支付 ¥{{ order.totalAmount?.toFixed(2) }}
      </van-button>
      <div v-if="order.status >= 0 && order.status <= 2" class="action-row">
        <van-button
          type="warning"
          plain
          round
          @click="handleUrge"
          :loading="urging"
          class="urge-btn"
        >
          <van-icon name="clock-o" size="16" />
          催单{{ order.urgeCount > 0 ? '(' + order.urgeCount + ')' : '' }}
        </van-button>
        <van-button
          type="primary"
          plain
          round
          @click="goAddItems"
          class="add-btn"
        >
          <van-icon name="plus" size="16" />
          加菜
        </van-button>
      </div>
      <van-button
        v-if="order.status === 4 && !order.reviewed"
        type="primary"
        block
        round
        @click="goReview"
        class="review-btn"
      >
        去评价
      </van-button>
    </div>

    <!-- 支付弹窗 -->
    <PayDialog
      ref="payDialogRef"
      :orderNo="order?.orderNo"
      :amount="order?.totalAmount"
      paymentMode="mock"
      @success="onPaySuccess"
      @cancel="onPayCancel"
    />

    <!-- Loading -->
    <div v-else class="loading-wrap">
      <van-loading type="spinner" color="#ff6b35" vertical>加载中...</van-loading>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail, urgeOrder } from '../api'
import { showToast } from 'vant'
import PayDialog from '../components/PayDialog.vue'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const payDialogRef = ref(null)
const urging = ref(false)
let ws = null

const statusTexts = ['待支付', '待接单', '已接单', '制作中', '已出餐', '已完成', '已取消']
const statusIcons = ['unpaid', 'pending', 'accepted', 'cooking', 'ready', 'done', 'cancelled']
const statusDescs = ['请在15分钟内完成支付', '请耐心等待商家接单', '商家已确认您的订单', '厨师正在精心制作中', '菜品已准备好，请取餐', '感谢您的光临', '订单已取消']

const statusStep = computed(() => {
  if (!order.value) return 0
  const s = order.value.status
  if (s === -1) return 0  // 待支付
  return s >= 5 ? 0 : s
})

const statusText = computed(() => {
  if (!order.value) return ''
  const s = order.value.status
  // 待支付状态
  if (s === -1) return statusTexts[0]
  return statusTexts[s + 1] || '未知'
})

const statusIconSvgs = {
  unpaid: '<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
  pending: '<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  accepted: '<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  cooking: '<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>',
  ready: '<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  done: '<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  cancelled: '<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
}

const statusIcon = computed(() => {
  if (!order.value) return 'unpaid'
  const s = order.value.status
  if (s === -1) return 'unpaid'
  return statusIcons[s + 1] || 'pending'
})

const statusSvg = computed(() => {
  return statusIconSvgs[statusIcon.value] || statusIconSvgs.pending
})

const statusDesc = computed(() => {
  if (!order.value) return ''
  const s = order.value.status
  if (s === -1) return statusDescs[0]
  return statusDescs[s + 1] || ''
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

// 打开支付弹窗
function openPayDialog() {
  payDialogRef.value?.open()
}

// 支付成功回调
function onPaySuccess(data) {
  // 刷新订单状态
  if (order.value) {
    order.value.status = 0  // 更新为待接单
    order.value.paid = 1
  }
}

// 取消支付回调
function onPayCancel() {
  // 用户取消支付，可以稍后再付
}

// 催单
async function handleUrge() {
  if (!order.value?.orderNo) return
  urging.value = true
  try {
    const res = await urgeOrder(order.value.orderNo)
    if (res.code === 200) {
      order.value.urgeCount = res.data.urgeCount
      order.value.lastUrgeTime = res.data.lastUrgeTime
      showToast({ message: '催单成功，厨房已收到通知', type: 'success' })
    }
  } catch (e) {
    showToast({ message: e.message || '催单失败', type: 'fail' })
  }
  urging.value = false
}

// 加菜
function goAddItems() {
  router.push(`/menu?orderNo=${order.value.orderNo}`)
}

// 去评价
function goReview() {
  router.push(`/review/${order.value.orderNo}`)
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
          // 处理叫号通知
          if (payload.type === 'CALL_ORDER' && order.value) {
            order.value.called = 1
            order.value.calledAt = new Date().toISOString()
            showToast({ message: '您的餐品已出餐，请尽快取餐！', duration: 5000 })
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
  background: linear-gradient(135deg, #ff6347 0%, #ff8a65 100%);
  padding: 12px 16px 28px;
  padding-top: calc(12px + env(safe-area-inset-top, 0));
  color: #fff;
}

.detail-header.status-4 {
  background: linear-gradient(135deg, #16a34a 0%, #4ade80 100%);
}

.detail-header.status-5 {
  background: linear-gradient(135deg, #9ca3af 0%, #d1d5db 100%);
}

.header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.back-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  transition: background 0.2s ease;
  backdrop-filter: blur(4px);
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.28);
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.header-placeholder {
  width: 38px;
}

.status-info {
  text-align: center;
  animation: fadeIn 0.35s ease;
}

.status-icon {
  font-size: 42px;
  margin-bottom: 8px;
}

.status-text {
  font-size: 21px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.status-desc {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 5px;
  font-weight: 400;
}

/* Content */
.detail-content {
  padding: 16px;
  padding-bottom: 30px;
  margin-top: -10px;
}

/* Timeline card */
.timeline-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 22px 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}

.timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 9px;
  left: 9px;
  right: 9px;
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
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--border-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-item.active .timeline-dot {
  background: var(--primary);
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.timeline-item.current .timeline-dot {
  width: 24px;
  height: 24px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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
  font-weight: 400;
}

.timeline-item.active .timeline-title {
  color: var(--primary);
  font-weight: 600;
}

.timeline-time {
  font-size: 10px;
  color: var(--text3);
  margin-top: 2px;
  font-variant-numeric: tabular-nums;
}

/* Section card */
.section-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: -0.01em;
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
  padding: 9px 0;
}

.info-label {
  font-size: 14px;
  color: var(--text3);
}

.info-value {
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

/* Items list */
.items-list {
  border-top: 1px solid var(--border);
}

.order-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 0;
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
  line-height: 1.3;
}

.item-specs {
  font-size: 12px;
  color: var(--text3);
  margin-top: 3px;
  line-height: 1.4;
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
  font-weight: 500;
}

/* Remark */
.remark-text {
  font-size: 14px;
  color: var(--text2);
  line-height: 1.6;
  padding: 12px 14px;
  background: var(--bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
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
  letter-spacing: -0.02em;
}

/* Loading */
.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

/* Payment bar */
.payment-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff7ed;
  border-bottom: 1px solid #fed7aa;
}

.payment-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #ea580c;
}

/* Bottom bar */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: var(--surface);
  border-top: 1px solid var(--border);
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.05);
}

.pay-btn {
  height: 46px;
  font-size: 16px;
  font-weight: 600;
}

/* Call bar */
.call-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 16px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-bottom: 1px solid #f59e0b;
  animation: pulse-bg 2s ease-in-out infinite;
}

@keyframes pulse-bg {
  0%, 100% { background: linear-gradient(135deg, #fef3c7, #fde68a); }
  50% { background: linear-gradient(135deg, #fde68a, #fcd34d); }
}

.call-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #92400e;
}

/* Action row */
.action-row {
  display: flex;
  gap: 12px;
}

.urge-btn {
  flex: 1;
  height: 44px;
  font-size: 15px;
}

.review-btn {
  flex: 1;
  height: 44px;
  font-size: 15px;
}
</style>
