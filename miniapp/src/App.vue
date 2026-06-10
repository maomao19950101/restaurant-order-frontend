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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 6px 16px;
  color: #fff;
}
.collab-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.pulse-dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}
.collab-text { opacity: 0.95; }
.page-slide-enter-active { animation: slideIn 0.25s ease-out; }
.page-slide-leave-active { animation: slideOut 0.2s ease-in; }
@keyframes slideIn {
  from { transform: translateX(30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-30px); opacity: 0; }
}
</style>
