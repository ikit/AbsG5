// Pinia helpers that mimic Vuex mapState/mapActions
import { useMainStore } from './main'
import { useUserStore } from './user'

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
        const userStore = useUserStore()
        if (key === 'user' || key === 'currentUser') {
          return userStore.currentUser
        }
        return userStore[key]
      }
      // Otherwise use main store
      const store = useMainStore()
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
      const store = useMainStore()
      return store[key](...args)
    }
  })
  return map
}

// For backward compatibility, export as mapState and mapActions
export const mapState = mapPiniaState
export const mapActions = mapPiniaActions

/**
 * Vuex-like store object for backward compatibility
 * Allows using store.commit() and store.dispatch() with Pinia
 */
export default {
  get state() {
    // Return a proxy that delegates to appropriate stores
    const mainStore = useMainStore()
    const userStore = useUserStore()
    
    return new Proxy(mainStore, {
      get(target, prop) {
        // Delegate user-related properties to userStore
        if (prop === 'user' || prop === 'currentUser') {
          return userStore.currentUser
        }
        if (prop === 'isLoggedIn' || prop === 'isAuthenticated') {
          return userStore.isLoggedIn
        }
        // Otherwise use main store
        return target[prop]
      }
    })
  },
  commit(action, payload) {
    // Check if it's a user action
    const userActions = ['setCurrentUser', 'updateUser', 'logUser', 'logoutUser']
    if (userActions.includes(action)) {
      const userStore = useUserStore()
      const mainStore = useMainStore()
      // Call both for backward compatibility
      if (typeof mainStore[action] === 'function') {
        mainStore[action](payload)
      }
      return
    }
    
    const store = useMainStore()
    if (typeof store[action] === 'function') {
      store[action](payload)
    } else {
      console.warn(`Action ${action} not found in Pinia store`)
    }
  },
  dispatch(action, payload) {
    // Check if it's a user action
    const userActions = ['login', 'logout', 'checkSession', 'changePassword', 'updateProfile']
    if (userActions.includes(action)) {
      const userStore = useUserStore()
      if (typeof userStore[action] === 'function') {
        return userStore[action](payload)
      }
    }
    
    const store = useMainStore()
    if (typeof store[action] === 'function') {
      return store[action](payload)
    } else {
      console.warn(`Action ${action} not found in Pinia store`)
      return Promise.resolve()
    }
  }
}
