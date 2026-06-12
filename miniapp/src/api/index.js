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
export const urgeOrder = (orderNo) => api.post('/customer/order/urge', { orderNo })
export const addItemsToOrder = (orderNo, items) => api.post('/customer/order/add-items', { orderNo, items })

// 支付相关
export const createPayment = (orderNo) => api.post('/customer/payment/create', { orderNo })
export const confirmPayment = (orderNo) => api.post('/customer/payment/confirm', { orderNo })
export const getPaymentStatus = (orderNo) => api.get(`/customer/payment/status/${orderNo}`)
export const cancelPayment = (orderNo) => api.post('/customer/payment/cancel', { orderNo })

// 评价相关
export const submitReview = (data) => api.post('/customer/review', data)
export const getOrderReview = (orderNo) => api.get(`/customer/review/order/${orderNo}`)
export const checkReviewed = (orderNo) => api.get(`/customer/review/check/${orderNo}`)
export const getUserReviews = (params) => api.get('/customer/review/list', { params })

// 会员相关
export const getOrCreateMember = (data) => api.post('/customer/member/info', data)
export const getMemberInfo = (restaurantId, openid) => api.get('/customer/member/info', { params: { restaurantId, openid } })
export const updateMember = (id, data) => api.put(`/customer/member/${id}`, data)
export const getPointsRecords = (params) => api.get('/customer/member/points/records', { params })
export const getMemberLevels = (restaurantId) => api.get('/customer/member/levels', { params: { restaurantId } })

// 优惠券相关
export const getAvailableCoupons = (restaurantId, memberId) => api.get('/customer/coupon/available', { params: { restaurantId, memberId } })
export const receiveCoupon = (data) => api.post('/customer/coupon/receive', data)
export const getUserCoupons = (params) => api.get('/customer/coupon/list', { params })
export const getAvailableCouponCount = (memberId) => api.get('/customer/coupon/count', { params: { memberId } })

// 推荐相关
export const getPersonalRecommend = (restaurantId, openid, limit = 6) =>
  api.get('/customer/recommend/personal', { params: { restaurantId, openid, limit } })
export const getHotRecommend = (restaurantId, limit = 6) =>
  api.get('/customer/recommend/hot', { params: { restaurantId, limit } })
export const getTimeBasedRecommend = (restaurantId, limit = 6) =>
  api.get('/customer/recommend/time-based', { params: { restaurantId, limit } })
export const getNewDishRecommend = (restaurantId, limit = 6) =>
  api.get('/customer/recommend/new', { params: { restaurantId, limit } })
export const getPairingRecommend = (restaurantId, cartDishIds, limit = 4) =>
  api.post('/customer/recommend/pairing', cartDishIds, { params: { restaurantId, limit } })

// 购物车提示相关
export const getCommonRemarks = (restaurantId) =>
  api.get('/customer/cart/remarks', { params: { restaurantId } })
export const getCartTips = (restaurantId, cartAmount) =>
  api.get('/customer/cart/tips', { params: { restaurantId, cartAmount } })
export const getFullReductionRules = (restaurantId) =>
  api.get('/customer/cart/reductions', { params: { restaurantId } })

export default api
