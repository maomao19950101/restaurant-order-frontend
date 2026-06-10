import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截 - 添加 Authorization header
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  err => Promise.reject(err)
)

// 响应拦截 - 处理 401
api.interceptors.response.use(
  res => {
    if (res.data.code !== 200) {
      return Promise.reject(new Error(res.data.message || '请求失败'))
    }
    return res.data.data
  },
  err => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      router.push('/login')
      ElMessage.error('登录已过期，请重新登录')
    }
    return Promise.reject(err)
  }
)

// 餐厅ID（默认示例餐厅）
const RESTAURANT_ID = 1

// ============ 登录 ============
export const adminLogin = (data) => axios.post('/api/admin/login', data).then(res => res.data)

// ============ 订单 ============
export const getOrders = (params) => api.get('/admin/order', { params: { restaurantId: RESTAURANT_ID, ...params } })
export const getOrderDetail = (id) => api.get(`/admin/order/${id}`)
export const acceptOrder = (id) => api.put(`/admin/order/${id}/accept`)
export const cookingOrder = (id) => api.put(`/admin/order/${id}/cooking`)
export const completeOrder = (id) => api.put(`/admin/order/${id}/complete`)
export const finishOrder = (id) => api.put(`/admin/order/${id}/finish`)
export const cancelOrder = (id) => api.put(`/admin/order/${id}/cancel`)
export const getStats = () => api.get('/admin/order/stats', { params: { restaurantId: RESTAURANT_ID } })

// ============ 菜品 ============
export const getDishes = (categoryId) => api.get('/admin/dish', { params: { restaurantId: RESTAURANT_ID, categoryId } })
export const getDishDetail = (id) => api.get(`/admin/dish/${id}`)
export const createDish = (data) => api.post('/admin/dish', data, { params: { restaurantId: RESTAURANT_ID } })
export const updateDish = (id, data) => api.put(`/admin/dish/${id}`, data)
export const deleteDish = (id) => api.delete(`/admin/dish/${id}`)
export const toggleDish = (id) => api.post(`/admin/dish/${id}/toggle`)

// ============ 分类 ============
export const getCategories = () => api.get('/admin/category', { params: { restaurantId: RESTAURANT_ID } })
export const createCategory = (data) => api.post('/admin/category', { ...data, restaurantId: RESTAURANT_ID })
export const updateCategory = (id, data) => api.put(`/admin/category/${id}`, data)
export const deleteCategory = (id) => api.delete(`/admin/category/${id}`)

// ============ 桌台 ============
export const getTables = () => api.get('/admin/table', { params: { restaurantId: RESTAURANT_ID } })
export const createTable = (data) => api.post('/admin/table', { ...data, restaurantId: RESTAURANT_ID })
export const updateTable = (id, data) => api.put(`/admin/table/${id}`, data)
export const deleteTable = (id) => api.delete(`/admin/table/${id}`)
export const resetTable = (id) => api.post(`/admin/table/${id}/reset`)

// ============ 管理员 ============
export const getAdminUsers = (params) => api.get('/admin/user', { params })
export const createAdminUser = (data) => api.post('/admin/user', data)
export const updateAdminUser = (id, data) => api.put(`/admin/user/${id}`, data)
export const deleteAdminUser = (id) => api.delete(`/admin/user/${id}`)

// ============ 餐厅设置 ============
export const getRestaurantInfo = () => api.get(`/admin/restaurant/${RESTAURANT_ID}`)
export const updateRestaurantInfo = (data) => api.put(`/admin/restaurant/${RESTAURANT_ID}`, data)
