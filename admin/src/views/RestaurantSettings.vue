<template>
  <div>
    <div class="page-header">
      <h2>餐厅设置</h2>
    </div>
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" style="max-width: 600px">
      <el-form-item label="餐厅名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入餐厅名称" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="餐厅地址" prop="address">
        <el-input v-model="form.address" type="textarea" :rows="2" placeholder="请输入餐厅地址" />
      </el-form-item>
      <el-form-item label="营业时间">
        <el-input v-model="form.businessHours" placeholder="如: 09:00-22:00" />
      </el-form-item>
      <el-form-item label="餐厅描述">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="餐厅简介" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSave" :loading="saving">保存设置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRestaurantInfo, updateRestaurantInfo } from '../api'

const formRef = ref(null)
const saving = ref(false)
const form = ref({ name: '', phone: '', address: '', businessHours: '', description: '' })
const rules = {
  name: [{ required: true, message: '请输入餐厅名称', trigger: 'blur' }]
}

const loadInfo = async () => {
  try {
    const data = await getRestaurantInfo()
    if (data) {
      form.value = { ...form.value, ...data }
    }
  } catch (e) { console.error(e) }
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  saving.value = true
  try {
    await updateRestaurantInfo(form.value)
    ElMessage.success('保存成功')
  } catch (e) { ElMessage.error(e.message) }
  saving.value = false
}

onMounted(loadInfo)
</script>
