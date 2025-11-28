import { defineStore } from 'pinia'
import axios from 'axios'
import { parseAxiosResponse } from '../middleware/CommonHelper'
import { useUserStore } from './user'
import { useNotificationStore } from './notification'

export const useMainStore = defineStore('main', {
  state: () => ({
    isInitialized: false,
    citation: null,
    // DEPRECATED: Use useUserStore() instead
    user: null,
    // DEPRECATED: Use useNotificationStore() instead
    notifications: [],
    unreadNotifications: 0,
    settings: null,
    // Websocket connection
    wsOnline: false,
    wsMessage: null,
    // Galerie photos
    photosGallery: [],
    photosGalleryIndex: 0,
    photosGalleryDisplayed: false,
    // Editeur photo
    photoMetadataEditorDisplayed: false,
    agpaMeta: null,
    // DEPRECATED: Use useNotificationStore() instead
    notif: {
      displayed: false,
      title: "",
      msg: "",
      log: ""
    },
    warning: {
      displayed: false,
      msg: "",
      log: ""
    },
    error: {
      displayed: false,
      query: "",
      msg: "",
      log: ""
    },
    snack: {
      displayed: false,
      msg: "",
    }
  }),

  getters: {
    // Backward compatibility getters - delegate to userStore
    currentUser() {
      const userStore = useUserStore()
      return userStore.currentUser
    },
    isLoggedIn() {
      const userStore = useUserStore()
      return userStore.isLoggedIn
    },
    // Backward compatibility getters - delegate to notificationStore
    allNotifications() {
      const notifStore = useNotificationStore()
      return notifStore.allNotifications
    },
    unreadCount() {
      const notifStore = useNotificationStore()
      return notifStore.unreadCount
    }
  },

  actions: {
    // DEPRECATED: Use useUserStore().setCurrentUser() instead
    setCurrentUser(user) {
      const userStore = useUserStore()
      userStore.setCurrentUser(user)
      // Keep in sync for backward compatibility
      this.user = user
    },

    // DEPRECATED: Use useUserStore().updateUser() instead
    updateUser(user) {
      const userStore = useUserStore()
      userStore.updateUser(user)
      // Keep in sync for backward compatibility
      this.user = user
    },

    // DEPRECATED: Use useUserStore().login() instead
    async logUser(credentials) {
      const userStore = useUserStore()
      const user = await userStore.login(credentials)
      this.user = user
      return user
    },

    // DEPRECATED: Use useUserStore().logout() instead
    async logoutUser() {
      const userStore = useUserStore()
      await userStore.logout()
      this.user = null
    },

    updateCitation(citation) {
      if (citation) {
        citation.author = citation.author.surname ? citation.author.surname : citation.author.firstname
      }
      this.citation = citation
    },

    updateAgpaMeta(meta) {
      this.agpaMeta = meta
    },

    updateSettings(settings) {
      this.settings = settings
    },

    // DEPRECATED: Use useNotificationStore().updateNotifications() instead
    updateNotifications(notifications) {
      const notifStore = useNotificationStore()
      notifStore.updateNotifications(notifications)
      // Keep in sync for backward compatibility
      this.notifications = notifStore.notifications
      this.unreadNotifications = notifStore.unreadNotifications
    },

    // DEPRECATED: Use useNotificationStore().readAllNotifications() instead
    readAllNotification() {
      const notifStore = useNotificationStore()
      notifStore.readAllNotifications()
      // Keep in sync
      this.notifications = notifStore.notifications
      this.unreadNotifications = notifStore.unreadNotifications
    },

    // DEPRECATED: Use useNotificationStore().readNotification() instead
    readNotification(notification) {
      const notifStore = useNotificationStore()
      notifStore.readNotification(notification)
      // Keep in sync
      this.notifications = notifStore.notifications
      this.unreadNotifications = notifStore.unreadNotifications
    },

    photosGalleryReset(gallery) {
      this.photosGallery = gallery
      this.photosGalleryIndex = 0
    },

    photoMetadataEditorDisplay() {
      this.photoMetadataEditorDisplayed = true
    },

    photoMetadataEditorHide() {
      this.photoMetadataEditorDisplayed = false
    },

    photosGalleryDisplay() {
      this.photosGalleryDisplayed = true
    },

    photosGalleryHide() {
      this.photosGalleryDisplayed = false
      this.photoMetadataEditorDisplayed = false
    },

    photosGalleryNext() {
      if (this.photosGallery.length > 1) {
        this.photosGalleryIndex++
        this.photosGalleryIndex %= this.photosGallery.length
      }
    },

    photosGalleryPrev() {
      if (this.photosGallery.length > 1) {
        this.photosGalleryIndex--
        this.photosGalleryIndex %= this.photosGallery.length
        if (this.photosGalleryIndex < 0) {
          this.photosGalleryIndex = this.photosGallery.length - 1
        }
      }
    },

    photosGallerySetIndex(index) {
      this.photosGalleryIndex = index
    },

    // DEPRECATED: Use useNotificationStore().showSnack() instead
    onSnack(msg) {
      const notifStore = useNotificationStore()
      notifStore.showSnack(msg)
      // Keep in sync
      this.snack = notifStore.snack
    },

    // DEPRECATED: Use useNotificationStore().showNotif() instead
    onNotif(info) {
      const notifStore = useNotificationStore()
      notifStore.showNotif(info)
      // Keep in sync
      this.notif = notifStore.notif
    },

    // DEPRECATED: Use useNotificationStore().showWarning() instead
    onWarning(message) {
      const notifStore = useNotificationStore()
      notifStore.showWarning(message)
      // Keep in sync
      this.warning = notifStore.warning
    },

    // DEPRECATED: Use useNotificationStore().showError() instead
    onError(axiosError) {
      const notifStore = useNotificationStore()
      notifStore.showError(axiosError)
      // Keep in sync
      this.error = notifStore.error
    },

    async initStore() {
      if (!this.isInitialized) {
        try {
          const response = await axios.get(`/api/welcom`)
          const data = parseAxiosResponse(response)
          this.updateSettings(data.settings)
          this.updateCitation(data.citation)
          this.updateNotifications(data.notifications)
          this.isInitialized = true
        } catch (error) {
          console.error('Failed to initialize store:', error)
        }
      }
    },

    async initAGPA() {
      if (!this.agpaMeta) {
        try {
          const response = await axios.get(`/api/agpa`)
          this.updateAgpaMeta(parseAxiosResponse(response))
        } catch (error) {
          console.error('Failed to initialize AGPA:', error)
        }
      }
    },

    sendWsMessage(message) {
      console.log("WS send", message)
      // Access via app.config.globalProperties.$socket
      if (window.$socket && window.$socket.readyState === WebSocket.OPEN) {
        window.$socket.sendObj(message)
      }
    }
  }
})
