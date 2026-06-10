<template>
  <div class="app-layout" v-if="route.path !== '/login'">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">🏢</span>
        <span class="logo-text">餐饮管理平台</span>
      </div>
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ nickname.charAt(0) }}</div>
          <div class="user-meta">
            <span class="user-name">{{ nickname }}</span>
            <span class="user-role">超级管理员</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout" title="退出登录">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-area">
      <header class="top-bar">
        <h1 class="page-title">{{ route.meta?.title }}</h1>
        <div class="top-bar-right">
          <span class="current-time">{{ currentTime }}</span>
        </div>
      </header>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
  <router-view v-else />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const nickname = ref(localStorage.getItem('super_nickname') || '超级管理员')
const currentTime = ref('')

const navItems = [
  {
    path: '/dashboard',
    label: '数据看板',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
  },
  {
    path: '/restaurants',
    label: '餐厅管理',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
  },
  {
    path: '/admins',
    label: '管理员管理',
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
  }
]

let timer = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const handleLogout = () => {
  localStorage.removeItem('super_token')
  localStorage.removeItem('super_nickname')
  router.push('/login')
}
</script>

<style>
/* === CSS Variables === */
:root {
  --bg: #0f172a;
  --surface: #1e293b;
  --surface2: #273548;
  --border: #334155;
  --text: #f1f5f9;
  --text2: #94a3b8;
  --accent: #3b82f6;
  --green: #22c55e;
  --yellow: #eab308;
  --red: #ef4444;
  --sidebar-w: 240px;
  --topbar-h: 60px;
  --radius: 12px;
  --radius-sm: 8px;
}

/* === Reset & Base === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #app { height: 100%; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}

/* === Element Plus Dark Overrides === */
.el-card, .el-dialog {
  --el-card-bg-color: var(--surface) !important;
  --el-card-border-color: var(--border) !important;
  --el-dialog-bg-color: var(--surface) !important;
  --el-dialog-border-radius: var(--radius) !important;
}
.el-card__header {
  border-bottom-color: var(--border) !important;
  color: var(--text) !important;
}
.el-card__body { color: var(--text) !important; }
.el-table {
  --el-table-bg-color: var(--surface) !important;
  --el-table-tr-bg-color: var(--surface) !important;
  --el-table-header-bg-color: var(--surface2) !important;
  --el-table-row-hover-bg-color: var(--surface2) !important;
  --el-table-border-color: var(--border) !important;
  --el-table-text-color: var(--text) !important;
  --el-table-header-text-color: var(--text2) !important;
}
.el-table .el-table__row--striped td.el-table__cell {
  background: var(--surface2) !important;
}
.el-input__wrapper, .el-textarea__inner {
  background: var(--surface2) !important;
  box-shadow: 0 0 0 1px var(--border) inset !important;
  color: var(--text) !important;
}
.el-input__inner { color: var(--text) !important; }
.el-input__inner::placeholder { color: var(--text2) !important; }
.el-select .el-input__wrapper { background: var(--surface2) !important; }
.el-dialog__title { color: var(--text) !important; }
.el-dialog__headerbtn .el-dialog__close { color: var(--text2) !important; }
.el-form-item__label { color: var(--text2) !important; }
.el-tag { border: none !important; }
.el-button--default {
  --el-button-bg-color: var(--surface2) !important;
  --el-button-border-color: var(--border) !important;
  --el-button-text-color: var(--text) !important;
  --el-button-hover-bg-color: var(--border) !important;
  --el-button-hover-border-color: var(--accent) !important;
  --el-button-hover-text-color: var(--text) !important;
}
.el-switch__label { color: var(--text2) !important; }
.el-message-box {
  --el-messagebox-title-color: var(--text) !important;
  background: var(--surface) !important;
  border: 1px solid var(--border) !important;
}
.el-overlay { backdrop-filter: blur(4px); }
</style>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* === Sidebar === */
.sidebar {
  width: var(--sidebar-w);
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border);
}
.logo-icon { font-size: 24px; }
.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.5px;
}

.sidebar-nav {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  color: var(--text2);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}
.nav-item:hover {
  background: var(--surface2);
  color: var(--text);
}
.nav-item.active {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}
.nav-item.active .nav-icon { opacity: 1; }
.nav-icon {
  display: flex;
  align-items: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.nav-item:hover .nav-icon { opacity: 1; }

/* === Sidebar Footer === */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}
.user-meta {
  display: flex;
  flex-direction: column;
}
.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.user-role {
  font-size: 11px;
  color: var(--text2);
}
.logout-btn {
  background: none;
  border: none;
  color: var(--text2);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  transition: all 0.2s;
}
.logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: var(--red);
}

/* === Main Area === */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  height: var(--topbar-h);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}
.current-time {
  font-size: 13px;
  color: var(--text2);
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: var(--bg);
}
</style>
