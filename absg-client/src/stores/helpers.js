// Pinia helpers that mimic Vuex mapState/mapActions
// OPTIMIZED: Lazy loading - helpers.js itself is lazy-loaded by router and components
// Stores are imported statically here, but this file is only loaded when actually needed

import { useMainStore } from './main'
import { useUserStore } from './user'
import { usePhotoGalleryStore } from './photoGallery'
import { useAgpaStore } from './agpa'
import { useWebSocketStore } from './websocket'

// Cache for store instances to avoid multiple instantiations
let mainStoreCache = null
let userStoreCache = null
let galleryStoreCache = null
let agpaStoreCache = null
let wsStoreCache = null

/**
 * Get store instance synchronously (uses cache to avoid multiple instantiations)
 * helpers.js is lazy-loaded, so these stores are only imported when helpers is used
 */
function getMainStoreSync() {
  if (!mainStoreCache) {
    mainStoreCache = useMainStore()
  }
  return mainStoreCache
}

function getUserStoreSync() {
  if (!userStoreCache) {
    userStoreCache = useUserStore()
  }
  return userStoreCache
}

function getPhotoGalleryStoreSync() {
  if (!galleryStoreCache) {
    galleryStoreCache = usePhotoGalleryStore()
  }
  return galleryStoreCache
}

function getAgpaStoreSync() {
  if (!agpaStoreCache) {
    agpaStoreCache = useAgpaStore()
  }
  return agpaStoreCache
}

function getWebSocketStoreSync() {
  if (!wsStoreCache) {
    wsStoreCache = useWebSocketStore()
  }
  return wsStoreCache
}

/**
 * Maps Pinia state to component computed properties (like Vuex mapState)
 * Usage: computed: { ...mapPiniaState(['user', 'settings']) }
 */
export function mapPiniaState(keys) {
  const map = {}
  keys.forEach(key => {
    map[key] = function() {
      // Check if it's a user-related property
      if (key === 'user' || key === 'currentUser' || key === 'isLoggedIn') {
        const userStore = getUserStoreSync()
        if (key === 'user' || key === 'currentUser') {
          return userStore.currentUser
        }
        return userStore[key]
      }

      // Check if it's UI notification-related property (warning, error, notif, snack - NOT user notifications)
      const uiNotifProps = ['notif', 'warning', 'error', 'snack']
      if (uiNotifProps.includes(key)) {
        const mainStore = getMainStoreSync()
        return mainStore[key]
      }

      // Check if it's a photo gallery property
      const galleryProps = ['photosGallery', 'photosGalleryIndex', 'photosGalleryDisplayed', 'photoMetadataEditorDisplayed']
      if (galleryProps.includes(key)) {
        const galleryStore = getPhotoGalleryStoreSync()
        if (key === 'photosGallery') return galleryStore.photos
        if (key === 'photosGalleryIndex') return galleryStore.currentIndex
        if (key === 'photosGalleryDisplayed') return galleryStore.isDisplayed
        if (key === 'photoMetadataEditorDisplayed') return galleryStore.isEditorDisplayed
      }

      // Check if it's an AGPA property
      if (key === 'agpaMeta') {
        const agpaStore = getAgpaStoreSync()
        return agpaStore.meta
      }

      // Check if it's a WebSocket property
      const wsProps = ['wsOnline', 'wsMessage']
      if (wsProps.includes(key)) {
        const wsStore = getWebSocketStoreSync()
        if (key === 'wsOnline') return wsStore.isOnline
        if (key === 'wsMessage') return wsStore.lastMessage
      }

      // Otherwise use main store
      const store = getMainStoreSync()
      return store[key]
    }
  })
  return map
}

/**
 * Maps Pinia actions to component methods (like Vuex mapActions)
 * Usage: methods: { ...mapPiniaActions(['updateUser', 'onError']) }
 */
export function mapPiniaActions(keys) {
  const map = {}
  keys.forEach(key => {
    map[key] = function(...args) {
      const store = getMainStoreSync()
      return store[key](...args)
    }
  })
  return map
}

// For backward compatibility, export as mapState and mapActions
export const mapState = mapPiniaState
export const mapActions = mapPiniaActions

// Cache the proxy to avoid creating it repeatedly (OPTIMIZATION)
let stateProxyCache = null

/**
 * Vuex-like store object for backward compatibility
 * Allows using store.commit() and store.dispatch() with Pinia
 */
