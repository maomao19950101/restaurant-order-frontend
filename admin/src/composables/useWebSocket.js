import { ref, onUnmounted } from 'vue'
import { Client } from '@stomp/stompjs'
import { ElNotification } from 'element-plus'

/**
 * STOMP WebSocket composable for admin order notifications
 * Connects to /ws and subscribes to /topic/admin/orders
 */
export function useWebSocket() {
  const connected = ref(false)
  let client = null

  const connect = (onMessage) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host

    client = new Client({
      brokerURL: `${protocol}//${host}/ws`,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        connected.value = true
        console.log('[WS] Connected')

        client.subscribe('/topic/admin/orders', (message) => {
          try {
            const order = JSON.parse(message.body)
            // 弹出通知
            ElNotification({
              title: '新订单提醒',
              message: `桌号 ${order.tableNo || '-'} 下了一个新订单，金额 ¥${order.totalAmount || 0}`,
              type: 'success',
              duration: 5000
            })
            // 回调通知组件刷新数据
            if (onMessage) onMessage(order)
          } catch (e) {
            console.error('[WS] Parse error:', e)
          }
        })
      },
      onDisconnect: () => {
        connected.value = false
        console.log('[WS] Disconnected')
      },
      onStompError: (frame) => {
        console.error('[WS] STOMP error:', frame.headers?.message)
      }
    })

    client.activate()
  }

  const disconnect = () => {
    if (client) {
      client.deactivate()
      client = null
    }
    connected.value = false
  }

  onUnmounted(() => {
    disconnect()
  })

  return { connected, connect, disconnect }
}
