import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/menu',
  },
  {
    path: '/menu',
    name: 'Menu',
    component: () => import('../views/Menu.vue'),
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../views/Orders.vue'),
  },
  {
    path: '/order/confirm',
    name: 'OrderConfirm',
    component: () => import('../views/OrderConfirm.vue'),
  },
  {
    path: '/order/:orderNo',
    name: 'OrderDetail',
    component: () => import('../views/OrderDetail.vue'),
  },
  {
    path: '/table',
    name: 'TableSelect',
    component: () => import('../views/TableSelect.vue'),
  },
  {
    path: '/review/:orderNo',
    name: 'ReviewSubmit',
    component: () => import('../views/ReviewSubmit.vue'),
  },
  {
    path: '/member',
    name: 'MemberCenter',
    component: () => import('../views/MemberCenter.vue'),
  },
  {
    path: '/coupons',
    name: 'Coupons',
    component: () => import('../views/Coupons.vue'),
  },
  {
    path: '/points',
    name: 'Points',
    component: () => import('../views/Points.vue'),
  },
]

const router = createRouter({
  history: createWebHistory('/customer/'),
  routes,
})

export default router
