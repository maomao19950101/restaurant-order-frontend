<template>
  <div>
    <div class="page-header">
      <h2>管理员管理</h2>
      <el-button type="success" @click="openDialog()">新增管理员</el-button>
    </div>

    <el-table :data="users" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="role" label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="row.role === 'admin' ? 'primary' : 'warning'" size="small">
            {{ row.role === 'admin' ? '管理员' : '超级管理员' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button text size="small" type="primary" @click="openDialog(row)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row)">
            <template #reference>
              <el-button text size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingUser ? '编辑管理员' : '新增管理员'" width="420">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" :prop="editingUser ? '' : 'password'">
          <el-input v-model="form.password" type="password" show-password :placeholder="editingUser ? '留空表示不修改' : '请输入密码'" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="超级管理员" value="super_admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser } from '../api'

const users = ref([])
const dialogVisible = ref(false)
const editingUser = ref(null)
const formRef = ref(null)
const form = ref({ username: '', password: '', role: 'admin' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const loadUsers = async () => {
  try { users.value = await getAdminUsers() } catch (e) { console.error(e) }
}

const openDialog = (user) => {
  if (user) {
    editingUser.value = user
    form.value = { username: user.username, password: '', role: user.role || 'admin' }
  } else {
    editingUser.value = null
    form.value = { username: '', password: '', role: 'admin' }
  }
  dialogVisible.value = true
}

const saveUser = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  try {
    const data = { ...form.value }
    if (editingUser.value && !data.password) delete data.password
    if (editingUser.value) {
      await updateAdminUser(editingUser.value.id, data)
      ElMessage.success('编辑成功')
    } else {
      await createAdminUser(data)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadUsers()
  } catch (e) { ElMessage.error(e.message) }
}

const handleDelete = async (user) => {
  try { await deleteAdminUser(user.id); ElMessage.success('删除成功'); loadUsers() } catch (e) { ElMessage.error(e.message) }
}

onMounted(loadUsers)
</script>
