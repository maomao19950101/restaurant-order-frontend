<template>
  <div class="page-container">
    <div class="section-card">
      <div class="section-header">
        <h3 class="section-title">管理员列表</h3>
        <div class="header-actions">
          <select v-model="filterRestaurantId" @change="load" class="filter-select">
            <option :value="null">全部餐厅</option>
            <option v-for="r in restaurants" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>
          <button class="btn btn-primary" @click="showDialog()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            新增管理员
          </button>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th width="60">ID</th>
              <th>用户名</th>
              <th>所属餐厅</th>
              <th width="100">角色</th>
              <th width="80">状态</th>
              <th width="180">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in admins" :key="row.id">
              <td class="td-id">{{ row.id }}</td>
              <td class="td-name">{{ row.username }}</td>
              <td>{{ row.restaurantName || '-' }}</td>
              <td>
                <span class="badge badge-blue">
                  {{ row.role === 'admin' ? '管理员' : row.role === 'manager' ? '经理' : row.role === 'kitchen' ? '厨房' : row.role }}
                </span>
              </td>
              <td>
                <span class="badge" :class="row.status === 1 ? 'badge-green' : 'badge-red'">
                  {{ row.status === 1 ? '正常' : '禁用' }}
                </span>
              </td>
              <td>
                <div class="action-group">
                  <button class="btn btn-sm btn-ghost" @click="showDialog(row)">编辑</button>
                  <button class="btn btn-sm btn-danger" @click="handleDelete(row)">删除</button>
                </div>
              </td>
            </tr>
            <tr v-if="!admins.length">
              <td colspan="6" class="td-empty">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Dialog -->
    <div class="modal-overlay" v-if="dialogVisible" @click.self="dialogVisible = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ editingId ? '编辑管理员' : '新增管理员' }}</h3>
          <button class="modal-close" @click="dialogVisible = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>所属餐厅 <span class="required">*</span></label>
            <select v-model="form.restaurantId" class="form-input">
              <option :value="null" disabled>请选择餐厅</option>
              <option v-for="r in restaurants" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>用户名 <span class="required">*</span></label>
            <input v-model="form.username" placeholder="请输入用户名" class="form-input" :disabled="!!editingId" />
          </div>
          <div class="form-group">
            <label>密码 <span class="required" v-if="!editingId">*</span></label>
            <input v-model="form.password" placeholder="请输入密码" type="password" class="form-input" />
            <div v-if="editingId" style="font-size: 12px; color: var(--text2); margin-top: 4px;">留空则不修改密码</div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>角色</label>
              <select v-model="form.role" class="form-input">
                <option value="admin">管理员</option>
                <option value="manager">经理</option>
                <option value="kitchen">厨房</option>
              </select>
            </div>
            <div class="form-group">
              <label>状态</label>
              <div class="toggle-row">
                <button class="toggle-btn" :class="{ active: form.status === 1 }" @click="form.status = 1">正常</button>
                <button class="toggle-btn" :class="{ active: form.status === 0 }" @click="form.status = 0">禁用</button>
              </div>
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
import { getRestaurants, getAdmins, createAdmin, updateAdmin, deleteAdmin } from '../api'

const restaurants = ref([])
const admins = ref([])
const filterRestaurantId = ref(null)
const dialogVisible = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const form = ref({ restaurantId: null, username: '', password: '', role: 'admin', status: 1 })

const loadRestaurants = async () => {
  restaurants.value = await getRestaurants()
}

const load = async () => {
  admins.value = await getAdmins(filterRestaurantId.value)
}

const showDialog = (row) => {
  if (row) {
    editingId.value = row.id
    form.value = { ...row, password: '' }
  } else {
    editingId.value = null
    form.value = { restaurantId: null, username: '', password: '', role: 'admin', status: 1 }
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.value.restaurantId) return ElMessage.warning('请选择餐厅')
  if (!form.value.username) return ElMessage.warning('请输入用户名')
  if (!editingId.value && !form.value.password) return ElMessage.warning('请输入密码')

  submitting.value = true
  try {
    if (editingId.value) {
      await updateAdmin(editingId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await createAdmin(form.value)
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
  await ElMessageBox.confirm(`确定删除管理员「${row.username}」？`, '提示', { type: 'warning' })
  try {
    await deleteAdmin(row.id)
    ElMessage.success('删除成功')
    load()
  } catch (e) {
    ElMessage.error(e.message)
  }
}

onMounted(() => {
  loadRestaurants()
  load()
})
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
  flex-wrap: wrap;
  gap: 12px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Filter select */
.filter-select {
  padding: 8px 14px;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 13px;
  outline: none;
  cursor: pointer;
  min-width: 160px;
}
.filter-select:focus { border-color: var(--brand); }
.filter-select option {
  background: var(--surface);
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
  background: var(--surface-subtle);
  color: var(--text);
}
.btn:hover { border-color: var(--brand); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary {
  background: var(--brand);
  border-color: var(--brand);
  color: #fff;
}
.btn-primary:hover {
  background: var(--brand-hover);
  border-color: var(--brand-hover);
  box-shadow: 0 4px 12px rgba(99,102,241,0.3);
}
.btn-sm { padding: 6px 14px; font-size: 13px; }
.btn-ghost { background: transparent; }
.btn-ghost:hover { background: var(--surface-hover); }
.btn-danger {
  background: transparent;
  border-color: var(--danger);
  color: var(--danger);
}
.btn-danger:hover {
  background: var(--danger);
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
  background: var(--surface-subtle);
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
  background: var(--surface-subtle);
}
.data-table tbody tr:hover {
  background: var(--surface-hover);
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
  background: var(--success-bg);
  color: var(--success);
}
.badge-red {
  background: var(--danger-bg);
  color: var(--danger);
}
.badge-blue {
  background: var(--brand-subtle);
  color: var(--brand);
}

/* Action group */
.action-group { display: flex; gap: 8px; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}
[data-theme="dark"] .modal-overlay {
  background: rgba(0,0,0,0.6);
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
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  animation: slideUp 0.3s ease;
}
[data-theme="dark"] .modal-card {
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
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
  background: var(--surface-hover);
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
.required { color: var(--danger); }
.form-input {
  width: 100%;
  padding: 10px 14px;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.form-input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
}
.form-input::placeholder { color: var(--text-tertiary); }
.form-input:disabled { opacity: 0.5; cursor: not-allowed; }
select.form-input { cursor: pointer; }
select.form-input option {
  background: var(--surface);
  color: var(--text);
}
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
  background: var(--surface-subtle);
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.toggle-btn.active {
  background: var(--brand);
  border-color: var(--brand);
  color: #fff;
}
.toggle-btn:hover:not(.active) {
  border-color: var(--brand);
}
</style>
