<template>
  <div>
    <div class="page-header">
      <h2>套餐管理</h2>
      <el-button type="success" @click="openDialog()">+ 新增套餐</el-button>
    </div>

    <!-- 套餐列表 -->
    <el-table :data="combos" stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="套餐图片" width="100">
        <template #default="{ row }">
          <img v-if="row.image" :src="row.image" class="combo-image" />
          <div v-else class="combo-placeholder">🍱</div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="套餐名称" min-width="150" />
      <el-table-column label="包含菜品" min-width="200">
        <template #default="{ row }">
          <div v-for="item in row.items" :key="item.id" class="combo-item-text">
            {{ item.dishName }} x{{ item.quantity }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="价格" width="150">
        <template #default="{ row }">
          <div class="price-info">
            <span class="original-price">¥{{ row.originalPrice }}</span>
            <span class="combo-price">¥{{ row.comboPrice }}</span>
          </div>
          <div class="save-text">省¥{{ row.saveAmount }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="sales" label="销量" width="80" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button text size="small" type="primary" @click="openDialog(row)">编辑</el-button>
          <el-button text size="small" :type="row.status === 1 ? 'warning' : 'success'" @click="toggleStatus(row)">
            {{ row.status === 1 ? '下架' : '上架' }}
          </el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row)">
            <template #reference>
              <el-button text size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editingCombo ? '编辑套餐' : '新增套餐'" width="700">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="套餐名称" prop="name">
          <el-input v-model="form.name" placeholder="如：午市超值套餐" />
        </el-form-item>
        <el-form-item label="套餐描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="套餐包含的菜品描述" />
        </el-form-item>
        <el-form-item label="套餐图片">
          <el-upload
            class="combo-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            accept="image/*"
          >
            <img v-if="form.image" :src="form.image" class="combo-preview" />
            <div v-else class="upload-placeholder">
              <el-icon><Plus /></el-icon>
              <span>上传图片</span>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="套餐价" prop="comboPrice">
          <el-input-number v-model="form.comboPrice" :min="0" :precision="2" />
          <span style="margin-left: 10px; color: var(--text2); font-size: 12px">
            原价: ¥{{ calculatedOriginalPrice }}，省 ¥{{ calculatedSaveAmount }}
          </span>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>

        <el-divider>套餐包含菜品</el-divider>

        <div v-for="(item, index) in form.items" :key="index" class="combo-item-row">
          <el-select v-model="item.dishId" filterable placeholder="选择菜品" style="width: 250px" @change="onDishChange(index)">
            <el-option
              v-for="dish in allDishes"
              :key="dish.id"
              :label="dish.name + ' ¥' + dish.price"
              :value="dish.id"
            />
          </el-select>
          <el-input-number v-model="item.quantity" :min="1" :max="10" size="small" style="width: 100px" />
          <span class="item-price">¥{{ getItemPrice(item) }}</span>
          <el-button text type="danger" @click="form.items.splice(index, 1)">删除</el-button>
        </div>

        <el-button type="primary" text @click="addComboItem">+ 添加菜品</el-button>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCombo" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getCombos, createCombo, updateCombo, deleteCombo, updateComboStatus, getDishes } from '../api'

const combos = ref([])
const allDishes = ref([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editingCombo = ref(null)
const formRef = ref(null)

const form = ref({
  name: '',
  description: '',
  image: '',
  comboPrice: 0,
  sortOrder: 0,
  items: []
})

const rules = {
  name: [{ required: true, message: '请输入套餐名称', trigger: 'blur' }],
  comboPrice: [{ required: true, message: '请输入套餐价', trigger: 'blur' }]
}

const uploadUrl = computed(() => '/api/admin/upload')
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
})

// 计算原价
const calculatedOriginalPrice = computed(() => {
  let total = 0
  for (const item of form.value.items) {
    const dish = allDishes.value.find(d => d.id === item.dishId)
    if (dish) {
      total += dish.price * item.quantity
    }
  }
  return total.toFixed(2)
})

// 计算节省金额
const calculatedSaveAmount = computed(() => {
  const save = parseFloat(calculatedOriginalPrice.value) - form.value.comboPrice
  return save > 0 ? save.toFixed(2) : '0.00'
})

// 获取单项价格
const getItemPrice = (item) => {
  const dish = allDishes.value.find(d => d.id === item.dishId)
  return dish ? (dish.price * item.quantity).toFixed(2) : '0.00'
}

// 菜品选择变化
const onDishChange = (index) => {
  // 可以在这里做一些联动处理
}

// 添加套餐项
const addComboItem = () => {
  form.value.items.push({ dishId: null, quantity: 1 })
}

// 上传成功
const handleUploadSuccess = (response) => {
  if (response.code === 200 && response.data?.url) {
    form.value.image = response.data.url
  }
}

// 加载套餐列表
const loadCombos = async () => {
  loading.value = true
  try {
    combos.value = await getCombos()
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

// 加载所有菜品
const loadDishes = async () => {
  try {
    allDishes.value = await getDishes()
  } catch (e) {
    console.error(e)
  }
}

// 打开弹窗
const openDialog = (combo) => {
  if (combo) {
    editingCombo.value = combo
    form.value = {
      name: combo.name,
      description: combo.description,
      image: combo.image,
      comboPrice: combo.comboPrice,
      sortOrder: combo.sortOrder,
      items: combo.items ? combo.items.map(item => ({
        dishId: item.dishId,
        quantity: item.quantity
      })) : []
    }
  } else {
    editingCombo.value = null
    form.value = {
      name: '',
      description: '',
      image: '',
      comboPrice: 0,
      sortOrder: 0,
      items: []
    }
  }
  dialogVisible.value = true
}

// 保存套餐
const saveCombo = async () => {
  if (!formRef.value) return
  await formRef.value.validate()

  if (form.value.items.length === 0) {
    ElMessage.warning('请至少添加一个菜品')
    return
  }

  saving.value = true
  try {
    if (editingCombo.value) {
      await updateCombo(editingCombo.value.id, form.value)
      ElMessage.success('编辑成功')
    } else {
      await createCombo(form.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadCombos()
  } catch (e) {
    ElMessage.error(e.message)
  }
  saving.value = false
}

// 切换状态
const toggleStatus = async (combo) => {
  try {
    await updateComboStatus(combo.id, combo.status === 1 ? 0 : 1)
    ElMessage.success('操作成功')
    loadCombos()
  } catch (e) {
    ElMessage.error(e.message)
  }
}

// 删除
const handleDelete = async (combo) => {
  try {
    await deleteCombo(combo.id)
    ElMessage.success('删除成功')
    loadCombos()
  } catch (e) {
    ElMessage.error(e.message)
  }
}

onMounted(() => {
  loadCombos()
  loadDishes()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.combo-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.combo-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: #fef3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.combo-item-text {
  font-size: 12px;
  color: var(--text2);
  line-height: 1.6;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.original-price {
  font-size: 12px;
  color: var(--text3);
  text-decoration: line-through;
}

.combo-price {
  font-size: 16px;
  font-weight: 600;
  color: #ef4444;
}

.save-text {
  font-size: 11px;
  color: #10b981;
}

.combo-item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.item-price {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  min-width: 60px;
}

.combo-uploader {
  border: 1px dashed var(--border);
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.3s;
}

.combo-uploader:hover {
  border-color: var(--brand);
}

.combo-preview {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}

.upload-placeholder {
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text3);
}
</style>
