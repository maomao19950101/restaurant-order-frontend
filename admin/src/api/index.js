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

// 获取餐厅ID（从登录信息中动态获取）
const getRestaurantId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}')
    return user.restaurantId || 1
  } catch {
    return 1
  }
}

// ============ 登录 ============
export const adminLogin = async (data) => {
  const res = await axios.post('/api/admin/login', data)
  const result = res.data
  if (result.code === 200) {
    // 存储JWT Token和用户信息
    localStorage.setItem('admin_token', result.data.token)
    localStorage.setItem('admin_user', JSON.stringify({
      username: result.data.username,
      role: result.data.role,
      restaurantId: result.data.restaurantId
    }))
  }
  return result
}

// ============ 订单 ============
export const getOrders = (params) => api.get('/admin/order', { params: { restaurantId: getRestaurantId(), ...params } })
export const getOrderDetail = (id) => api.get(`/admin/order/${id}`)
export const acceptOrder = (id) => api.put(`/admin/order/${id}/accept`)
export const cookingOrder = (id) => api.put(`/admin/order/${id}/cooking`)
export const completeOrder = (id) => api.put(`/admin/order/${id}/complete`)
export const finishOrder = (id) => api.put(`/admin/order/${id}/finish`)
export const cancelOrder = (id) => api.put(`/admin/order/${id}/cancel`)
export const getStats = () => api.get('/admin/order/stats', { params: { restaurantId: getRestaurantId() } })

// ============ 菜品 ============
export const getDishes = (categoryId) => api.get('/admin/dish', { params: { restaurantId: getRestaurantId(), categoryId } })
export const getDishDetail = (id) => api.get(`/admin/dish/${id}`)
export const createDish = (data) => api.post('/admin/dish', data, { params: { restaurantId: getRestaurantId() } })
export const updateDish = (id, data) => api.put(`/admin/dish/${id}`, data)
export const deleteDish = (id) => api.delete(`/admin/dish/${id}`)
export const toggleDish = (id) => api.post(`/admin/dish/${id}/toggle`)

// ============ 分类 ============
export const getCategories = () => api.get('/admin/category', { params: { restaurantId: getRestaurantId() } })
export const createCategory = (data) => api.post('/admin/category', { ...data, restaurantId: getRestaurantId() })
export const updateCategory = (id, data) => api.put(`/admin/category/${id}`, data)
export const deleteCategory = (id) => api.delete(`/admin/category/${id}`)

// ============ 桌台 ============
export const getTables = () => api.get('/admin/table', { params: { restaurantId: getRestaurantId() } })
export const createTable = (data) => api.post('/admin/table', { ...data, restaurantId: getRestaurantId() })
export const updateTable = (id, data) => api.put(`/admin/table/${id}`, data)
export const deleteTable = (id) => api.delete(`/admin/table/${id}`)
export const resetTable = (id) => api.post(`/admin/table/${id}/reset`)

// ============ 管理员 ============
export const getAdminUsers = (params) => api.get('/admin/user', { params })
export const createAdminUser = (data) => api.post('/admin/user', data)
export const updateAdminUser = (id, data) => api.put(`/admin/user/${id}`, data)
export const deleteAdminUser = (id) => api.delete(`/admin/user/${id}`)

// ============ 餐厅设置 ============
export const getRestaurantInfo = () => api.get(`/admin/restaurant/${getRestaurantId()}`)
export const updateRestaurantInfo = (data) => api.put(`/admin/restaurant/${getRestaurantId()}`, data)

// ============ 评价管理 ============
export const getReviews = (params) => api.get('/admin/review', { params: { restaurantId: getRestaurantId(), ...params } })
export const getReviewStats = () => api.get('/admin/review/stats', { params: { restaurantId: getRestaurantId() } })
export const replyReview = (id, content) => api.post(`/admin/review/${id}/reply`, { content })
export const updateReviewStatus = (id, status) => api.put(`/admin/review/${id}/status`, { status })

// ============ 套餐管理 ============
export const getCombos = () => api.get('/admin/combo/list', { params: { restaurantId: getRestaurantId() } })
export const getComboDetail = (id) => api.get(`/admin/combo/${id}`)
export const createCombo = (data) => api.post('/admin/combo/create', data, { params: { restaurantId: getRestaurantId() } })
export const updateCombo = (id, data) => api.put(`/admin/combo/${id}`, data)
export const deleteCombo = (id) => api.delete(`/admin/combo/${id}`)
export const updateComboStatus = (id, status) => api.put(`/admin/combo/${id}/status`, null, { params: { status } })

// ============ 报表统计 ============
export const getReportOverview = (period) => api.get('/admin/report/overview', { params: { restaurantId: getRestaurantId(), period } })
export const getSalesTrend = (days) => api.get('/admin/report/trend', { params: { restaurantId: getRestaurantId(), days } })
export const getDishRank = (period, limit = 10) => api.get('/admin/report/dish-rank', { params: { restaurantId: getRestaurantId(), period, limit } })
export const getTimeAnalysis = (date) => api.get('/admin/report/time-analysis', { params: { restaurantId: getRestaurantId(), date } })
export const getOrderStatus = (period) => api.get('/admin/report/order-status', { params: { restaurantId: getRestaurantId(), period } })
export const getTableUsage = (period) => api.get('/admin/report/table-usage', { params: { restaurantId: getRestaurantId(), period } })
export const getMemberStats = () => api.get('/admin/report/member-stats', { params: { restaurantId: getRestaurantId() } })
export const getDishProfit = (period, limit = 10) => api.get('/admin/report/dish-profit', { params: { restaurantId: getRestaurantId(), period, limit } })
export const getMemberConsumption = (period) => api.get('/admin/report/member-consumption', { params: { restaurantId: getRestaurantId(), period } })
export const getRepeatCustomer = (days) => api.get('/admin/report/repeat-customer', { params: { restaurantId: getRestaurantId(), days } })
export const getHeatmap = (days) => api.get('/admin/report/heatmap', { params: { restaurantId: getRestaurantId(), days } })
export const getSalesComparison = (period) => api.get('/admin/report/comparison', { params: { restaurantId: getRestaurantId(), period } })
