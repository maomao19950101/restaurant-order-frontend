<template>
  <div>
    <div class="page-header">
      <h2>订单管理</h2>
      <button class="refresh-btn" @click="loadOrders">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
      </button>
    </div>

    <!-- Status filter tabs -->
    <div class="filter-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab-item', { active: statusFilter === tab.value }]"
        @click="statusFilter = tab.value; page = 1; loadOrders()"
      >
        <span class="tab-dot" :style="{ background: tab.color }"></span>
        {{ tab.label }}
        <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Order table -->
    <div class="card">
      <el-table :data="orders" v-loading="loading" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="totalAmount" label="金额" width="100">
          <template #default="{ row }">
            <span style="color: var(--green); font-weight: 700">¥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <span :class="['status-badge', statusClass(row.status)]">{{ statusText(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="itemCount" label="菜品" width="70" />
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="下单时间" width="170" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <template v-if="row.status === 0">
                <button class="btn btn-primary" @click="handleAccept(row)">接单</button>
                <button class="btn btn-danger" @click="handleCancel(row)">取消</button>
              </template>
              <template v-else-if="row.status === 1">
                <button class="btn btn-warning" @click="handleCooking(row)">开始制作</button>
                <button class="btn btn-success" @click="handleComplete(row)">出餐</button>
              </template>
              <template v-else-if="row.status === 2">
                <button class="btn btn-success" @click="handleComplete(row)">出餐</button>
              </template>
              <template v-else-if="row.status === 3">
                <button class="btn btn-info" @click="handleFinish(row)">完成</button>
              </template>
              <button class="btn btn-ghost" @click="showDetail(row)">详情</button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          :page-size="20"
          :total="total"
          layout="prev, pager, next"
          @current-change="loadOrders"
        />
      </div>
    </div>

    <!-- Order detail dialog -->
    <el-dialog v-model="detailVisible" title="订单详情" width="640" class="detail-dialog">
      <div v-if="currentOrder" class="detail-content">
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">订单号</span>
            <span class="detail-value">{{ currentOrder.order?.orderNo }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">桌号</span>
            <span class="detail-value">{{ currentOrder.table?.tableNo || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">总金额</span>
            <span class="detail-value" style="color: var(--green); font-weight: 700; font-size: 18px">¥{{ currentOrder.order?.totalAmount }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">状态</span>
            <span :class="['status-badge', statusClass(currentOrder.order?.status)]">{{ statusText(currentOrder.order?.status) }}</span>
          </div>
          <div class="detail-item full">
            <span class="detail-label">备注</span>
            <span class="detail-value">{{ currentOrder.order?.remark || '无' }}</span>
          </div>
        </div>
        <div class="detail-divider"></div>
        <div class="detail-subtitle">菜品明细</div>
        <el-table :data="currentOrder?.items || []" style="width: 100%">
          <el-table-column prop="dishName" label="菜品" min-width="120" />
          <el-table-column prop="spec" label="规格" width="100" />
          <el-table-column prop="price" label="单价" width="80">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="60" />
          <el-table-column prop="subtotal" label="小计" width="80">
            <template #default="{ row }">
              <span style="color: var(--green); font-weight: 600">¥{{ row.subtotal }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { getOrders, getOrderDetail, acceptOrder, cookingOrder, completeOrder, finishOrder, cancelOrder } from '../api'

const orders = ref([])
const loading = ref(false)
const statusFilter = ref('')
const page = ref(1)
const total = ref(0)
const detailVisible = ref(false)
const currentOrder = ref(null)

const statusText = (s) => ['待接单','已接单','制作中','已出餐','已完成','已取消'][s] || '未知'
const statusClass = (s) => ['pending','accepted','cooking','ready','done','cancelled'][s] || ''

const tabs = [
  { label: '全部', value: '', color: 'var(--text2)' },
  { label: '待接单', value: 0, color: 'var(--yellow)' },
  { label: '已接单', value: 1, color: 'var(--accent)' },
  { label: '制作中', value: 2, color: '#f97316' },
  { label: '已出餐', value: 3, color: 'var(--green)' },
  { label: '已完成', value: 4, color: 'var(--text2)' },
]

const loadOrders = async () => {
  loading.value = true
  try {
    const res = await getOrders({ status: statusFilter.value === '' ? undefined : statusFilter.value, page: page.value, size: 20 })
    orders.value = res.records
    total.value = res.total
  } catch (e) { ElMessage.error(e.message) }
  loading.value = false
}

const handleAccept = async (row) => {
  try { await acceptOrder(row.id); ElMessage.success('已接单'); loadOrders() } catch (e) { ElMessage.error(e.message) }
}
const handleCooking = async (row) => {
  try { await cookingOrder(row.id); ElMessage.success('已开始制作'); loadOrders() } catch (e) { ElMessage.error(e.message) }
}
const handleComplete = async (row) => {
  try { await completeOrder(row.id); ElMessage.success('已出餐'); loadOrders() } catch (e) { ElMessage.error(e.message) }
}
const handleFinish = async (row) => {
  try { await finishOrder(row.id); ElMessage.success('已完成'); loadOrders() } catch (e) { ElMessage.error(e.message) }
}
const handleCancel = async (row) => {
  try {
    await ElMessageBox.confirm('确定取消该订单？', '提示', { type: 'warning' })
    await cancelOrder(row.id); ElMessage.success('已取消'); loadOrders()
  } catch (e) { if (e !== 'cancel') ElMessage.error(e.message) }
}
const showDetail = async (row) => {
  try { currentOrder.value = await getOrderDetail(row.id); detailVisible.value = true } catch (e) { ElMessage.error(e.message) }
}

const handleNewOrder = () => {
  loadOrders()
  ElNotification({ title: '新订单', message: '订单列表已自动刷新', type: 'success', duration: 2000 })
}

onMounted(() => { loadOrders(); window.addEventListener('new-order', handleNewOrder) })
onUnmounted(() => { window.removeEventListener('new-order', handleNewOrder) })
</script>

<style scoped>
.refresh-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text2);
  width: 32px; height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.refresh-btn:hover { border-color: var(--brand); color: var(--brand); }

/* Filter tabs */
.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all .2s;
}
.tab-item:hover { border-color: var(--brand); color: var(--text); }
.tab-item.active {
  background: var(--brand-subtle);
  border-color: var(--brand);
  color: var(--brand);
}
.tab-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.tab-count {
  background: var(--surface2);
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 11px;
}

/* Card */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.pagination-wrap {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border);
}

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.status-badge.pending { background: var(--warning-bg); color: var(--warning); }
.status-badge.accepted { background: var(--info-bg); color: var(--info); }
.status-badge.cooking { background: rgba(249,115,22,.08); color: #f97316; }
.status-badge.ready { background: var(--success-bg); color: var(--success); }
.status-badge.done { background: var(--surface-subtle); color: var(--text2); }
.status-badge.cancelled { background: var(--danger-bg); color: var(--danger); }

/* Action buttons */
.action-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.btn {
  padding: 4px 12px;
  border-radius: 6px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all .2s;
}
.btn-primary { background: var(--brand); color: #fff; border-color: var(--brand); }
.btn-primary:hover { background: var(--brand-hover); border-color: var(--brand-hover); }
.btn-success { background: var(--success); color: #fff; }
.btn-success:hover { opacity: .9; }
.btn-warning { background: var(--warning); color: #fff; }
.btn-warning:hover { opacity: .9; }
.btn-danger { background: var(--danger); color: #fff; }
.btn-danger:hover { opacity: .9; }
.btn-info { background: var(--surface); color: var(--text); border: 1px solid var(--border-strong); }
.btn-info:hover { border-color: var(--brand); color: var(--brand); }
.btn-ghost {
  background: transparent;
  color: var(--text2);
  border: 1px solid var(--border);
}
.btn-ghost:hover { background: var(--surface-hover); border-color: var(--brand); color: var(--brand); }

/* Detail dialog */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-item.full { grid-column: 1 / -1; }
.detail-label { font-size: 12px; color: var(--text2); }
.detail-value { font-size: 14px; color: var(--text); font-weight: 500; }
.detail-divider {
  height: 1px;
  background: var(--border);
  margin: 20px 0;
}
.detail-subtitle {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
}
</style>
