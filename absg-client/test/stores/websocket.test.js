import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWebSocketStore } from '@/stores/websocket'

describe('WebSocket Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should initialize with offline status', () => {
      const store = useWebSocketStore()
      expect(store.isOnline).toBe(false)
      expect(store.isConnecting).toBe(false)
      expect(store.socket).toBeNull()
      expect(store.lastMessage).toBeNull()
    })

    it('should have correct initial getters', () => {
      const store = useWebSocketStore()
      expect(store.isConnected).toBe(false)
      expect(store.connectionStatus).toBe('offline')
      expect(store.canReconnect).toBe(true)
    })
  })

  describe('Connection Status', () => {
    it('should set online status', () => {
      const store = useWebSocketStore()

      store.setOnlineStatus(true)

      expect(store.isOnline).toBe(true)
      expect(store.connectionStatus).toBe('online')
      expect(store.reconnectAttempts).toBe(0)
    })

    it('should set connecting status', () => {
      const store = useWebSocketStore()

      store.setConnecting(true)

      expect(store.isConnecting).toBe(true)
      expect(store.connectionStatus).toBe('connecting')
    })
  })

  describe('Message Handling', () => {
    it('should receive and store message', () => {
      const store = useWebSocketStore()
      const message = { type: 'notification', data: 'Test message' }

      store.receiveMessage(message)

      expect(store.lastMessage).toEqual(message)
      expect(store.messageHistory).toHaveLength(1)
      expect(store.messageHistory[0]).toMatchObject(message)
    })

    it('should limit message history to 50 messages', () => {
      const store = useWebSocketStore()

      for (let i = 0; i < 60; i++) {
        store.receiveMessage({ id: i, data: `Message ${i}` })
      }

      expect(store.messageHistory).toHaveLength(50)
      expect(store.messageHistory[0].id).toBe(59)
      expect(store.messageHistory[49].id).toBe(10)
    })

    it('should clear message history', () => {
      const store = useWebSocketStore()
      store.receiveMessage({ data: 'Test' })

      store.clearHistory()

      expect(store.messageHistory).toEqual([])
    })
  })

  describe('Reconnection', () => {
    it('should track reconnection attempts', () => {
      const store = useWebSocketStore()

      store.onClose()
      expect(store.reconnectAttempts).toBe(1)

      store.onClose()
      expect(store.reconnectAttempts).toBe(2)
    })

    it('should check if can reconnect', () => {
      const store = useWebSocketStore()

      expect(store.canReconnect).toBe(true)

      store.reconnectAttempts = 5
      expect(store.canReconnect).toBe(false)
    })

    it('should reset reconnection attempts', () => {
      const store = useWebSocketStore()
      store.reconnectAttempts = 3

      store.resetReconnectAttempts()

      expect(store.reconnectAttempts).toBe(0)
    })
  })

  describe('Lifecycle', () => {
    it('should handle connection opened', () => {
      const store = useWebSocketStore()

      store.onOpen()

      expect(store.isOnline).toBe(true)
      expect(store.reconnectAttempts).toBe(0)
    })

    it('should handle connection closed', () => {
      const store = useWebSocketStore()
      store.setOnlineStatus(true)

      store.onClose()

      expect(store.isOnline).toBe(false)
    })

    it('should disconnect', () => {
      const store = useWebSocketStore()
      store.setOnlineStatus(true)
      store.receiveMessage({ data: 'Test' })

      store.disconnect()

      expect(store.isOnline).toBe(false)
      expect(store.socket).toBeNull()
      expect(store.lastMessage).toBeNull()
    })

    it('should reset store state', () => {
      const store = useWebSocketStore()
      store.setOnlineStatus(true)
      store.receiveMessage({ data: 'Test' })
      store.reconnectAttempts = 3

      store.reset()

      expect(store.isOnline).toBe(false)
      expect(store.isConnecting).toBe(false)
      expect(store.reconnectAttempts).toBe(0)
      expect(store.messageHistory).toEqual([])
    })
  })
})
