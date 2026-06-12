<template>
  <div>
    <div class="page-header">
      <h2>桌台管理</h2>
      <div style="display: flex; gap: 10px">
        <el-button type="warning" @click="openMergeDialog">合并桌台</el-button>
        <el-button type="success" @click="openDialog()">新增桌台</el-button>
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :span="4" v-for="table in tables" :key="table.id">
        <el-card shadow="hover" style="margin-bottom: 16px; text-align: center; cursor: pointer" @click="openDialog(table)">
          <div style="margin-bottom: 8px">
            <span v-if="table.status === 0" class="status-dot available"></span>
            <span v-else-if="table.status === 1" class="status-dot occupied"></span>
            <span v-else class="status-dot cleaning"></span>
          </div>
          <div style="font-size: 18px; font-weight: 600">{{ table.tableNo }}</div>
          <div style="font-size: 12px; color: #909399">{{ table.seats }}人桌</div>
          <el-tag :type="tableStatusType(table.status)" size="small" style="margin-top: 8px">
            {{ tableStatusText(table.status) }}
          </el-tag>
          <div style="margin-top: 10px; display: flex; justify-content: center; gap: 6px; flex-wrap: wrap">
            <el-button v-if="table.status !== 0" text size="small" type="primary" @click.stop="handleReset(table)">重置</el-button>
            <el-button text size="small" type="success" @click.stop="showQR(table)">二维码</el-button>
            <el-popconfirm title="确定删除？" @confirm="handleDelete(table)">
              <template #reference>
                <el-button text size="small" type="danger" @click.stop>删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" :title="editingTable ? '编辑桌台' : '新增桌台'" width="400">
      <el-form :model="form" label-width="80px">
        <el-form-item label="桌号" required>
          <el-input v-model="form.tableNo" placeholder="如 A1、B2" />
        </el-form-item>
        <el-form-item label="座位数">
          <el-input-number v-model="form.seats" :min="1" :max="50" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTable">保存</el-button>
      </template>
    </el-dialog>

    <!-- QR Code Dialog -->
    <el-dialog v-model="qrDialogVisible" :title="'桌台 ' + qrTableNo + ' 二维码'" width="360">
      <div style="text-align: center">
        <img v-if="qrDataUrl" :src="qrDataUrl" style="width: 260px; height: 260px" />
        <p style="margin-top: 12px; color: #909399; font-size: 12px; word-break: break-all">{{ qrUrl }}</p>
      </div>
      <template #footer>
        <el-button @click="downloadQR">下载</el-button>
        <el-button type="primary" @click="printQR">打印</el-button>
      </template>
    </el-dialog>

    <!-- 合并桌台 Dialog -->
    <el-dialog v-model="mergeDialogVisible" title="合并桌台" width="500">
      <el-form label-width="80px">
        <el-form-item label="主桌台">
          <el-select v-model="mergeForm.primaryTableId" placeholder="选择主桌台" style="width: 100%">
            <el-option v-for="t in tables" :key="t.id" :label="t.tableNo + ' (' + t.seats + '人)'" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="合并桌台">
          <el-select v-model="mergeForm.mergedTableIds" multiple placeholder="选择要合并的桌台" style="width: 100%">
            <el-option v-for="t in tables.filter(t => t.id !== mergeForm.primaryTableId)" :key="t.id" :label="t.tableNo + ' (' + t.seats + '人)'" :value="t.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="mergeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleMerge">确认合并</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getTables, createTable, updateTable, deleteTable, resetTable, mergeTables } from '../api'
import QRCode from 'qrcode'

const tables = ref([])
const dialogVisible = ref(false)
const editingTable = ref(null)
const form = ref({ tableNo: '', seats: 4 })
const qrDialogVisible = ref(false)
const qrTableNo = ref('')

// 合并桌台
const mergeDialogVisible = ref(false)
const mergeForm = ref({ primaryTableId: null, mergedTableIds: [] })

const openMergeDialog = () => {
  mergeForm.value = { primaryTableId: null, mergedTableIds: [] }
  mergeDialogVisible.value = true
}

const handleMerge = async () => {
  if (!mergeForm.value.primaryTableId) {
    ElMessage.warning('请选择主桌台')
    return
  }
  if (mergeForm.value.mergedTableIds.length === 0) {
    ElMessage.warning('请选择要合并的桌台')
    return
  }
  try {
    await mergeTables(mergeForm.value)
    ElMessage.success('桌台合并成功')
    mergeDialogVisible.value = false
    loadTables()
  } catch (e) {
    ElMessage.error(e.message || '合并失败')
  }
}
const qrDataUrl = ref('')
const qrUrl = ref('')

const tableStatusText = (s) => ['空闲','用餐中','待清理'][s] || '未知'
const tableStatusType = (s) => ['success','warning','info'][s] || 'info'

const loadTables = async () => {
  try { tables.value = await getTables() } catch (e) { console.error(e) }
}

