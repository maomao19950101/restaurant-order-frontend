import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const openid = localStorage.getItem('openid')
  if (openid) {
    if (config.method === 'get') {
      config.params = { ...config.params, openid }
    } else if (config.data && typeof config.data === 'object') {
      config.data.openid = openid
    }
  }
  return config
})

api.interceptors.response.use(
  (res) => {
    if (res.data.code === 200) {
      return res.data
    }
    return Promise.reject(new Error(res.data.message || '请求失败'))
  },
  (err) => Promise.reject(err)
)

export const getMenu = (restaurantId) =>
  api.get('/customer/menu', { params: { restaurantId } })

export const getTableInfo = (restaurantId, tableId) =>
  api.get('/customer/table/scan', { params: { restaurantId, tableId } })

export const joinTable = (data) => api.post('/customer/table/join', data)
export const leaveTable = (data) => api.post('/customer/table/leave', data)
export const getSharedCart = (restaurantId, tableId) =>
  api.get('/customer/table/cart', { params: { restaurantId, tableId } })
export const addToSharedCart = (data) => api.post('/customer/table/cart/add', data)
export const updateSharedCartItem = (data) => api.post('/customer/table/cart/update', data)
export const removeSharedCartItem = (data) => api.post('/customer/table/cart/remove', data)

export const createOrder = (data) => api.post('/customer/order', data)
export const createSharedOrder = (data) => api.post('/customer/order/shared', data)
export const getOrderDetail = (orderNo) => api.get(`/customer/order/${orderNo}`)
export const getOrderList = ({ openid, page = 1, size = 10 }) =>
  api.get('/customer/order/list', { params: { openid, page, size } })

export default api
