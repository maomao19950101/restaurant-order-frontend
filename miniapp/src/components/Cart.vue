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
            <div class="empty-icon">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="14" cy="30" r="2"/><circle cx="26" cy="30" r="2"/><path d="M4 4h4l4 20h18l3-14H10"/></svg>
            </div>
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
        <!-- 凑单提示 -->
        <div v-if="cartTips.minOrderTip && cartTips.amountToMinOrder > 0" class="cart-tip min-order-tip">
          <van-icon name="info-o" size="14" />
          <span>{{ cartTips.minOrderTip }}</span>
        </div>
        <div v-if="cartTips.reductionTip" class="cart-tip reduction-tip">
          <van-icon name="gift-o" size="14" />
          <span>{{ cartTips.reductionTip }}</span>
        </div>
        <div v-if="cartTips.currentDiscountTip" class="cart-tip discount-tip">
          <van-icon name="coupon-o" size="14" />
          <span>{{ cartTips.currentDiscountTip }}</span>
        </div>

        <!-- Remark -->
        <div class="cart-remark" v-if="cart.items.length > 0">
          <input v-model="cart.remark" placeholder="订单备注（选填）" />
          <!-- 常用备注 -->
          <div class="remark-tags" v-if="commonRemarks.length > 0">
            <div
              v-for="remark in commonRemarks.slice(0, 8)"
              :key="remark.id"
              class="remark-tag"
              @click="selectRemark(remark.content)"
            >
              {{ remark.content }}
            </div>
          </div>
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
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { getCartTips, getCommonRemarks } from '../api'

const cart = useCartStore()
const router = useRouter()

// 凑单提示
const cartTips = ref({})
const commonRemarks = ref([])
const showRemarks = ref(false)

// 加载凑单提示
const loadCartTips = async () => {
  if (cart.totalPrice <= 0) {
    cartTips.value = {}
    return
  }
  try {
    const res = await getCartTips(cart.restaurantId, cart.totalPrice)
    if (res.code === 200) {
      cartTips.value = res.data || {}
    }
  } catch (e) {
    console.error('加载凑单提示失败:', e)
  }
}

// 加载常用备注
const loadCommonRemarks = async () => {
  try {
    const res = await getCommonRemarks(cart.restaurantId)
    if (res.code === 200) {
      commonRemarks.value = res.data || []
    }
  } catch (e) {
    console.error('加载常用备注失败:', e)
  }
}

// 监听购物车金额变化
watch(() => cart.totalPrice, () => {
  loadCartTips()
})

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

// 选择常用备注
function selectRemark(remark) {
  if (cart.remark) {
    cart.remark += '，' + remark
  } else {
    cart.remark = remark
  }
}

// 初始化加载
loadCommonRemarks()
loadCartTips()
</script>

<style scoped>
.cart-wrapper {
  position: fixed;
  bottom: 52px;
  left: 0;
  right: 0;
  z-index: 200;
  padding: 0 14px;
}

/* Cart bar */
.cart-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1e2028;
  border-radius: 26px;
  padding: 8px 8px 8px 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.06);
  animation: slideUp 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
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
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #2d303a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cart-icon-wrap.has-items .cart-icon {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 4px 14px rgba(255, 107, 53, 0.35);
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
  animation: bounceIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 1px 4px rgba(220, 38, 38, 0.3);
}

.cart-info {
  display: flex;
  align-items: center;
}

.cart-price .total-price {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.cart-empty {
  color: #6b7280;
  font-size: 13px;
  font-weight: 400;
}

.checkout-btn {
  background: #3a3d47 !important;
  border: none !important;
  color: #9ca3af !important;
  padding: 0 20px;
  height: 38px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 19px !important;
}

.checkout-btn:not(:disabled) {
  background: var(--primary) !important;
  color: #fff !important;
  box-shadow: 0 2px 10px rgba(255, 107, 53, 0.3);
}

/* Cart detail */
.cart-detail {
  padding: 12px 16px 16px;
}

.cart-items {
  max-height: 50vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.cart-items::-webkit-scrollbar {
  display: none;
}

.empty-tip {
  text-align: center;
  padding: 48px 0 36px;
}

.empty-icon {
  font-size: 44px;
  margin-bottom: 14px;
  opacity: 0.7;
}

.empty-text {
  font-size: 15px;
  color: var(--text2);
  font-weight: 500;
}

.empty-sub {
  font-size: 13px;
  color: var(--text3);
  margin-top: 6px;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
  animation: fadeIn 0.25s ease;
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
  line-height: 1.3;
}

.cart-item-specs {
  font-size: 12px;
  color: var(--text3);
  margin-top: 3px;
  line-height: 1.4;
}

.cart-item-right {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.cart-item-right .price {
  font-size: 15px;
  font-weight: 700;
}

.cart-item-qty {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.qty-btn:active {
  transform: scale(0.88);
}

.qty-btn.minus {
  background: var(--bg);
  color: var(--text2);
  border: 1px solid var(--border);
}

.qty-btn.plus {
  background: var(--primary);
  color: #fff;
  box-shadow: 0 2px 6px rgba(255, 107, 53, 0.25);
}

.qty-num {
  font-size: 15px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.cart-remark {
  margin-top: 14px;
}

.cart-remark input {
  width: 100%;
  border: 1.5px solid var(--border-strong);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
  background: var(--bg);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.cart-remark input:focus {
  border-color: var(--primary);
  background: #fff;
}

.remark-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.remark-tag {
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid var(--border);
  font-size: 12px;
  color: var(--text2);
  cursor: pointer;
  transition: all 0.2s;
}

.remark-tag:active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

/* 凑单提示 */
.cart-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
}

.min-order-tip {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.reduction-tip {
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.discount-tip {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
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
  transition: color 0.2s ease;
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
  font-weight: 500;
}

.cart-total .total {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.submit-btn {
  background: var(--primary) !important;
  border: none !important;
  padding: 0 32px;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(255, 107, 53, 0.3);
  border-radius: 22px !important;
}
</style>