const openDialog = (table) => {
  if (table) {
    editingTable.value = table
    form.value = { tableNo: table.tableNo, seats: table.seats }
  } else {
    editingTable.value = null
    form.value = { tableNo: '', seats: 4 }
  }
  dialogVisible.value = true
}

const saveTable = async () => {
  if (!form.value.tableNo) { ElMessage.warning('请填写桌号'); return }
  try {
    if (editingTable.value) {
      await updateTable(editingTable.value.id, form.value)
      ElMessage.success('编辑成功')
    } else {
      await createTable(form.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadTables()
  } catch (e) { ElMessage.error(e.message) }
}

const handleReset = async (table) => {
  try { await resetTable(table.id); ElMessage.success('已重置'); loadTables() } catch (e) { ElMessage.error(e.message) }
}

const handleDelete = async (table) => {
  try { await deleteTable(table.id); ElMessage.success('删除成功'); loadTables() } catch (e) { ElMessage.error(e.message) }
}


const showQR = async (table) => {
  qrTableNo.value = table.tableNo
  const origin = window.location.origin
  // 使用正确的顾客端路径
  qrUrl.value = origin + '/customer/?restaurantId=1&tableId=' + table.id
  try {
    // 优先使用后端接口生成二维码
    const token = localStorage.getItem('admin_token')
    const response = await fetch(`/api/admin/table/${table.id}/qrcode/base64`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const result = await response.json()
    if (result.code === 200 && result.data?.base64) {
      qrDataUrl.value = result.data.base64
    } else {
      // 降级到前端生成
      qrDataUrl.value = await QRCode.toDataURL(qrUrl.value, { width: 260, margin: 2 })
    }
    qrDialogVisible.value = true
  } catch (e) {
    // 降级到前端生成
    try {
      qrDataUrl.value = await QRCode.toDataURL(qrUrl.value, { width: 260, margin: 2 })
      qrDialogVisible.value = true
    } catch (err) {
      ElMessage.error('生成二维码失败')
    }
  }
}

const downloadQR = () => {
  const a = document.createElement('a')
  a.href = qrDataUrl.value
  a.download = 'table-' + qrTableNo.value + '-qr.png'
  a.click()
}

const printQR = () => {
  const w = window.open('', '_blank')
  w.document.write('<html><body style="text-align:center"><img src="' + qrDataUrl.value + '" style="width:300px" /><p>' + qrUrl.value + '</p></body></html>')
  w.document.close()
  w.print()
}

onMounted(loadTables)
</script>

<style scoped>
/* Table cards */
.table-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}
.table-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  transition: border-color .2s, box-shadow .2s;
}
.table-card:hover {
  border-color: var(--brand);
  box-shadow: var(--shadow-sm);
}
.table-card-icon {
  font-size: 36px;
  margin-bottom: 8px;
}
.table-card-number {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}
.table-card-seats {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 2px;
}
.table-card-status {
  margin-top: 10px;
}
.table-card-actions {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

/* Status dots */
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.status-dot.available { background-color: #22c55e; }
.status-dot.occupied { background-color: #f97316; }
.status-dot.cleaning { background-color: #eab308; }

/* Status badge overrides for el-tag */
:deep(.el-tag) {
  border: none !important;
  border-radius: 999px !important;
  font-size: 12px;
  font-weight: 500;
}

/* Dialog form styling */
:deep(.el-dialog) {
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
:deep(.el-dialog__header) {
  border-bottom: 1px solid var(--border);
  padding: 16px 20px;
}
:deep(.el-dialog__body) {
  padding: 20px;
}
:deep(.el-dialog__footer) {
  padding: 12px 20px;
  border-top: 1px solid var(--border);
}

/* Form dialog footer buttons */
:deep(.el-button--primary) {
  --el-button-bg-color: var(--brand) !important;
  --el-button-border-color: var(--brand) !important;
  --el-button-hover-bg-color: var(--brand-hover) !important;
  --el-button-hover-border-color: var(--brand-hover) !important;
}

/* Card grid spacing */
:deep(.el-row) {
  margin-bottom: 0;
}
:deep(.el-col) {
  margin-bottom: 16px;
}

/* el-card overrides for table cards */
:deep(.el-card) {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: none;
  transition: border-color .2s, box-shadow .2s;
}
:deep(.el-card:hover) {
  border-color: var(--brand);
  box-shadow: var(--shadow-sm);
}
:deep(.el-card .el-card__body) {
  padding: 24px 16px;
}

/* Form inputs in dialog */
:deep(.el-form-item__label) {
  color: var(--text2);
  font-weight: 500;
}
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  background-color: var(--input-bg);
  box-shadow: 0 0 0 1px var(--border-strong) inset;
  border-radius: var(--radius-sm);
}
:deep(.el-input__wrapper:focus-within),
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 2px var(--brand) inset;
}
</style>
