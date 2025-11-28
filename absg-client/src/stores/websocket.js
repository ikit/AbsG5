import { defineStore } from 'pinia'

export const useWebSocketStore = defineStore('websocket', {
  state: () => ({
    // WebSocket connection state
    isOnline: false,
    isConnecting: false,
    
    // Last received message
    lastMessage: null,
    
    // Connection info
    socket: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectDelay: 3000,
    
    // Message history (optional, for debugging)
    messageHistory: []
  }),

  getters: {
    /**
     * Check if WebSocket is connected
     */
    isConnected: (state) => state.isOnline && state.socket !== null,
    
    /**
     * Get connection status
     */
    connectionStatus: (state) => {
      if (state.isConnecting) return 'connecting'
      if (state.isOnline) return 'online'
      return 'offline'
    },
    
    /**
     * Check if can reconnect
     */
    canReconnect: (state) => state.reconnectAttempts < state.maxReconnectAttempts
  },

  actions: {
    /**
     * Set WebSocket connection status
     * @param {Boolean} status - Online status
     */
    setOnlineStatus(status) {
      this.isOnline = status
      if (status) {
        this.reconnectAttempts = 0
        this.isConnecting = false
      }
    },

    /**
     * Set connecting status
     * @param {Boolean} status - Connecting status
     */
    setConnecting(status) {
      this.isConnecting = status
    },

    /**
     * Store received message
     * @param {Object} message - WebSocket message
     */
    receiveMessage(message) {
      this.lastMessage = message
      
      // Optionally store in history (limit to last 50 messages)
      this.messageHistory.unshift({
        ...message,
        timestamp: new Date()
      })
      if (this.messageHistory.length > 50) {
        this.messageHistory.pop()
      }
    },

    /**
     * Send message through WebSocket
     * @param {Object} message - Message to send
     * @returns {Boolean} Success status
     */
    sendMessage(message) {
      if (!this.isConnected) {
        console.warn('WebSocket not connected, cannot send message')
        return false
      }

      try {
        // Access global socket instance
        if (window.$socket && window.$socket.readyState === WebSocket.OPEN) {
          if (typeof window.$socket.sendObj === 'function') {
            window.$socket.sendObj(message)
          } else {
            window.$socket.send(JSON.stringify(message))
          }
          return true
        }
        return false
      } catch (error) {
        console.error('Failed to send WebSocket message:', error)
        return false
      }
    },

    /**
     * Set socket instance
     * @param {WebSocket} socket - WebSocket instance
     */
    setSocket(socket) {
      this.socket = socket
      // Also set global reference for backward compatibility
      if (typeof window !== 'undefined') {
        window.$socket = socket
      }
    },

    /**
     * Handle connection opened
     */
    onOpen() {
      console.log('WebSocket connected')
      this.setOnlineStatus(true)
    },

    /**
     * Handle connection closed
     */
    onClose() {
      console.log('WebSocket disconnected')
      this.setOnlineStatus(false)
      
      // Attempt reconnection if possible
      if (this.canReconnect) {
        this.reconnectAttempts++
        console.log(`Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        setTimeout(() => {
          this.setConnecting(true)
          // Reconnection logic should be handled by the WebSocket plugin
        }, this.reconnectDelay)
      }
    },

    /**
     * Handle connection error
     * @param {Error} error - Error object
     */
    onError(error) {
      console.error('WebSocket error:', error)
      this.setOnlineStatus(false)
    },

    /**
     * Handle incoming message
     * @param {Object} data - Message data
     */
    onMessage(data) {
      this.receiveMessage(data)
      
      // Emit custom event for components to listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ws-message', { detail: data }))
      }
    },

    /**
     * Reset reconnection attempts
     */
    resetReconnectAttempts() {
      this.reconnectAttempts = 0
    },

    /**
     * Clear message history
     */
    clearHistory() {
      this.messageHistory = []
    },

    /**
     * Disconnect WebSocket
     */
    disconnect() {
      if (this.socket) {
        this.socket.close()
        this.socket = null
      }
      if (typeof window !== 'undefined') {
        window.$socket = null
      }
      this.setOnlineStatus(false)
      this.lastMessage = null
    },

    /**
     * Reset store state
     */
    reset() {
      this.disconnect()
      this.isConnecting = false
      this.reconnectAttempts = 0
      this.messageHistory = []
    }
  }
})
