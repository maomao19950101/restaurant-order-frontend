<template>
  <div class="confirm-page">
    <div class="confirm-header">
      <div class="header-nav">
        <div class="back-btn" @click="$router.back()">
          <van-icon name="arrow-left" size="20" />
        </div>
        <div class="header-title">确认订单</div>
        <div class="header-placeholder"></div>
      </div>
    </div>
    <div class="confirm-content">
      <div class="info-card collab-card" v-if="cart.isShared">
        <div class="card-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <div class="card-info">
          <div class="card-label">多人协同点餐</div>
          <div class="card-value">{{ cart.onlineMembers }}人正在参与</div>
        </div>
        <van-tag type="primary" size="medium" round>同步中</van-tag>
      </div>
      <div class="info-card table-card">
        <div class="card-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
        <div class="card-info">
          <div class="card-label">就餐桌号</div>
          <div class="card-value">{{ cart.tableId ? cart.tableId + '号桌' : '未选择' }}</div>
        </div>
        <van-tag v-if="cart.tableId" type="primary" size="medium" round>已选</van-tag>
      </div>
      <div class="section-card">
        <div class="section-title">
          <span class="section-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11h18l-1.5 7a2 2 0 0 1-2 1.5H6.5a2 2 0 0 1-2-1.5L3 11z"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
          已选菜品
          <span class="section-count">{{ cart.totalCount }}件</span>
        </div>
        <div class="items-list">
          <div v-for="(item, idx) in cart.items" :key="idx" class="confirm-item">
            <div class="item-left">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-specs" v-if="item.specs?.length">{{ item.specs }}</div>
              <div class="item-addedby" v-if="item.addedByName && cart.isShared">
                <van-icon name="friends-o" size="10" /> {{ item.addedByName }}添加
              </div>
            </div>
            <div class="item-right">
              <span class="item-qty">×{{ item.quantity }}</span>
              <span class="price">{{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="section-card">
        <div class="section-title">
          <span class="section-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span>
          备注信息
        </div>
        <div class="remark-input">
          <textarea v-model="remark" placeholder="口味偏好、过敏信息等..." rows="3"></textarea>
        </div>
      </div>
      <div class="section-card price-card">
        <div class="price-row">
          <span class="price-label">菜品小计</span>
          <span class="price-value">{{ cart.totalPrice.toFixed(2) }}</span>
        </div>
        <div class="price-row">
          <span class="price-label">餐位费</span>
          <span class="price-value free">免费</span>
        </div>
        <div class="price-divider"></div>
        <div class="price-row total-row">
          <span class="price-label">合计</span>
          <span class="price total">{{ cart.totalPrice.toFixed(2) }}</span>
        </div>
      </div>
    </div>
    <div class="confirm-footer safe-bottom">
      <div class="footer-info">
        <span class="footer-count">{{ cart.totalCount }}件</span>
        <span class="price footer-total">{{ cart.totalPrice.toFixed(2) }}</span>
      </div>
      <van-button type="primary" round class="submit-btn" :loading="submitting" @click="submitOrder">
        {{ cart.isShared ? '全员确认下单' : '确认下单' }}
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { createOrder, createSharedOrder } from '../api'
import { getOpenid } from '../utils/auth'
import { showToast, showDialog } from 'vant'

const cart = useCartStore()
const router = useRouter()
const submitting = ref(false)
const remark = ref(cart.remark || '')

async function submitOrder() {
  if (cart.items.length === 0) {
    showToast('请先选择菜品')
    return
  }
  if (!cart.tableId) {
    showToast('请先扫码选择桌台')
    return
  }
  if (cart.isShared && cart.onlineMembers > 1) {
    try {
      await showDialog({
        title: '确认下单',
        message: `当前有${cart.onlineMembers}人正在点餐，确定要提交订单吗？提交后将清空所有人的购物车。`,
        confirmButtonText: '确认提交',
        cancelButtonText: '再等等',
      })
    } catch {
      return
    }
  }
  submitting.value = true
  try {
    let res
    if (cart.isShared) {
      res = await createSharedOrder({
        restaurantId: cart.restaurantId,
        tableId: cart.tableId,
        memberId: cart.memberId,
        remark: remark.value,
      })
    } else {
      const orderData = {
        restaurantId: cart.restaurantId,
        tableId: cart.tableId,
        openid: getOpenid(),
        remark: remark.value,
        items: cart.items.map((item) => ({
          dishId: item.dishId,
          quantity: item.quantity,
          specIds: item.specIds || [],
          remark: item.remark || '',
        })),
      }
      res = await createOrder(orderData)
    }
    const orderNo = res.data?.orderNo
    cart.clearCart()
    showToast('下单成功')
    if (orderNo) {
      router.replace(`/order/${orderNo}`)
    } else {
      router.replace('/orders')
    }
  } catch (e) {
    showToast('下单失败: ' + (e.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.confirm-page {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
}

.confirm-header {
  background: linear-gradient(135deg, #ff6347 0%, #ff8a65 100%);
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

.confirm-content {
  flex: 1;
  padding: 16px;
  padding-bottom: 100px;
  overflow-y: auto;
}

.info-card {
  display: flex;
  align-items: center;
  background: var(--surface);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}

.collab-card {
  background: linear-gradient(135deg, rgba(91, 110, 245, 0.06) 0%, rgba(124, 92, 191, 0.06) 100%);
  border: 1px solid rgba(91, 110, 245, 0.15);
}

.card-icon {
  font-size: 24px;
  margin-right: 12px;
}

.card-info {
  flex: 1;
}

.card-label {
  font-size: 12px;
  color: var(--text3);
  font-weight: 400;
}

.card-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-top: 2px;
}

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

.section-count {
  font-size: 12px;
  color: var(--text3);
  font-weight: 400;
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}

.items-list {
  border-top: 1px solid var(--border);
}

.confirm-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 0;
  border-bottom: 1px solid var(--border);
}

.confirm-item:last-child {
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

.item-addedby {
  font-size: 11px;
  color: #5b6ef5;
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 3px;
  font-weight: 500;
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

.remark-input textarea {
  width: 100%;
  border: 1.5px solid var(--border-strong);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  font-size: 14px;
  outline: none;
  resize: none;
  background: var(--bg);
  font-family: inherit;
  transition: border-color 0.2s ease, background 0.2s ease;
  line-height: 1.5;
}

.remark-input textarea:focus {
  border-color: var(--primary);
  background: #fff;
}

.price-card {
  padding: 16px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 0;
}

.price-label {
  font-size: 14px;
  color: var(--text2);
}

.price-value {
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.price-value.free {
  color: var(--green);
  font-weight: 600;
}

.price-divider {
  height: 1px;
  background: var(--border);
  margin: 10px 0;
}

.total-row .price-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

.total-row .total {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.confirm-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--surface);
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.05);
  z-index: 100;
  border-top: 1px solid var(--border);
}

.footer-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.footer-count {
  font-size: 13px;
  color: var(--text3);
  font-weight: 400;
}

.footer-total {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.submit-btn {
  background: var(--primary) !important;
  border: none !important;
  padding: 0 36px;
  height: 46px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(255, 107, 53, 0.3);
  border-radius: 23px !important;
}
</style>