export default {
  get state() {
    // Return cached proxy or create new one
    if (stateProxyCache) {
      return stateProxyCache
    }

    // Get stores lazily
    const mainStore = getMainStoreSync()
    const userStore = getUserStoreSync()
    const galleryStore = getPhotoGalleryStoreSync()
    const agpaStore = getAgpaStoreSync()

    stateProxyCache = new Proxy(mainStore, {
      get(target, prop) {
        // Delegate user-related properties to userStore
        if (prop === 'user' || prop === 'currentUser') {
          return userStore.currentUser
        }
        if (prop === 'isLoggedIn' || prop === 'isAuthenticated') {
          return userStore.isLoggedIn
        }

        // UI notifications (warning, error, notif, snack) are in mainStore
        const uiNotifProps = ['notif', 'warning', 'error', 'snack']
        if (uiNotifProps.includes(prop)) {
          return target[prop]
        }

        // Delegate photo gallery properties to photoGalleryStore
        if (prop === 'photosGallery') return galleryStore.photos
        if (prop === 'photosGalleryIndex') return galleryStore.currentIndex
        if (prop === 'photosGalleryDisplayed') return galleryStore.isDisplayed
        if (prop === 'photoMetadataEditorDisplayed') return galleryStore.isEditorDisplayed

        // Delegate AGPA properties to agpaStore
        if (prop === 'agpaMeta') return agpaStore.meta

        // Delegate WebSocket properties to webSocketStore
        const wsStore = getWebSocketStoreSync()
        if (prop === 'wsOnline') return wsStore.isOnline
        if (prop === 'wsMessage') return wsStore.lastMessage

        // Otherwise use main store
        return target[prop]
      }
    })

    return stateProxyCache
  },
  commit(action, payload) {
    const mainStore = getMainStoreSync()

    // Check if it's a user action
    const userActions = ['setCurrentUser', 'updateUser', 'logUser', 'logoutUser']
    if (userActions.includes(action)) {
      if (typeof mainStore[action] === 'function') {
        mainStore[action](payload)
      }
      return
    }

    // UI notification actions (onSnack, onNotif, onWarning, onError) are in mainStore
    const uiNotifActions = ['onSnack', 'onNotif', 'onWarning', 'onError']
    if (uiNotifActions.includes(action)) {
      if (typeof mainStore[action] === 'function') {
        mainStore[action](payload)
      }
      return
    }

    // Check if it's a photo gallery action
    const galleryActions = [
      'photosGalleryReset', 'photosGalleryDisplay', 'photosGalleryHide',
      'photosGalleryNext', 'photosGalleryPrev', 'photosGallerySetIndex',
      'photoMetadataEditorDisplay', 'photoMetadataEditorHide'
    ]
    if (galleryActions.includes(action)) {
      if (typeof mainStore[action] === 'function') {
        mainStore[action](payload)
      }
      return
    }

    // Check if it's an AGPA action
    const agpaActions = ['updateAgpaMeta', 'initAGPA']
    if (agpaActions.includes(action)) {
      if (typeof mainStore[action] === 'function') {
        mainStore[action](payload)
      }
      return
    }

    // Check if it's a WebSocket action
    const wsActions = ['sendWsMessage', 'setWsOnline', 'setWsMessage']
    if (wsActions.includes(action)) {
      if (typeof mainStore[action] === 'function') {
        mainStore[action](payload)
      }
      return
    }

    if (typeof mainStore[action] === 'function') {
      mainStore[action](payload)
    } else {
      console.warn(`Action ${action} not found in Pinia store`)
    }
  },
  dispatch(action, payload) {
    // Check if it's a user action
    const userActions = ['login', 'logout', 'checkSession', 'changePassword', 'updateProfile']
    if (userActions.includes(action)) {
      const userStore = getUserStoreSync()
      if (typeof userStore[action] === 'function') {
        return userStore[action](payload)
      }
    }

    // Check if it's an AGPA action
    const agpaActions = [
      'initialize', 'fetchCurrentEdition', 'fetchArchiveEdition',
      'fetchCategoryData', 'fetchPalmares', 'submitPhoto', 'submitVotes'
    ]
    if (agpaActions.includes(action)) {
      const agpaStore = getAgpaStoreSync()
      if (typeof agpaStore[action] === 'function') {
        return agpaStore[action](payload)
      }
    }

    // Check if it's a WebSocket action
    const wsActions = ['sendMessage', 'disconnect', 'connect']
    if (wsActions.includes(action)) {
      const wsStore = getWebSocketStoreSync()
      if (typeof wsStore[action] === 'function') {
        return wsStore[action](payload)
      }
    }

    const store = getMainStoreSync()
    if (typeof store[action] === 'function') {
      return store[action](payload)
    } else {
      console.warn(`Action ${action} not found in Pinia store`)
      return Promise.resolve()
    }
  }
}
