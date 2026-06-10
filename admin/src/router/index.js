import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { title: '登录', public: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '数据看板', icon: 'DataAnalysis' } },
  { path: '/orders', name: 'Orders', component: () => import('../views/Orders.vue'), meta: { title: '订单管理', icon: 'List' } },
  { path: '/menu', name: 'Menu', component: () => import('../views/Menu.vue'), meta: { title: '菜品管理', icon: 'Dish' } },
  { path: '/tables', name: 'Tables', component: () => import('../views/Tables.vue'), meta: { title: '桌台管理', icon: 'Grid' } },
]

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.meta.public) {
    next()
  } else if (!token) {
    next('/login')
  } else {
    next()
  }
})

export default router
