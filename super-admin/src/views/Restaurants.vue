<template>
  <div class="page-container">
    <div class="section-card">
      <div class="section-header">
        <h3 class="section-title">餐厅列表</h3>
        <button class="btn btn-primary" @click="showDialog()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新增餐厅
        </button>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th width="60">ID</th>
              <th>餐厅名称</th>
              <th>地址</th>
              <th>电话</th>
              <th>营业时间</th>
              <th width="80">状态</th>
              <th width="180">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in restaurants" :key="row.id">
              <td class="td-id">{{ row.id }}</td>
              <td class="td-name">{{ row.name }}</td>
              <td>{{ row.address || '-' }}</td>
              <td>{{ row.phone || '-' }}</td>
              <td>{{ row.businessHours || '-' }}</td>
              <td>
                <span class="badge" :class="row.status === 1 ? 'badge-green' : 'badge-red'">
                  {{ row.status === 1 ? '营业中' : '歇业' }}
                </span>
              </td>
              <td>
                <div class="action-group">
                  <button class="btn btn-sm btn-ghost" @click="showDialog(row)">编辑</button>
                  <button class="btn btn-sm btn-danger" @click="handleDelete(row)">删除</button>
                </div>
              </td>
            </tr>
            <tr v-if="!restaurants.length">
              <td colspan="7" class="td-empty">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Dialog -->
    <div class="modal-overlay" v-if="dialogVisible" @click.self="dialogVisible = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ editingId ? '编辑餐厅' : '新增餐厅' }}</h3>
          <button class="modal-close" @click="dialogVisible = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>餐厅名称 <span class="required">*</span></label>
            <input v-model="form.name" placeholder="请输入餐厅名称" class="form-input" />
          </div>
          <div class="form-group">
            <label>地址</label>
            <input v-model="form.address" placeholder="请输入地址" class="form-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>电话</label>
              <input v-model="form.phone" placeholder="请输入电话" class="form-input" />
            </div>
            <div class="form-group">
              <label>营业时间</label>
              <input v-model="form.businessHours" placeholder="如: 10:00-22:00" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>状态</label>
            <div class="toggle-row">
              <button class="toggle-btn" :class="{ active: form.status === 1 }" @click="form.status = 1">营业</button>
              <button class="toggle-btn" :class="{ active: form.status === 0 }" @click="form.status = 0">歇业</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="dialogVisible = false">取消</button>
          <button class="btn btn-primary" @click="handleSubmit" :disabled="submitting">
            {{ submitting ? '提交中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant } from '../api'

const restaurants = ref([])
const dialogVisible = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const form = ref({ name: '', address: '', phone: '', businessHours: '', status: 1 })

const load = async () => {
  restaurants.value = await getRestaurants()
}

const showDialog = (row) => {
  if (row) {
    editingId.value = row.id
    form.value = { ...row }
  } else {
    editingId.value = null
    form.value = { name: '', address: '', phone: '', businessHours: '', status: 1 }
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.value.name) return ElMessage.warning('请输入餐厅名称')
  submitting.value = true
  try {
    if (editingId.value) {
      await updateRestaurant(editingId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await createRestaurant(form.value)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    load()
  } catch (e) {
    ElMessage.error(e.message)
  }
  submitting.value = false
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确定删除餐厅「${row.name}」？`, '提示', { type: 'warning' })
  try {
    await deleteRestaurant(row.id)
    ElMessage.success('删除成功')
    load()
  } catch (e) {
    ElMessage.error(e.message)
  }
}

onMounted(load)
</script>

<style scoped>
.page-container { display: flex; flex-direction: column; gap: 24px; }

.section-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--surface2);
  color: var(--text);
}
.btn:hover { border-color: var(--accent); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.btn-primary:hover {
  background: #2563eb;
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(59,130,246,0.3);
}
.btn-sm { padding: 6px 14px; font-size: 13px; }
.btn-ghost { background: transparent; }
.btn-ghost:hover { background: var(--surface2); }
.btn-danger {
  background: transparent;
  border-color: var(--red);
  color: var(--red);
}
.btn-danger:hover {
  background: var(--red);
  color: #fff;
}

/* Table */
.table-wrapper { overflow-x: auto; }
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.data-table th {
  text-align: left;
  padding: 12px 16px;
  background: var(--surface2);
  color: var(--text2);
  font-weight: 500;
  font-size: 13px;
  border-bottom: 1px solid var(--border);
}
.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text);
}
.data-table tbody tr:nth-child(even) {
  background: rgba(39,53,72,0.3);
}
.data-table tbody tr:hover {
  background: var(--surface2);
}
.td-id { color: var(--text2); font-size: 13px; }
.td-name { font-weight: 600; }
.td-empty {
  text-align: center;
  color: var(--text2);
  padding: 40px 16px !important;
}

/* Badge */
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}
.badge-green {
  background: rgba(34,197,94,0.15);
  color: var(--green);
}
.badge-red {
  background: rgba(239,68,68,0.15);
  color: var(--red);
}

/* Action group */
.action-group { display: flex; gap: 8px; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.modal-card {
  width: 480px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  animation: slideUp 0.3s ease;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}
.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}
.modal-close {
  background: none;
  border: none;
  color: var(--text2);
  font-size: 22px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}
.modal-close:hover {
  background: var(--surface2);
  color: var(--text);
}
.modal-body { padding: 24px; }
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Form */
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text2);
  margin-bottom: 6px;
}
.required { color: var(--red); }
.form-input {
  width: 100%;
  padding: 10px 14px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
}
.form-input::placeholder { color: var(--text2); }
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Toggle */
.toggle-row { display: flex; gap: 8px; }
.toggle-btn {
  padding: 8px 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface2);
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.toggle-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.toggle-btn:hover:not(.active) {
  border-color: var(--accent);
}
</style>
