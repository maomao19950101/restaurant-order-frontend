import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { title: '登录', public: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '数据看板', icon: 'DataAnalysis' } },
  { path: '/orders', name: 'Orders', component: () => import('../views/Orders.vue'), meta: { title: '订单管理', icon: 'List' } },
  { path: '/menu', name: 'Menu', component: () => import('../views/Menu.vue'), meta: { title: '菜品管理', icon: 'Dish' } },
  { path: '/tables', name: 'Tables', component: () => import('../views/Tables.vue'), meta: { title: '桌台管理', icon: 'Grid' } },
  { path: '/admin-users', name: 'AdminUsers', component: () => import('../views/AdminUsers.vue'), meta: { title: '管理员管理', icon: 'User' } },
  { path: '/settings', name: 'Settings', component: () => import('../views/RestaurantSettings.vue'), meta: { title: '餐厅设置', icon: 'Setting' } },
  { path: '/reviews', name: 'Reviews', component: () => import('../views/Reviews.vue'), meta: { title: '评价管理', icon: 'Star' } },
  { path: '/reports', name: 'Reports', component: () => import('../views/Reports.vue'), meta: { title: '数据分析', icon: 'Chart' } },
  { path: '/combos', name: 'Combos', component: () => import('../views/Combos.vue'), meta: { title: '套餐管理', icon: 'Dish' } },
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
