<template>
  <div class="cart-wrapper">
    <!-- Cart bar -->
    <div class="cart-bar safe-bottom" @click="cart.toggleCart()">
      <div class="cart-left">
        <div class="cart-icon-wrap" :class="{ 'has-items': cart.totalCount > 0 }">
          <div class="cart-icon">
            <van-icon name="shopping-cart-o" size="22" />
          </div>
          <span class="cart-badge" v-if="cart.totalCount > 0">{{ cart.totalCount }}</span>
        </div>
        <div class="cart-info">
          <div class="cart-price" v-if="cart.totalCount > 0">
            <span class="total-price price">{{ cart.totalPrice.toFixed(2) }}</span>
          </div>
          <div class="cart-empty" v-else>未选购菜品</div>
        </div>
      </div>
      <van-button
        type="primary"
        round
        size="small"
        :disabled="cart.totalCount === 0"
        class="checkout-btn"
        @click.stop="goCheckout"
      >
        去结算
      </van-button>
    </div>

    <!-- Cart detail popup -->
    <van-action-sheet
      v-model:show="cart.showCart"
      title="购物车"
      closeable
      round
    >
      <div class="cart-detail safe-bottom">
        <div class="cart-items">
          <div v-if="cart.items.length === 0" class="empty-tip">
            <div class="empty-icon">🛒</div>
            <div class="empty-text">购物车空空如也</div>
            <div class="empty-sub">快去选些好吃的吧~</div>
          </div>
          <div v-for="(item, idx) in cart.items" :key="idx" class="cart-item">
            <div class="cart-item-info">
              <div class="cart-item-name">{{ item.name }}</div>
              <div class="cart-item-specs" v-if="item.specs?.length">
                {{ item.specs.join('；') }}
              </div>
            </div>
            <div class="cart-item-right">
              <span class="price">{{ (item.price * item.quantity).toFixed(2) }}</span>
              <div class="cart-item-qty">
                <div class="qty-btn minus" @click="decrease(idx)">
                  <van-icon name="minus" size="12" />
                </div>
                <span class="qty-num">{{ item.quantity }}</span>
                <div class="qty-btn plus" @click="increase(idx)">
                  <van-icon name="plus" size="12" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Remark -->
        <div class="cart-remark" v-if="cart.items.length > 0">
          <input v-model="cart.remark" placeholder="订单备注（选填）" />
        </div>
        <!-- Clear cart -->
        <div class="cart-clear" v-if="cart.items.length > 0">
          <span @click="clearAll">
            <van-icon name="delete-o" size="14" /> 清空购物车
          </span>
        </div>
        <div class="cart-footer" v-if="cart.items.length > 0">
          <div class="cart-total">
            <span class="total-label">合计</span>
            <span class="price total">{{ cart.totalPrice.toFixed(2) }}</span>
          </div>
          <van-button
            type="primary"
            round
            class="submit-btn"
            @click="goCheckout"
          >
            提交订单
          </van-button>
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'

const cart = useCartStore()
const router = useRouter()

function increase(idx) {
  cart.items[idx].quantity++
}

function decrease(idx) {
  if (cart.items[idx].quantity > 1) {
    cart.items[idx].quantity--
  } else {
    cart.items.splice(idx, 1)
  }
}

function clearAll() {
  cart.clearCart()
}

function goCheckout() {
  if (cart.totalCount === 0) return
  cart.showCart = false
  router.push('/order/confirm')
}
</script>

<style scoped>
.cart-wrapper {
  position: fixed;
  bottom: 50px;
  left: 0;
  right: 0;
  z-index: 200;
  padding: 0 12px;
}

/* Cart bar */
.cart-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--text);
  border-radius: 24px;
  padding: 8px 8px 8px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;
}

.cart-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-icon-wrap {
  position: relative;
  margin-top: -20px;
}

.cart-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.3s ease;
}

.cart-icon-wrap.has-items .cart-icon {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
}

.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--red);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  animation: bounceIn 0.3s ease;
}

.cart-info {
  display: flex;
  align-items: center;
}

.cart-price .total-price {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
}

.cart-empty {
  color: #666;
  font-size: 13px;
}

.checkout-btn {
  background: #444 !important;
  border: none !important;
  color: #888 !important;
  padding: 0 20px;
  height: 36px;
  font-size: 14px;
  font-weight: 600;
}

.checkout-btn:not(:disabled) {
  background: var(--primary) !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

/* Cart detail */
.cart-detail {
  padding: 8px 16px 16px;
}

.cart-items {
  max-height: 50vh;
  overflow-y: auto;
}

.empty-tip {
  text-align: center;
  padding: 40px 0 30px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 15px;
  color: var(--text2);
  font-weight: 500;
}

.empty-sub {
  font-size: 13px;
  color: var(--text3);
  margin-top: 4px;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
  animation: fadeIn 0.2s ease;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.cart-item-specs {
  font-size: 12px;
  color: var(--text3);
  margin-top: 3px;
}

.cart-item-right {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.cart-item-right .price {
  font-size: 15px;
  font-weight: 600;
}

.cart-item-qty {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.qty-btn:active {
  transform: scale(0.9);
}

.qty-btn.minus {
  background: var(--bg);
  color: var(--text2);
}

.qty-btn.plus {
  background: var(--primary);
  color: #fff;
}

.qty-num {
  font-size: 15px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
}

.cart-remark {
  margin-top: 14px;
}

.cart-remark input {
  width: 100%;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
  background: var(--bg);
  transition: border-color 0.2s;
}

.cart-remark input:focus {
  border-color: var(--primary);
  background: #fff;
}

.cart-clear {
  text-align: right;
  margin-top: 12px;
}

.cart-clear span {
  font-size: 13px;
  color: var(--text3);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.cart-clear span:active {
  color: var(--red);
}

.cart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.cart-total {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.total-label {
  font-size: 14px;
  color: var(--text2);
}

.cart-total .total {
  font-size: 22px;
  font-weight: 700;
}

.submit-btn {
  background: var(--primary) !important;
  border: none !important;
  padding: 0 32px;
  height: 42px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}
</style>
