import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs.min.js'

let stompClient = null
let reconnectTimer = null
const subscribers = new Map()

export function connectWebSocket(onConnect) {
  if (stompClient && stompClient.connected) {
    if (onConnect) onConnect()
    return
  }
  stompClient = new Client({
    webSocketFactory: () => new SockJS('/ws'),
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      console.log('[WS] Connected')
      for (const [topic, callback] of subscribers) {
        _subscribe(topic, callback)
      }
      if (onConnect) onConnect()
    },
    onStompError: (frame) => {
      console.error('[WS] STOMP error:', frame.headers?.message)
    },
    onDisconnect: () => {
      console.log('[WS] Disconnected')
    }
  })
  stompClient.activate()
}

export function disconnectWebSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (stompClient) {
    stompClient.deactivate()
    stompClient = null
  }
  subscribers.clear()
}

function _subscribe(topic, callback) {
  if (!stompClient || !stompClient.connected) return
  const sub = stompClient.subscribe(topic, (message) => {
    try {
      const data = JSON.parse(message.body)
      callback(data)
    } catch (e) {
      console.error('[WS] Parse error:', e)
    }
  })
  return sub
}

export function subscribe(topic, callback) {
  subscribers.set(topic, callback)
  if (stompClient && stompClient.connected) {
    _subscribe(topic, callback)
  }
}

export function unsubscribe(topic) {
  subscribers.delete(topic)
}

export function sendMessage(destination, body) {
  if (!stompClient || !stompClient.connected) {
    console.warn('[WS] Not connected, cannot send')
    return false
  }
  stompClient.publish({
    destination,
    body: JSON.stringify(body),
  })
  return true
}

export function isConnected() {
  return stompClient && stompClient.connected
}
