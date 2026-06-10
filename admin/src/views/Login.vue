<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="bg-circle c1"></div>
      <div class="bg-circle c2"></div>
      <div class="bg-circle c3"></div>
    </div>
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">
          <span class="logo-icon">R</span>
        </div>
        <h1>Restaurant</h1>
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
            class="login-btn"
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
  background: linear-gradient(135deg, #f0f1ff 0%, #e8e0ff 100%);
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
[data-theme="dark"] .login-page {
  background: linear-gradient(135deg, var(--bg) 0%, #1a1530 50%, var(--bg) 100%);
}
.bg-circle.c1 {
  width: 400px; height: 400px;
  background: var(--brand);
  top: -100px; right: -100px;
}
.bg-circle.c2 {
  width: 300px; height: 300px;
  background: var(--brand-hover);
  bottom: -50px; left: -50px;
}
.bg-circle.c3 {
  width: 200px; height: 200px;
  background: var(--success);
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
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 1;
}
.login-header {
  text-align: center;
  margin-bottom: 36px;
}
.login-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--brand), var(--brand-hover));
  color: #fff;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -1px;
  box-shadow: 0 6px 16px rgba(99,102,241,0.3);
}
.login-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}
.login-header p {
  color: var(--text2);
  font-size: 14px;
}
.login-tip {
  text-align: center;
  margin-top: 16px;
  font-size: 13px;
  color: var(--text-tertiary);
}
.login-btn {
  width: 100% !important;
  height: 44px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  border-radius: var(--radius-sm) !important;
  background: linear-gradient(135deg, var(--brand), var(--brand-hover)) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
  transition: all .2s ease !important;
}
.login-btn:hover {
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4) !important;
  transform: translateY(-1px);
}
</style>
