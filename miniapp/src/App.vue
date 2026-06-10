<template>
  <div id="app-container">
    <div class="collab-bar" v-if="cart.isShared && cart.onlineMembers > 0">
      <div class="collab-indicator">
        <span class="pulse-dot"></span>
        <span class="collab-text">
          {{ cart.onlineMembers }}人正在点餐
          <template v-if="cart.lastAction && isRecentAction">
            · {{ actionText }}
          </template>
        </span>
      </div>
    </div>
    <router-view v-slot="{ Component }">
      <transition name="page-slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from './stores/cart'
import { getOpenid } from './utils/auth'
import { showToast } from 'vant'

const route = useRoute()
const cart = useCartStore()
const actionTime = ref(0)

const isRecentAction = computed(() => Date.now() - actionTime.value < 5000)

const actionText = computed(() => {
  const a = cart.lastAction
  if (!a) return ''
  switch (a.type) {
    case 'ADD': return `${a.memberName}加了${a.dishName}`
    case 'JOIN': return `${a.memberName}加入了`
    case 'ORDER_SUBMITTED': return `${a.memberName}提交了订单`
    default: return ''
  }
})

watch(() => cart.lastAction, (newVal) => {
  if (!newVal) return
  actionTime.value = Date.now()
  if (newVal.type === 'ADD' && newVal.memberId !== cart.memberId) {
    showToast(`${newVal.memberName} 加了 ${newVal.dishName}`)
  } else if (newVal.type === 'JOIN' && newVal.memberName) {
    showToast(`${newVal.memberName} 加入了点餐`)
  } else if (newVal.type === 'ORDER_SUBMITTED') {
    showToast(`订单已提交！`)
  }
}, { deep: true })

onMounted(async () => {
  getOpenid()
  const { tableId, restaurantId } = route.query
  if (tableId && restaurantId) {
    cart.restaurantId = Number(restaurantId)
    cart.tableId = Number(tableId)
    try {
      await cart.joinTableSession(Number(restaurantId), Number(tableId))
    } catch (e) {
      console.error('Auto join failed:', e)
    }
  }
})

onUnmounted(() => {
  cart.leaveSession()
})
</script>

<style>
#app-container {
  min-height: 100vh;
  background: var(--bg);
}
.collab-bar {
  position: sticky;
  top: 0;
  z-index: 200;
  background: linear-gradient(135deg, #5b6ef5 0%, #7c5cbf 100%);
  padding: 8px 16px;
  color: #fff;
  backdrop-filter: blur(8px);
}
.collab-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  letter-spacing: 0.01em;
}
.pulse-dot {
  width: 7px;
  height: 7px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  box-shadow: 0 0 0 2px rgba(74, 222, 128, 0.2);
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}
.collab-text { opacity: 0.92; font-weight: 500; }
.page-slide-enter-active { animation: slideIn 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.page-slide-leave-active { animation: slideOut 0.22s cubic-bezier(0.55, 0.085, 0.68, 0.53); }
@keyframes slideIn {
  from { transform: translateX(24px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-24px); opacity: 0; }
}
</style>
