// Export all stores
export { useMainStore } from './main'
export { useUserStore } from './user'
export { useNotificationStore } from './notification'
export { usePhotoGalleryStore } from './photoGallery'

// Export helpers for backward compatibility
export { mapState, mapActions, mapPiniaState, mapPiniaActions } from './helpers'
export { default as store } from './helpers'
