// Pinia helpers that mimic Vuex mapState/mapActions
import { useMainStore } from './main'

/**
 * Maps Pinia state to component computed properties (like Vuex mapState)
 * Usage: computed: { ...mapPiniaState(['user', 'settings']) }
 */
export function mapPiniaState(keys) {
  const map = {}
  keys.forEach(key => {
    map[key] = function() {
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
    // Return the store itself so that state properties are accessible
    // e.g., store.state.user works because it accesses store.user
    return useMainStore()
  },
  commit(action, payload) {
    const store = useMainStore()
    if (typeof store[action] === 'function') {
      store[action](payload)
    } else {
      console.warn(`Action ${action} not found in Pinia store`)
    }
  },
  dispatch(action, payload) {
    const store = useMainStore()
    if (typeof store[action] === 'function') {
      return store[action](payload)
    } else {
      console.warn(`Action ${action} not found in Pinia store`)
      return Promise.resolve()
    }
  }
}
