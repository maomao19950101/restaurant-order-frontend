import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { connectWebSocket, subscribe, disconnectWebSocket } from '../utils/websocket'
import { joinTable, addToSharedCart, updateSharedCartItem, removeSharedCartItem, getSharedCart } from '../api'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const restaurantId = ref(1)
  const tableId = ref(null)
  const remark = ref('')
  const showCart = ref(false)
  const memberId = ref(null)
  const memberName = ref('客人')
  const onlineMembers = ref(0)
  const isShared = ref(false)
  const version = ref(0)
  const lastAction = ref(null)

  const totalCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const totalPrice = computed(() => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0))

  async function joinTableSession(rId, tId, mName) {
    restaurantId.value = rId
    tableId.value = tId
    if (mName) memberName.value = mName
    try {
      const res = await joinTable({
        restaurantId: rId,
        tableId: tId,
        memberId: memberId.value,
        memberName: memberName.value,
      })
      const data = res.data
      memberId.value = data.memberId
      onlineMembers.value = data.onlineMembers
      if (data.cart && data.cart.items) {
        items.value = data.cart.items
        version.value = data.cart.version || 0
      }
      isShared.value = true
      return new Promise((resolve) => {
        connectWebSocket(() => {
          const topic = `/topic/table/${rId}:${tId}/cart`
          subscribe(topic, handleCartUpdate)
          resolve(data)
        })
      })
    } catch (e) {
      console.error('加入桌台失败:', e)
      throw e
    }
  }

  function handleCartUpdate(data) {
    console.log('[Cart] WS update:', data.type)
    switch (data.type) {
      case 'CART_UPDATE':
        if (data.cart) {
          items.value = data.cart.items || []
          version.value = data.cart.version || 0
        }
        if (data.action && data.memberId !== memberId.value) {
          lastAction.value = {
            type: data.action,
            memberId: data.memberId,
            memberName: data.memberName || '其他客人',
            dishName: data.dishName || '',
          }
        }
        break
      case 'MEMBER_JOIN':
        onlineMembers.value = data.onlineCount || 1
        if (data.memberId !== memberId.value) {
          lastAction.value = { type: 'JOIN', memberName: data.memberName || '新客人' }
        }
        break
      case 'MEMBER_LEAVE':
        onlineMembers.value = data.onlineCount || 0
        break
      case 'ORDER_SUBMITTED':
        items.value = []
        lastAction.value = {
          type: 'ORDER_SUBMITTED',
          orderNo: data.orderNo,
          memberName: data.memberId === memberId.value ? '你' : '其他客人',
        }
        break
    }
  }

  async function addItem(dish, quantity = 1, specIds = [], specs = [], itemRemark = '') {
    if (isShared.value) {
      try {
        const res = await addToSharedCart({
          restaurantId: restaurantId.value,
          tableId: tableId.value,
          memberId: memberId.value,
          memberName: memberName.value,
          dishId: dish.id,
          dishName: dish.name,
          price: dish.price,
          quantity,
          specIds,
          specs: specs.join ? specs.join('/') : specs,
          remark: itemRemark,
        })
        if (res.data) {
          items.value = res.data.items || []
          version.value = res.data.version || 0
        }
      } catch (e) {
        console.error('添加菜品失败:', e)
        _addItemLocal(dish, quantity, specIds, specs, itemRemark)
      }
    } else {
      _addItemLocal(dish, quantity, specIds, specs, itemRemark)
    }
  }

  function _addItemLocal(dish, quantity, specIds, specs, itemRemark) {
    const key = `${dish.id}_${specIds.sort().join(',')}`
    const existing = items.value.find(
      (i) => `${i.dishId}_${(i.specIds || []).sort().join(',')}` === key
    )
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({
        dishId: dish.id,
        name: dish.name,
        price: dish.price,
        quantity,
        specIds,
        specs,
        remark: itemRemark,
        addedBy: memberId.value,
        addedByName: memberName.value,
      })
    }
  }

  async function updateQuantity(dishId, specIds, quantity) {
    if (isShared.value) {
      try {
        const res = await updateSharedCartItem({
          restaurantId: restaurantId.value,
          tableId: tableId.value,
          dishId,
          specIds: specIds || [],
          quantity,
        })
        if (res.data) {
          items.value = res.data.items || []
          version.value = res.data.version || 0
        }
      } catch (e) {
        _updateQuantityLocal(dishId, specIds, quantity)
      }
    } else {
      _updateQuantityLocal(dishId, specIds, quantity)
    }
  }

  function _updateQuantityLocal(dishId, specIds, quantity) {
    const key = `${dishId}_${(specIds || []).sort().join(',')}`
    const idx = items.value.findIndex(
      (i) => `${i.dishId}_${(i.specIds || []).sort().join(',')}` === key
    )
    if (idx === -1) return
    if (quantity <= 0) {
      items.value.splice(idx, 1)
    } else {
      items.value[idx].quantity = quantity
    }
  }

  async function removeItem(dishId, specIds) {
    if (isShared.value) {
      try {
        const res = await removeSharedCartItem({
          restaurantId: restaurantId.value,
          tableId: tableId.value,
          dishId,
          specIds: specIds || [],
        })
        if (res.data) {
          items.value = res.data.items || []
          version.value = res.data.version || 0
        }
      } catch (e) {
        _removeItemLocal(dishId, specIds)
      }
    } else {
      _removeItemLocal(dishId, specIds)
    }
  }

  function _removeItemLocal(dishId, specIds) {
    const key = `${dishId}_${(specIds || []).sort().join(',')}`
    const idx = items.value.findIndex(
      (i) => `${i.dishId}_${(i.specIds || []).sort().join(',')}` === key
    )
    if (idx !== -1) items.value.splice(idx, 1)
  }

  function clearCart() {
    items.value = []
    remark.value = ''
    showCart.value = false
  }

  function toggleCart() {
    showCart.value = !showCart.value
  }

  function leaveSession() {
    disconnectWebSocket()
    isShared.value = false
    items.value = []
  }

  return {
    items, restaurantId, tableId, remark, showCart,
    memberId, memberName, onlineMembers, isShared, version, lastAction,
    totalCount, totalPrice,
    joinTableSession, addItem, updateQuantity, removeItem,
    clearCart, toggleCart, leaveSession,
  }
})
