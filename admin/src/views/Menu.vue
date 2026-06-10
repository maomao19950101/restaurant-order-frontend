<template>
  <div>
    <div class="page-header">
      <h2>菜品管理</h2>
      <div class="header-actions">
        <button class="btn btn-outline" @click="openCategoryDialog">管理分类</button>
        <button class="btn btn-primary" @click="openDishDialog()">+ 新增菜品</button>
      </div>
    </div>

    <!-- Category tabs -->
    <div class="category-tabs">
      <button
        :class="['cat-tab', { active: selectedCat === null }]"
        @click="selectCategory(null)"
      >全部菜品</button>
      <button
        v-for="cat in categories"
        :key="cat.id"
        :class="['cat-tab', { active: selectedCat === cat.id }]"
        @click="selectCategory(cat.id)"
      >{{ cat.name }}</button>
    </div>

    <!-- Dish cards grid -->
    <div class="dish-grid" v-loading="loading">
      <div v-for="dish in dishes" :key="dish.id" class="dish-card">
        <div class="dish-image">
          <img v-if="dish.imageUrl" :src="dish.imageUrl" :alt="dish.name" />
          <div v-else class="dish-placeholder">{{ dish.name ? dish.name[0] : '' }}</div>
          <span :class="['dish-status', dish.status === 1 ? 'on' : 'off']">
            {{ dish.status === 1 ? '上架' : '下架' }}
          </span>
        </div>
        <div class="dish-body">
          <div class="dish-name">{{ dish.name }}</div>
          <div class="dish-meta">
            <span class="dish-price">¥{{ dish.price }}</span>
            <span class="dish-sales">销量 {{ dish.sales || 0 }}</span>
          </div>
          <div class="dish-stock">
            库存: {{ dish.stock === -1 ? '不限' : dish.stock }}
          </div>
          <div class="dish-actions">
            <button class="btn btn-ghost btn-sm" @click="openDishDialog(dish)">编辑</button>
            <button
              :class="['btn btn-sm', dish.status === 1 ? 'btn-warning' : 'btn-success']"
              @click="handleToggle(dish)"
            >{{ dish.status === 1 ? '下架' : '上架' }}</button>
            <el-popconfirm title="确定删除该菜品？" @confirm="handleDelete(dish)">
              <template #reference>
                <button class="btn btn-danger btn-sm">删除</button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>
      <div v-if="!loading && dishes.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <ellipse cx="24" cy="28" rx="16" ry="6"/>
            <path d="M8 28c0 0 0 10 16 10s16-10 16-10"/>
            <path d="M18 18c0-4 2-8 6-8s6 4 6 8"/>
            <line x1="20" y1="14" x2="20" y2="22"/><line x1="24" y1="12" x2="24" y2="22"/><line x1="28" y1="14" x2="28" y2="22"/>
          </svg>
        </div>
        <div class="empty-text">暂无菜品</div>
      </div>
    </div>

    <!-- Dish edit dialog -->
    <el-dialog v-model="dishDialogVisible" :title="editingDish ? '编辑菜品' : '新增菜品'" width="600" class="dish-dialog">
      <el-form :model="dishForm" label-width="80px">
        <el-form-item label="菜品名称" required>
          <el-input v-model="dishForm.name" placeholder="如：宫保鸡丁" />
        </el-form-item>
        <el-form-item label="分类" required>
          <el-select v-model="dishForm.categoryId" placeholder="选择分类">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" required>
          <el-input-number v-model="dishForm.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="菜品图片">
          <el-upload
            class="dish-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            accept="image/*"
          >
            <img v-if="dishForm.imageUrl" :src="dishForm.imageUrl" class="dish-preview" />
            <div v-else class="upload-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28" style="color: var(--text2)"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
              <span style="font-size: 12px; color: var(--text2)">上传图片</span>
            </div>
          </el-upload>
          <button v-if="dishForm.imageUrl" class="btn btn-danger btn-sm" style="margin-top: 8px" @click="dishForm.imageUrl = ''">移除图片</button>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="dishForm.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input-number v-model="dishForm.stock" :min="-1" />
          <span style="margin-left: 10px; color: var(--text2); font-size: 12px">-1 表示不限库存</span>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dishForm.sortOrder" :min="0" />
        </el-form-item>
        <el-divider>规格（可选）</el-divider>
        <div v-for="(spec, i) in dishForm.specs" :key="i" class="spec-row">
          <el-input v-model="spec.groupName" placeholder="规格组名" style="width: 100px" />
          <el-input v-model="spec.value" placeholder="规格值" style="width: 100px" />
          <el-input-number v-model="spec.priceDiff" :precision="2" size="small" style="width: 120px" placeholder="加价" />
          <button class="btn btn-danger btn-sm" @click="dishForm.specs.splice(i, 1)" style="border-radius: 50%; width: 28px; height: 28px; padding: 0; display: flex; align-items: center; justify-content: center">×</button>
        </div>
        <button class="btn btn-outline btn-sm" @click="dishForm.specs.push({ groupName: '', value: '', priceDiff: 0 })">+ 添加规格</button>
      </el-form>
      <template #footer>
        <button class="btn btn-ghost" @click="dishDialogVisible = false">取消</button>
        <button class="btn btn-primary" @click="saveDish" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
      </template>
    </el-dialog>

    <!-- Category management dialog -->
    <el-dialog v-model="categoryDialogVisible" title="管理分类" width="450" class="cat-dialog">
      <div v-for="cat in categories" :key="cat.id" class="cat-row">
        <el-input v-model="cat.name" style="width: 200px" />
        <el-input-number v-model="cat.sortOrder" :min="0" size="small" style="width: 100px" />
        <button class="btn btn-danger btn-sm" @click="handleDeleteCategory(cat)">删除</button>
      </div>
      <button class="btn btn-outline btn-sm" style="margin-top: 12px" @click="addCategory">+ 添加分类</button>
      <template #footer>
        <button class="btn btn-ghost" @click="categoryDialogVisible = false">关闭</button>
        <button class="btn btn-primary" @click="saveCategories">保存</button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCategories, getDishes, createDish, updateDish, deleteDish, toggleDish, createCategory, updateCategory, deleteCategory } from '../api'

const categories = ref([])
const dishes = ref([])
const loading = ref(false)
const saving = ref(false)
const selectedCat = ref(null)
const dishDialogVisible = ref(false)
const categoryDialogVisible = ref(false)
const editingDish = ref(null)
const dishForm = ref({ name: '', categoryId: null, price: 0, description: '', imageUrl: '', stock: -1, sortOrder: 0, specs: [] })

const uploadUrl = computed(() => '/api/admin/dish/upload')
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('admin_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
})

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) { ElMessage.error('只能上传图片文件'); return false }
  if (!isLt2M) { ElMessage.error('图片大小不能超过 2MB'); return false }
  return true
}

const handleUploadSuccess = (response) => {
  const url = response.data?.url || response.data?.imageUrl || response.data || response.url
  if (url) { dishForm.value.imageUrl = url; ElMessage.success('图片上传成功') }
  else { ElMessage.error('上传成功但未获取到图片地址') }
}

const loadCategories = async () => {
  try { categories.value = await getCategories() } catch (e) { console.error(e) }
}
const loadDishes = async () => {
  loading.value = true
  try { dishes.value = await getDishes(selectedCat.value) } catch (e) { console.error(e) }
  loading.value = false
}
const selectCategory = (id) => { selectedCat.value = id; loadDishes() }

const openDishDialog = (dish) => {
  if (dish) {
    editingDish.value = dish
    dishForm.value = { ...dish, specs: dish.specs ? [...dish.specs] : [], imageUrl: dish.imageUrl || '' }
  } else {
    editingDish.value = null
    dishForm.value = { name: '', categoryId: selectedCat.value, price: 0, description: '', imageUrl: '', stock: -1, sortOrder: 0, specs: [] }
  }
  dishDialogVisible.value = true
}

const saveDish = async () => {
  if (!dishForm.value.name || !dishForm.value.categoryId || !dishForm.value.price) {
    ElMessage.warning('请填写必填项'); return
  }
  saving.value = true
  try {
    if (editingDish.value) {
      await updateDish(editingDish.value.id, dishForm.value); ElMessage.success('编辑成功')
    } else {
      await createDish(dishForm.value); ElMessage.success('新增成功')
    }
    dishDialogVisible.value = false; loadDishes()
  } catch (e) { ElMessage.error(e.message) }
  saving.value = false
}

const handleToggle = async (row) => {
  try { await toggleDish(row.id); ElMessage.success('操作成功'); loadDishes() } catch (e) { ElMessage.error(e.message) }
}
const handleDelete = async (row) => {
  try { await deleteDish(row.id); ElMessage.success('删除成功'); loadDishes() } catch (e) { ElMessage.error(e.message) }
}
const openCategoryDialog = () => { categoryDialogVisible.value = true }
const addCategory = () => {
  categories.value.push({ id: null, name: '新分类', sortOrder: categories.value.length, restaurantId: 1 })
}
const saveCategories = async () => {
  try {
    for (const cat of categories.value) {
      if (cat.id) await updateCategory(cat.id, { name: cat.name, sortOrder: cat.sortOrder })
      else await createCategory(cat)
    }
    ElMessage.success('保存成功'); categoryDialogVisible.value = false; loadCategories()
  } catch (e) { ElMessage.error(e.message) }
}
const handleDeleteCategory = async (cat) => {
  if (cat.id) {
    try { await deleteCategory(cat.id); ElMessage.success('删除成功'); loadCategories() } catch (e) { ElMessage.error(e.message) }
  }
}

onMounted(() => { loadCategories(); loadDishes() })
</script>

<style scoped>
.header-actions { display: flex; gap: 10px; }

/* Category tabs */
.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.cat-tab {
  padding: 7px 18px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all .2s;
}
.cat-tab:hover { border-color: var(--brand); color: var(--text); }
.cat-tab.active {
  background: var(--brand-subtle);
  border-color: var(--brand);
  color: var(--brand);
}

