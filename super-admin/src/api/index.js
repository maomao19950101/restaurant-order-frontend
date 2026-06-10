import axios from 'axios'

const api = axios.create({
  baseURL: '/api/super',
  timeout: 10000
})

// 请求拦截 - 添加 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('super_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截
api.interceptors.response.use(
  res => {
    if (res.data.code !== 200) {
      return Promise.reject(new Error(res.data.message || '请求失败'))
    }
    return res.data.data
  },
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('super_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// 登录
export const login = (username, password) => api.post('/login', { username, password })

// 餐厅管理
export const getRestaurants = () => api.get('/restaurants')
export const createRestaurant = (data) => api.post('/restaurants', data)
export const updateRestaurant = (id, data) => api.put(`/restaurants/${id}`, data)
export const deleteRestaurant = (id) => api.delete(`/restaurants/${id}`)

// 管理员管理
export const getAdmins = (restaurantId) => api.get('/admins', { params: { restaurantId } })
export const createAdmin = (data) => api.post('/admins', data)
export const updateAdmin = (id, data) => api.put(`/admins/${id}`, data)
export const deleteAdmin = (id) => api.delete(`/admins/${id}`)

// 统计
export const getStats = () => api.get('/stats')
