<template>
  <!-- Login page: no sidebar/header -->
  <div v-if="isLoginPage" style="height: 100vh">
    <router-view />
  </div>

  <!-- Main layout -->
  <div v-else class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">R</div>
        <span class="logo-text">Restaurant</span>
      </div>
      <nav class="sidebar-nav">
        <router-link
          v-for="r in menuRoutes"
          :key="r.path"
          :to="r.path"
          :class="['nav-item', { active: route.path === r.path }]"
        >
          <span class="nav-icon" v-html="icons[r.meta.icon]"></span>
          <span class="nav-label">{{ r.meta.title }}</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-avatar">{{ username.charAt(0).toUpperCase() }}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">{{ username }}</div>
            <div class="sidebar-user-role">管理员</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="main-wrapper">
      <!-- Top header -->
      <header class="top-header">
        <h1 class="header-title">{{ route.meta.title }}</h1>
        <div class="header-right">
          <button class="theme-switch" @click="toggleTheme" :title="currentTheme === 'light' ? '切换暗色' : '切换亮色'">
            <svg v-if="currentTheme === 'light'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </button>
          <div class="bell-wrapper" @click="goOrders">
            <span class="bell-icon" v-html="icons.Bell"></span>
            <span v-if="newOrderCount > 0" class="bell-badge">{{ newOrderCount > 99 ? '99+' : newOrderCount }}</span>
          </div>
          <div class="header-divider"></div>
          <div class="user-info">
            <div class="user-avatar">{{ username.charAt(0).toUpperCase() }}</div>
            <span class="user-name">{{ username }}</span>
          </div>
          <button class="logout-btn" @click="handleLogout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            退出
          </button>
        </div>
      </header>
      <!-- Page content -->
      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const newOrderCount = ref(0)
const currentTheme = ref(localStorage.getItem('admin_theme') || 'light')

// Apply theme
const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
  currentTheme.value = theme
  localStorage.setItem('admin_theme', theme)
}
const toggleTheme = () => {
  applyTheme(currentTheme.value === 'light' ? 'dark' : 'light')
}
// Init theme
applyTheme(currentTheme.value)

const isLoginPage = computed(() => route.path === '/login')

const username = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}')
    return user.username || 'admin'
  } catch {
    return 'admin'
  }
})

const menuRoutes = computed(() => router.getRoutes().filter(r => r.meta?.title && !r.meta?.public))

// SVG icons inline
const icons = {
  DataAnalysis: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>`,
  List: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`,
  Dish: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,
  Grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`,
  Bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
  Setting: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  User: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  Star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  Chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
}

const handleLogout = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  router.push('/login')
}

const goOrders = () => {
  newOrderCount.value = 0
  router.push('/orders')
}

// WebSocket connection
let wsClient = null
let reconnectTimer = null

const connectWebSocket = () => {
  if (wsClient) return
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  const wsUrl = `${protocol}//${host}/ws`
  const socket = new WebSocket(wsUrl)

  socket.onopen = () => {
    socket.send('CONNECT\naccept-version:1.1,1.0\nheart-beat:10000,10000\n\n\0')
    setTimeout(() => {
      socket.send('SUBSCRIBE\ndestination:/topic/admin/orders\nid:sub-0\n\n\0')
    }, 200)
  }

  socket.onmessage = (event) => {
    const data = event.data
    if (data.startsWith('MESSAGE')) {
      try {
        const bodyStr = data.split('\n\n')[1]?.replace('\0', '')
        if (bodyStr) {
          const body = JSON.parse(bodyStr)
          newOrderCount.value++
          window.dispatchEvent(new CustomEvent('new-order', { detail: body }))
        }
      } catch { /* ignore */ }
    }
  }

  socket.onclose = () => {
    wsClient = null
    reconnectTimer = setTimeout(connectWebSocket, 5000)
  }

  socket.onerror = () => { socket.close() }
  wsClient = socket
}

watch(isLoginPage, (isLogin) => {
  if (!isLogin) {
    connectWebSocket()
  } else {
    if (wsClient) { wsClient.close(); wsClient = null }
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
  }
}, { immediate: true })
</script>

<style scoped>
/* ============ Layout ============ */
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ============ Sidebar ============ */
.sidebar {
  width: var(--sidebar-w);
  min-width: var(--sidebar-w);
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.sidebar-logo {
  height: var(--header-h);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.logo-icon {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--brand), #a78bfa);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.logo-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  letter-spacing: -0.2px;
}
.sidebar-nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  color: var(--text2);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all .15s ease;
}
.nav-item:hover {
  background: var(--surface-hover);
  color: var(--text);
}
.nav-item.active {
  background: var(--brand-subtle);
  color: var(--brand);
}
.nav-item.active .nav-icon { color: var(--brand); }
.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.nav-icon :deep(svg) {
  width: 18px;
  height: 18px;
}
.sidebar-footer {
  padding: 16px 16px;
  border-top: 1px solid var(--border);
}
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
}
.sidebar-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--brand);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}
.sidebar-user-info { min-width: 0; }
.sidebar-user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sidebar-user-role {
  font-size: 11px;
  color: var(--text-tertiary);
}

/* ============ Main Wrapper ============ */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* ============ Top Header ============ */
.top-header {
  height: var(--header-h);
  min-height: var(--header-h);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}
.header-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.2px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.theme-switch {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .15s;
}
.theme-switch:hover {
  background: var(--surface-hover);
  color: var(--text);
  border-color: var(--border-strong);
}
.bell-wrapper {
  position: relative;
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-sm);
  transition: background .15s;
}
.bell-wrapper:hover { background: var(--surface-hover); }
.bell-icon { width: 18px; height: 18px; display: flex; color: var(--text2); }
.bell-icon :deep(svg) { width: 18px; height: 18px; }
.bell-badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: var(--danger);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.header-divider {
  width: 1px;
  height: 20px;
  background: var(--border);
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brand), #a78bfa);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}
.user-name {
  font-size: 13px;
  color: var(--text);
  font-weight: 500;
}
.logout-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1px solid var(--border);
  color: var(--text-tertiary);
  padding: 5px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all .15s;
}
.logout-btn:hover {
  border-color: var(--danger);
  color: var(--danger);
  background: var(--danger-bg);
}

/* ============ Page Content ============ */
.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: var(--bg);
}
</style>
