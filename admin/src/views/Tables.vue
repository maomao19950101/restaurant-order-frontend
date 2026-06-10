<template>
  <div>
    <div class="page-header">
      <h2>桌台管理</h2>
      <el-button type="success" @click="openDialog()">新增桌台</el-button>
    </div>

    <el-row :gutter="16">
      <el-col :span="4" v-for="table in tables" :key="table.id">
        <el-card shadow="hover" style="margin-bottom: 16px; text-align: center; cursor: pointer" @click="openDialog(table)">
          <div style="font-size: 36px; margin-bottom: 8px">
            {{ table.status === 0 ? '🪑' : table.status === 1 ? '🍽️' : '🧹' }}
          </div>
          <div style="font-size: 18px; font-weight: 600">{{ table.tableNo }}</div>
          <div style="font-size: 12px; color: #909399">{{ table.seats }}人桌</div>
          <el-tag :type="tableStatusType(table.status)" size="small" style="margin-top: 8px">
            {{ tableStatusText(table.status) }}
          </el-tag>
          <div style="margin-top: 10px">
            <el-button v-if="table.status !== 0" text size="small" type="primary" @click.stop="handleReset(table)">重置</el-button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getTables, createTable, updateTable, deleteTable, resetTable } from '../api'

const tables = ref([])
const dialogVisible = ref(false)
const editingTable = ref(null)
const form = ref({ tableNo: '', seats: 4 })

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

onMounted(loadTables)
</script>
