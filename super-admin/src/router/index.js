import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { public: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '数据看板' } },
  { path: '/restaurants', name: 'Restaurants', component: () => import('../views/Restaurants.vue'), meta: { title: '餐厅管理' } },
  { path: '/admins', name: 'Admins', component: () => import('../views/Admins.vue'), meta: { title: '管理员管理' } },
]

const router = createRouter({
  history: createWebHistory('/super/'),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('super_token')
  if (to.meta.public) {
    next()
  } else if (!token) {
    next('/login')
  } else {
    next()
  }
})

export default router
