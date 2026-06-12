<template>
  <div>
    <div class="page-header">
      <h2>小票模板</h2>
      <el-button type="success" @click="openDialog()">新增模板</el-button>
    </div>

    <!-- 模板列表 -->
    <el-table :data="templates" stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="模板名称" />
      <el-table-column label="默认" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.isDefault === 1" type="success" size="small">默认</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button text size="small" type="primary" @click="openDialog(row)">编辑</el-button>
          <el-button text size="small" type="success" @click="previewTemplate(row)">预览</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row)">
            <template #reference>
              <el-button text size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingTemplate ? '编辑模板' : '新增模板'" width="700">
      <el-form :model="form" label-width="100px">
        <el-form-item label="模板名称" required>
          <el-input v-model="form.name" placeholder="如：默认小票、厨房小票" />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="模板内容">
          <el-input v-model="form.content" type="textarea" :rows="15" placeholder="支持变量：{{restaurantName}}, {{orderNo}}, {{tableNo}}, {{items}}, {{totalAmount}}, {{itemCount}}, {{createTime}}, {{remark}}" />
          <div style="margin-top: 8px; font-size: 12px; color: #909399">
            可用变量：{{restaurantName}} - 餐厅名, {{orderNo}} - 订单号, {{tableNo}} - 桌号, {{items}} - 菜品列表, {{totalAmount}} - 总金额, {{itemCount}} - 菜品数, {{createTime}} - 下单时间, {{remark}} - 备注
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTemplate">保存</el-button>
      </template>
    </el-dialog>

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewVisible" title="小票预览" width="400">
      <pre style="background: #f5f5f5; padding: 16px; border-radius: 8px; font-size: 12px; white-space: pre-wrap">{{ previewContent }}</pre>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getReceiptTemplates, saveReceiptTemplate, getOrders } from '../api'

const templates = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingTemplate = ref(null)
const previewVisible = ref(false)
const previewContent = ref('')
const form = ref({ name: '', content: '', isDefault: 0 })

const defaultTemplate = `================================
          {{restaurantName}}
================================

订单号: {{orderNo}}
桌号: {{tableNo}}号桌
时间: {{createTime}}
--------------------------------
{{items}}
--------------------------------
合计: ¥{{totalAmount}}
菜品数: {{itemCount}}件

备注: {{remark}}

================================
      感谢惠顾，欢迎再来！
================================`

const loadTemplates = async () => {
  loading.value = true
  try {
    templates.value = await getReceiptTemplates()
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

const openDialog = (template) => {
  if (template) {
    editingTemplate.value = template
    form.value = { name: template.name, content: template.content, isDefault: template.isDefault }
  } else {
    editingTemplate.value = null
    form.value = { name: '', content: defaultTemplate, isDefault: 0 }
  }
  dialogVisible.value = true
}

const saveTemplate = async () => {
  if (!form.value.name) {
    ElMessage.warning('请输入模板名称')
    return
  }
  if (!form.value.content) {
    ElMessage.warning('请输入模板内容')
    return
  }
  try {
    const data = { ...form.value }
    if (editingTemplate.value) {
      data.id = editingTemplate.value.id
    }
    await saveReceiptTemplate(data)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadTemplates()
  } catch (e) {
    ElMessage.error(e.message || '保存失败')
  }
}

const previewTemplate = async (template) => {
  // 使用示例数据预览
  let content = template.content
  content = content.replace(/\{\{restaurantName\}\}/g, '示例餐厅')
  content = content.replace(/\{\{orderNo\}\}/g, 'RO202401011200001234')
  content = content.replace(/\{\{tableNo\}\}/g, 'A1')
  content = content.replace(/\{\{createTime\}\}/g, '2024-01-01 12:00')
  content = content.replace(/\{\{totalAmount\}\}/g, '88.00')
  content = content.replace(/\{\{itemCount\}\}/g, '3')
  content = content.replace(/\{\{remark\}\}/g, '不要辣')
  content = content.replace(/\{\{items\}\}/g, '宫保鸡丁    x1   ¥38.00\n红烧肉      x1   ¥48.00\n米饭        x2   ¥6.00')
  previewContent.value = content
  previewVisible.value = true
}

const handleDelete = async (template) => {
  try {
    // TODO: 调用删除接口
    ElMessage.success('删除成功')
    loadTemplates()
  } catch (e) {
    ElMessage.error(e.message || '删除失败')
  }
}

onMounted(loadTemplates)
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
