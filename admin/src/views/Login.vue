<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="bg-circle c1"></div>
      <div class="bg-circle c2"></div>
      <div class="bg-circle c3"></div>
    </div>
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">🍜</div>
        <h1>餐厅管理系统</h1>
        <p>管理员登录</p>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        label-width="0"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%; height: 44px; font-size: 15px; font-weight: 600; border-radius: 8px"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-tip">
        <span>默认账号：admin / admin123</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { adminLogin } from '../api'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  const valid = await loginFormRef.value?.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const res = await adminLogin(loginForm)
    const token = res.token || res.data?.token || res
    const user = res.user || res.data?.user || { username: loginForm.username }
    localStorage.setItem('admin_token', typeof token === 'string' ? token : JSON.stringify(token))
    localStorage.setItem('admin_user', JSON.stringify(user))
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (e) {
    ElMessage.error(e.response?.data?.message || e.message || '登录失败')
  }
  loading.value = false
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
  position: relative;
  overflow: hidden;
}
.login-bg { position: absolute; inset: 0; pointer-events: none; }
.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: .4;
}
.bg-circle.c1 {
  width: 400px; height: 400px;
  background: var(--accent);
  top: -100px; right: -100px;
}
.bg-circle.c2 {
  width: 300px; height: 300px;
  background: #8b5cf6;
  bottom: -50px; left: -50px;
}
.bg-circle.c3 {
  width: 200px; height: 200px;
  background: var(--green);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  opacity: .15;
}
.login-card {
  width: 420px;
  padding: 48px 40px 36px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, .5);
  position: relative;
  z-index: 1;
}
.login-header {
  text-align: center;
  margin-bottom: 36px;
}
.login-logo {
  font-size: 48px;
  margin-bottom: 12px;
}
.login-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}
.login-header p {
  color: var(--text2);
  font-size: 14px;
}
.login-tip {
  text-align: center;
  margin-top: 16px;
  font-size: 13px;
  color: var(--text2);
}
</style>
