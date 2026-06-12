<template>
  <div class="coupons-page">
    <!-- Header -->
    <div class="coupons-header">
      <div class="header-nav">
        <div class="back-btn" @click="$router.back()">
          <van-icon name="arrow-left" size="20" />
        </div>
        <div class="header-title">我的优惠券</div>
        <div class="header-placeholder"></div>
      </div>
    </div>

    <!-- Tab切换 -->
    <div class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab-item', { active: currentTab === tab.value }]"
        @click="currentTab = tab.value"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- 优惠券列表 -->
    <div class="coupons-content">
      <div v-if="loading" class="loading-wrap">
        <van-loading type="spinner" color="#f59e0b" vertical>加载中...</van-loading>
      </div>

      <div v-else-if="filteredCoupons.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
          <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/>
        </svg>
        <p>暂无优惠券</p>
      </div>

      <div v-else class="coupon-list">
        <div
          v-for="coupon in filteredCoupons"
          :key="coupon.id"
          :class="['coupon-card', { disabled: coupon.status !== 0 || coupon.expired }]"
        >
          <div class="coupon-left">
            <div class="coupon-value">
              <span v-if="coupon.type === 'fixed'">¥{{ coupon.value }}</span>
              <span v-else-if="coupon.type === 'discount'">{{ (coupon.value * 10).toFixed(1) }}折</span>
              <span v-else>免单</span>
            </div>
            <div class="coupon-condition" v-if="coupon.minAmount > 0">
              满{{ coupon.minAmount }}可用
            </div>
          </div>
          <div class="coupon-right">
            <div class="coupon-name">{{ coupon.name }}</div>
            <div class="coupon-time">
              <template v-if="coupon.status === 1">
                <span class="used-tag">已使用</span>
              </template>
              <template v-else-if="coupon.expired">
                <span class="expired-tag">已过期</span>
              </template>
              <template v-else>
                {{ formatTime(coupon.expireAt) }}到期
              </template>
            </div>
            <div class="coupon-use" v-if="coupon.status === 0 && !coupon.expired">
              <van-button type="primary" size="mini" round @click="goUse">去使用</van-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserCoupons } from '../api'

const router = useRouter()
const loading = ref(false)
const coupons = ref([])
const currentTab = ref('available')

const tabs = [
  { value: 'available', label: '可使用' },
  { value: 'used', label: '已使用' },
  { value: 'expired', label: '已过期' }
]

const filteredCoupons = computed(() => {
  switch (currentTab.value) {
    case 'available':
      return coupons.value.filter(c => c.status === 0 && !c.expired)
    case 'used':
      return coupons.value.filter(c => c.status === 1)
    case 'expired':
      return coupons.value.filter(c => c.status === 2 || c.expired)
    default:
      return coupons.value
  }
})

const formatTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

const goUse = () => {
  router.push('/menu')
}

const loadCoupons = async () => {
  loading.value = true
  try {
    // TODO: 从会员信息获取memberId
    const res = await getUserCoupons({ memberId: 1 })
    coupons.value = res.data || []
  } catch (error) {
    console.error('加载优惠券失败:', error)
  }
  loading.value = false
}

onMounted(loadCoupons)
</script>

<style scoped>
.coupons-page {
  min-height: 100vh;
  background: var(--bg);
}

.coupons-header {
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  padding: 12px 16px;
  padding-top: calc(12px + env(safe-area-inset-top, 0));
  color: #fff;
}

.header-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.header-title {
  font-size: 17px;
  font-weight: 600;
}

.header-placeholder {
  width: 38px;
}

.tab-bar {
  display: flex;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 14px 0;
  font-size: 14px;
  color: var(--text2);
  cursor: pointer;
  position: relative;
}

.tab-item.active {
  color: #f59e0b;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 30%;
  right: 30%;
  height: 2px;
  background: #f59e0b;
  border-radius: 1px;
}

.coupons-content {
  padding: 16px;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text3);
}

.empty-state p {
  margin-top: 12px;
  font-size: 14px;
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coupon-card {
  display: flex;
  background: var(--surface);
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
}

.coupon-card.disabled {
  opacity: 0.6;
}

.coupon-left {
  width: 100px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
}

.coupon-value {
  font-size: 24px;
  font-weight: 700;
}

.coupon-condition {
  font-size: 11px;
  opacity: 0.8;
  margin-top: 4px;
}

.coupon-right {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.coupon-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 6px;
}

.coupon-time {
  font-size: 12px;
  color: var(--text3);
  margin-bottom: 8px;
}

.used-tag {
  color: #10b981;
}

.expired-tag {
  color: #ef4444;
}

.coupon-use {
  display: flex;
  justify-content: flex-end;
}
</style>
