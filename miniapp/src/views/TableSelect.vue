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
  padding: 40px 16px 24px;
}
.table-title {
  font-size: 22px;
  font-weight: 700;
}
.table-sub {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 8px;
}
.table-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 0 16px;
  flex: 1;
}
.table-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px 0;
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}
.table-item.active {
  border-color: var(--primary);
  background: var(--primary-light);
}
.table-num {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}
.table-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}
.table-footer {
  padding: 16px;
}
.confirm-btn {
  background: var(--primary) !important;
  border: none !important;
}
</style>
