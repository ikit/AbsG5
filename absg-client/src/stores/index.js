import { createPinia } from 'pinia'

// Create and export Pinia instance
const pinia = createPinia()
export default pinia

// Export all stores
export { useMainStore } from './main'
export { useUserStore } from './user'
export { useNotificationStore } from './notification'
export { usePhotoGalleryStore } from './photoGallery'
export { useAgpaStore } from './agpa'
export { useWebSocketStore } from './websocket'

// Export helpers for backward compatibility
export { mapState, mapActions, mapPiniaState, mapPiniaActions } from './helpers'
export { store } from './helpers'
