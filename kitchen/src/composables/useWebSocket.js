import { ref, onUnmounted } from 'vue'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function useWebSocket(restaurantId, onMessage) {
  const connected = ref(false)
  let client = null
  let reconnectTimer = null

  function connect() {
    const wsUrl = `${window.location.protocol}//${window.location.host}/ws`

    client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        connected.value = true
        console.log('[WS] Connected')
        client.subscribe(`/topic/kitchen/${restaurantId}`, (message) => {
          try {
            const data = JSON.parse(message.body)
            onMessage(data)
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
        connected.value = false
      }
    })

    client.activate()
  }

  function disconnect() {
    if (client) {
      client.deactivate()
      client = null
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    connected.value = false
  }

  onUnmounted(() => {
    disconnect()
  })

  return { connected, connect, disconnect }
}
