<template>
  <div class="table-page">
    <div class="table-header">
      <div class="table-title">选择桌台</div>
      <div class="table-sub">请扫描桌台二维码或手动选择</div>
    </div>

    <div class="table-grid">
      <div
        v-for="t in tables"
        :key="t.id"
        class="table-item"
        :class="{ active: selectedTable === t.id }"
        @click="selectTable(t.id)"
      >
        <div class="table-num">{{ t.id }}</div>
        <div class="table-label">{{ t.name || '桌' }}</div>
      </div>
    </div>

    <div class="table-footer">
      <van-button
        type="primary"
        round
        block
        :disabled="!selectedTable"
        class="confirm-btn"
        @click="confirmTable"
      >
        确认选择
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const route = useRoute()
const cart = useCartStore()

const selectedTable = ref(null)
const tables = ref(
  Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `${i + 1}号桌`,
  }))
)

function selectTable(id) {
  selectedTable.value = id
}

function confirmTable() {
  if (!selectedTable.value) return
  cart.tableId = selectedTable.value
  const restaurantId = route.query.restaurantId || 1
  cart.restaurantId = Number(restaurantId)
  router.replace({
    path: '/menu',
    query: { restaurantId: cart.restaurantId, tableId: selectedTable.value },
  })
}
</script>

<style scoped>
.table-page {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
}

.table-header {
  text-align: center;
  padding: 48px 16px 28px;
}

.table-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
}

.table-sub {
  font-size: 14px;
  color: var(--text3);
  margin-top: 8px;
  font-weight: 400;
}

.table-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 0 16px;
  flex: 1;
}

.table-item {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 18px 0;
  text-align: center;
  cursor: pointer;
  border: 2px solid var(--border);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.table-item:active {
  transform: scale(0.96);
}

.table-item.active {
  border-color: var(--primary);
  background: var(--primary-light);
  box-shadow: 0 2px 12px rgba(255, 107, 53, 0.12);
}

.table-num {
  font-size: 22px;
  font-weight: 700;
  color: var(--text2);
  font-variant-numeric: tabular-nums;
  transition: color 0.25s ease;
}

.table-item.active .table-num {
  color: var(--primary);
}

.table-label {
  font-size: 12px;
  color: var(--text3);
  margin-top: 4px;
  font-weight: 400;
}

.table-footer {
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0));
}

.confirm-btn {
  background: var(--primary) !important;
  border: none !important;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(255, 107, 53, 0.3);
  border-radius: 24px !important;
  letter-spacing: -0.01em;
}

.confirm-btn:disabled {
  opacity: 0.5;
}
</style>
