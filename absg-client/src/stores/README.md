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

### Notification Store (`notification.js`)
Manages user notifications and UI alerts.

**State:**
- `notifications`: List of user notifications (events history)
- `unreadNotifications`: Count of unread notifications
- `notif`: Info notification dialog state
- `warning`: Warning dialog state
- `error`: Error dialog state
- `snack`: Snackbar notification state

**Getters:**
- `unreadCount`: Number of unread notifications
- `hasUnread`: Boolean if there are unread notifications
- `allNotifications`: All notifications
- `unreadNotificationsList`: Only unread notifications

**Actions:**
- `updateNotifications(notifications)`: Update notifications from API
- `readAllNotifications()`: Mark all as read
- `readNotification(notification)`: Mark one as read
- `showSnack(msg)`: Show snackbar
- `showNotif(info)`: Show info dialog
- `showWarning(message)`: Show warning dialog
- `showError(axiosError)`: Show error dialog
- `fetchNotifications()`: Fetch from API

### Photo Gallery Store (`photoGallery.js`)
Manages photo gallery viewer and metadata editor.

**State:**
- `photos`: Array of photos in gallery
- `currentIndex`: Current photo index
- `isDisplayed`: Gallery visibility
- `isEditorDisplayed`: Metadata editor visibility

**Getters:**
- `currentPhoto`: Currently displayed photo
- `hasPhotos`: Boolean if gallery has photos
- `photoCount`: Number of photos
- `hasPrevious`, `hasNext`: Navigation availability
- `isGalleryOpen`, `isEditorOpen`: Visibility states

**Actions:**
- `resetGallery(photos)`: Load new photos
- `setIndex(index)`: Set current photo
- `nextPhoto()`, `previousPhoto()`: Navigate
- `showGallery()`, `hideGallery()`: Toggle gallery
- `showEditor()`, `hideEditor()`: Toggle editor
- `updateCurrentPhotoMetadata(metadata)`: Update photo
- `addPhoto(photo)`, `removePhoto(index)`: Manage photos
- `clearGallery()`: Clear all

### Main Store (`main.js`)
Manages global application state (settings, AGPA, etc.)

**State:**
- `citation`: Random citation
- `settings`: Application settings
- `agpaMeta`: AGPA metadata
- `wsOnline`, `wsMessage`: WebSocket state

## Migration Guide

### For New Components (Recommended)

Use Pinia stores directly with the Composition API:

```vue
<script setup>
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { usePhotoGalleryStore } from '@/stores/photoGallery'
import { useMainStore } from '@/stores/main'

const userStore = useUserStore()
const notifStore = useNotificationStore()
const galleryStore = usePhotoGalleryStore()
const mainStore = useMainStore()

// Access state
const user = computed(() => userStore.currentUser)
const isLoggedIn = computed(() => userStore.isLoggedIn)
const unreadCount = computed(() => notifStore.unreadCount)
const currentPhoto = computed(() => galleryStore.currentPhoto)

// Call actions
const handleLogin = async () => {
  await userStore.login({ username, password })
}

const handleError = (error) => {
  notifStore.showError(error)
}

const showPhotoGallery = (photos) => {
  galleryStore.resetGallery(photos)
  galleryStore.showGallery()
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
- [x] Notification store created
- [x] Photo gallery store created
- [x] Backward compatibility layer
- [ ] AGPA store
- [ ] WebSocket store
- [ ] Migrate all components to use new stores
- [ ] Remove Vuex dependency
