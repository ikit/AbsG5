import { defineStore } from 'pinia'
import axios from 'axios'
import { getModuleInfo, getPeopleAvatar, parseAxiosResponse } from '../middleware/CommonHelper'
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useUserStore } from './user'

export const useMainStore = defineStore('main', {
  state: () => ({
    isInitialized: false,
    citation: null,
    // DEPRECATED: Use useUserStore() instead
    user: null,
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
    // Notification
    notif: {
      displayed: false,
      title: "",
      msg: "",
      log: ""
    },
    // Warning
    warning: {
      displayed: false,
      msg: "",
      log: ""
    },
    // Erreur
    error: {
      displayed: false,
      query: "",
      msg: "",
      log: ""
    },
    // Snackbar
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

    updateNotifications(notifications) {
      this.notifications = notifications.map(e => {
        const m = getModuleInfo(e.module)
        return {
          id: e.id,
          module: m,
          message: e.message,
          datetime: new Date(e.datetime),
          dateLabel: format(new Date(e.datetime), "dd MMM HH'h'mm", {locale: fr}),
          url: getPeopleAvatar(e).url,
          read: e.read,
          data: e.data
        }
      })
      this.unreadNotifications = this.notifications.filter(e => !e.read).length
    },

    readAllNotification() {
      for (const n of this.notifications) {
        n.read = true
      }
      this.unreadNotifications = 0
      axios.get(`/api/markAsRead/all`)
    },

    readNotification(notification) {
      const idx = this.notifications.findIndex(e => e.datetime === notification.datetime)
      if (idx > -1) {
        this.notifications[idx].read = true
        this.unreadNotifications -= 1
        axios.get(`/api/markAsRead/${notification.id}`)
      }
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

    onSnack(msg) {
      this.snack.msg = msg
      this.snack.displayed = true
    },

    onNotif(info) {
      this.notif.title = info[0]
      this.notif.msg = info[1]
      this.notif.displayed = true
    },

    onWarning(message) {
      this.warning.msg = message
      this.warning.log = format(new Date(), "yyyy.MM.dd.HH.mm.ss")
      this.warning.displayed = true
    },

    onError(axiosError) {
      console.log(axiosError)
      this.error.query = axiosError && axiosError.config ? `${axiosError.config.method.toUpperCase()} ${axiosError.config.url}` : ""
      this.error.log = format(new Date(), "yyyy.MM.dd.HH.mm.ss")
      this.error.displayed = true

      if (axiosError.response) {
        this.error.htmlError = `${axiosError.response.status} ${axiosError.response.statusText}`
        this.error.msg = axiosError.response.data ? axiosError.response.data.message : axiosError
      } else if (axiosError.request) {
        this.error.htmlError = `${axiosError.request.status} ${axiosError.request.statusText}`
        this.error.msg = axiosError
      } else {
        this.error.htmlError = "Probleme IHM (probablement)"
        this.error.msg = axiosError
      }
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