/* Dish grid */
.dish-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.dish-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: border-color .2s, transform .2s;
}
.dish-card:hover { border-color: var(--brand); transform: translateY(-2px); }
.dish-image {
  height: 160px;
  position: relative;
  overflow: hidden;
  background: var(--surface2);
}
.dish-image img { width: 100%; height: 100%; object-fit: cover; }
.dish-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 48px;
  background: var(--surface2);
  color: var(--text2);
  font-weight: 700;
}
.dish-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}
.dish-status.on { background: rgba(34,197,94,.9); color: #fff; }
.dish-status.off { background: rgba(148,163,184,.85); color: #fff; }
.dish-body { padding: 14px 16px; }
.dish-name { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
.dish-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.dish-price { font-size: 18px; font-weight: 700; color: var(--success); }
.dish-sales { font-size: 12px; color: var(--text2); }
.dish-stock { font-size: 12px; color: var(--text2); margin-bottom: 12px; }
.dish-actions { display: flex; gap: 6px; }

/* Empty state */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
}
.empty-icon { font-size: 48px; margin-bottom: 12px; color: var(--text-tertiary, #94a3b8); opacity: 0.6; }
.empty-text { color: var(--text2); font-size: 14px; }

/* Buttons */
.btn {
  padding: 6px 14px;
  border-radius: 6px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all .2s;
}
.btn-sm { padding: 4px 10px; font-size: 12px; }
.btn-primary { background: var(--brand); color: #fff; border-color: var(--brand); }
.btn-primary:hover { background: var(--brand-hover); border-color: var(--brand-hover); }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.btn-success { background: var(--success); color: #fff; }
.btn-success:hover { opacity: .9; }
.btn-warning { background: var(--warning); color: #fff; }
.btn-warning:hover { opacity: .9; }
.btn-danger { background: var(--danger); color: #fff; }
.btn-danger:hover { opacity: .9; }
.btn-outline {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border-strong);
}
.btn-outline:hover { border-color: var(--brand); color: var(--brand); }
.btn-ghost {
  background: transparent;
  color: var(--text2);
  border: 1px solid var(--border);
}
.btn-ghost:hover { background: var(--surface-hover); border-color: var(--brand); color: var(--brand); }

/* Spec row */
.spec-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

/* Uploader */
.dish-uploader {
  border: 1px dashed var(--border);
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color .3s;
}
.dish-uploader:hover { border-color: var(--brand); }
.dish-preview { width: 120px; height: 120px; display: block; object-fit: cover; }
.upload-placeholder {
  width: 120px; height: 120px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 6px;
}

/* Category dialog rows */
.cat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
</style>
