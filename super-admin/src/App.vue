<template>
  <div class="app-layout" v-if="route.path !== '/login'">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">S</span>
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
          <button class="theme-toggle" @click="toggleTheme" :title="theme === 'dark' ? '切换亮色' : '切换暗色'">
            <svg v-if="theme === 'dark'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
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
const theme = ref(localStorage.getItem('super_theme') || 'light')

const applyTheme = () => {
  document.documentElement.setAttribute('data-theme', theme.value)
}
const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('super_theme', theme.value)
  applyTheme()
}

// Apply theme on load
applyTheme()

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
/* === Element Plus Theme Overrides === */
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
  --el-table-row-hover-bg-color: var(--surface-hover) !important;
  --el-table-border-color: var(--border) !important;
  --el-table-text-color: var(--text) !important;
  --el-table-header-text-color: var(--text2) !important;
}
.el-table .el-table__row--striped td.el-table__cell {
  background: var(--surface-subtle) !important;
}
.el-input__wrapper, .el-textarea__inner {
  background: var(--input-bg) !important;
  box-shadow: 0 0 0 1px var(--border) inset !important;
  color: var(--text) !important;
}
.el-input__inner { color: var(--text) !important; }
.el-input__inner::placeholder { color: var(--text-tertiary) !important; }
.el-select .el-input__wrapper { background: var(--input-bg) !important; }
.el-dialog__title { color: var(--text) !important; }
.el-dialog__headerbtn .el-dialog__close { color: var(--text2) !important; }
.el-form-item__label { color: var(--text2) !important; }
.el-tag { border: none !important; }
.el-button--default {
  --el-button-bg-color: var(--surface2) !important;
  --el-button-border-color: var(--border) !important;
  --el-button-text-color: var(--text) !important;
  --el-button-hover-bg-color: var(--border) !important;
  --el-button-hover-border-color: var(--brand) !important;
  --el-button-hover-text-color: var(--text) !important;
}
.el-button--primary {
  --el-button-bg-color: var(--brand) !important;
  --el-button-border-color: var(--brand) !important;
  --el-button-hover-bg-color: var(--brand-hover) !important;
  --el-button-hover-border-color: var(--brand-hover) !important;
}
.el-switch__label { color: var(--text2) !important; }
.el-message-box {
  --el-messagebox-title-color: var(--text) !important;
  background: var(--surface) !important;
  border: 1px solid var(--border) !important;
}
.el-overlay { backdrop-filter: blur(4px); }
.el-select-dropdown {
  background: var(--surface) !important;
  border-color: var(--border) !important;
}
.el-select-dropdown__item {
  color: var(--text) !important;
}
.el-select-dropdown__item.hover, .el-select-dropdown__item:hover {
  background: var(--surface-hover) !important;
}
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
.logo-icon {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -1px;
}
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
  background: var(--surface-hover);
  color: var(--text);
}
.nav-item.active {
  background: var(--brand);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
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
  background: var(--brand);
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
  background: var(--danger-bg);
  color: var(--danger);
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
.top-bar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.theme-toggle {
  background: none;
  border: 1px solid var(--border);
  color: var(--text2);
  cursor: pointer;
  padding: 8px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.theme-toggle:hover {
  background: var(--surface-hover);
  color: var(--text);
  border-color: var(--brand);
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
