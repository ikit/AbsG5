# Pinia Stores Migration Guide

## Overview

This directory contains the Pinia stores that replace the old Vuex store. The migration is designed to be backward compatible, allowing gradual migration of components.

## Store Structure

### User Store (`user.js`)
Manages user authentication and profile data.

**State:**
- `user`: Current user object
- `isAuthenticated`: Authentication status

**Getters:**
- `currentUser`: Get current user
- `isLoggedIn`: Check if user is logged in
- `userId`, `username`, `userRoles`, `isAdmin`: User properties
- `avatarUrl`: User avatar URL

**Actions:**
- `setCurrentUser(user)`: Set current user
- `updateUser(userData)`: Update user data
- `login(credentials)`: Log in user
- `logout()`: Log out user
- `checkSession()`: Check session validity
- `changePassword(passwordData)`: Change password
- `updateProfile(profileData)`: Update profile

### Main Store (`main.js`)
Manages global application state (notifications, settings, photo gallery, etc.)

**State:**
- `citation`: Random citation
- `notifications`: User notifications
- `settings`: Application settings
- `photosGallery`: Photo gallery state
- `agpaMeta`: AGPA metadata
- `notif`, `warning`, `error`, `snack`: UI notifications

## Migration Guide

### For New Components (Recommended)

Use Pinia stores directly with the Composition API:

```vue
<script setup>
import { useUserStore } from '@/stores/user'
import { useMainStore } from '@/stores/main'

const userStore = useUserStore()
const mainStore = useMainStore()

// Access state
const user = computed(() => userStore.currentUser)
const isLoggedIn = computed(() => userStore.isLoggedIn)

// Call actions
const handleLogin = async () => {
  await userStore.login({ username, password })
}
</script>
```

### For Existing Components (Backward Compatible)

Components using Vuex syntax continue to work:

```vue
<script>
import { mapState } from '@/stores/helpers'

export default {
  computed: {
    ...mapState(['user', 'settings', 'notifications'])
  },
  methods: {
    async login() {
      await this.$store.dispatch('login', credentials)
    }
  }
}
</script>
```

### Gradual Migration Steps

1. **Keep using Vuex syntax** - All existing code continues to work
2. **Update imports** - Change `from 'vuex'` to `from '@/stores/helpers'`
3. **Migrate to Pinia** - When refactoring, use `useUserStore()` directly
4. **Remove Vuex** - Once all components are migrated, remove Vuex dependency

## Backward Compatibility

The `helpers.js` file provides:
- `mapState()` and `mapActions()` that work like Vuex
- `store.commit()` and `store.dispatch()` compatibility layer
- Automatic delegation to appropriate stores (user vs main)

## Testing

```javascript
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should login user', async () => {
    const store = useUserStore()
    await store.login({ username: 'test', password: 'test' })
    expect(store.isLoggedIn).toBe(true)
  })
})
```

## Migration Status

- [x] User store created
- [x] Backward compatibility layer
- [ ] Migrate all components to use new stores
- [ ] Remove Vuex dependency
