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
        <span class="logo-icon">🍜</span>
        <span class="logo-text">餐厅管理系统</span>
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
        <div class="sidebar-version">v1.0.0</div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="main-wrapper">
      <!-- Top header -->
      <header class="top-header">
        <h1 class="header-title">{{ route.meta.title }}</h1>
        <div class="header-right">
          <div class="bell-wrapper" @click="goOrders">
            <span class="bell-icon" v-html="icons.Bell"></span>
            <span v-if="newOrderCount > 0" class="bell-badge">{{ newOrderCount > 99 ? '99+' : newOrderCount }}</span>
          </div>
          <div class="user-info">
            <div class="user-avatar">{{ username.charAt(0).toUpperCase() }}</div>
            <span class="user-name">{{ username }}</span>
          </div>
          <button class="logout-btn" @click="handleLogout">退出</button>
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
.logo-icon { font-size: 24px; }
.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
}
.sidebar-nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  color: var(--text2);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all .2s;
}
.nav-item:hover {
  background: var(--surface2);
  color: var(--text);
}
.nav-item.active {
  background: rgba(59, 130, 246, .15);
  color: var(--accent);
}
.nav-item.active .nav-icon { color: var(--accent); }
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
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}
.sidebar-version {
  font-size: 12px;
  color: var(--text2);
  text-align: center;
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
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
}
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.bell-wrapper {
  position: relative;
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-sm);
  transition: background .2s;
}
.bell-wrapper:hover { background: var(--surface2); }
.bell-icon { width: 20px; height: 20px; display: flex; color: var(--text2); }
.bell-icon :deep(svg) { width: 20px; height: 20px; }
.bell-badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--red);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #8b5cf6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}
.user-name {
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
}
.logout-btn {
  background: none;
  border: 1px solid var(--border);
  color: var(--text2);
  padding: 5px 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  transition: all .2s;
}
.logout-btn:hover {
  border-color: var(--red);
  color: var(--red);
}

/* ============ Page Content ============ */
.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: var(--bg);
}
</style>
