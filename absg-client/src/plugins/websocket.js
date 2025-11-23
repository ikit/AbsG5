// WebSocket plugin for Vue 3
import { useMainStore } from '../stores/main'

export default {
  install: (app, options) => {
    const { url, format = 'json', reconnection = true, reconnectionDelay = 3000 } = options
    
    let socket = null
    let reconnectTimer = null
    let reconnectCount = 0
    let mainStore = null
    
    // Get the Pinia store instance
    try {
      mainStore = useMainStore()
    } catch (e) {
      console.warn('Pinia store not available yet, WebSocket state updates will be limited')
    }
    
    const connect = () => {
      socket = new WebSocket(url)
      
      // Helper method to send messages
      socket.sendObj = function(obj) {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(obj))
        }
      }
      
      socket.onopen = (event) => {
        console.log('WebSocket connected')
        reconnectCount = 0
        if (mainStore) {
          mainStore.wsOnline = true
        }
        app.config.globalProperties.$socket = socket
        // Also make it available globally for legacy code
        window.$socket = socket
      }
      
      socket.onclose = (event) => {
        console.log('WebSocket disconnected')
        if (mainStore) {
          mainStore.wsOnline = false
        }
        
        if (reconnection && reconnectCount < 10) {
          reconnectTimer = setTimeout(() => {
            reconnectCount++
            console.log(`WebSocket reconnecting... (attempt ${reconnectCount})`)
            connect()
          }, reconnectionDelay)
        }
      }
      
      socket.onmessage = (event) => {
        let message = event.data
        if (format === 'json') {
          try {
            message = JSON.parse(event.data)
          } catch (e) {
            console.error('Failed to parse WebSocket message as JSON:', e)
          }
        }
        
        if (mainStore) {
          mainStore.wsMessage = message
        }
      }
      
      socket.onerror = (event) => {
        console.error('WebSocket error:', event)
      }
    }
    
    // Initialize connection
    connect()
    
    // Cleanup on app unmount
    app.config.globalProperties.$wsCleanup = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      if (socket) {
        socket.close()
      }
    }
  }
}
