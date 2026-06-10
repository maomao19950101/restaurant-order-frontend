<template>
  <div class="orders-page">
    <van-nav-bar title="我的订单" />

    <div class="orders-content" v-if="orders.length">
      <div
        v-for="order in orders"
        :key="order.orderNo"
        class="order-card"
        @click="$router.push('/order/' + order.orderNo)"
      >
        <div class="order-header">
          <span class="order-no">订单号: {{ order.orderNo }}</span>
          <van-tag :type="statusTagType(order.status)">{{ statusText(order.status) }}</van-tag>
        </div>
        <div class="order-items">
          <span v-for="(item, idx) in order.items?.slice(0, 3)" :key="idx" class="order-item-name">
            {{ item.dishName }}×{{ item.quantity }}{{ idx < Math.min(order.items.length, 3) - 1 ? '、' : '' }}
          </span>
          <span v-if="order.items?.length > 3" class="more">等{{ order.items.length }}件</span>
        </div>
        <div class="order-footer">
          <span class="order-time">{{ formatTime(order.createTime) }}</span>
          <span class="price total">{{ order.totalAmount.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <van-empty v-else description="暂无订单" image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image/error-0.png" />

    <!-- Bottom tabbar -->
    <van-tabbar v-model="activeTab" route>
      <van-tabbar-item icon="orders-o" to="/menu">点餐</van-tabbar-item>
      <van-tabbar-item icon="cart-o" to="/orders">订单</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getOrderList } from '../api'
import { getOpenid } from '../utils/auth'

const orders = ref([])
const activeTab = ref(1)

const statusTexts = ['待接单', '已接单', '制作中', '已出餐', '已完成', '已取消']
const tagTypes = ['warning', 'primary', 'primary', 'success', 'default', 'danger']

function statusText(s) { return statusTexts[s] || '未知' }
function statusTagType(s) { return tagTypes[s] || 'default' }

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getMonth() + 1}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(async () => {
  try {
    const res = await getOrderList({ openid: getOpenid(), page: 1, size: 20 })
    orders.value = res.data?.records || res.data || []
  } catch (e) {
    console.error('Failed to load orders:', e)
  }
})
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  background: var(--bg);
}
.orders-content {
  padding: 12px;
}
.order-card {
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.order-no {
  font-size: 13px;
  color: var(--text-secondary);
}
.order-items {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 10px;
}
.order-item-name { color: var(--text); }
.more { color: var(--text-secondary); }
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #f5f5f5;
}
.order-time {
  font-size: 12px;
  color: var(--text-secondary);
}
.order-footer .total {
  font-size: 16px;
  font-weight: 600;
}
</style>
