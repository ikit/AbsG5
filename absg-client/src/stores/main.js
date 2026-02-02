import { defineStore } from 'pinia'
import axios from 'axios'
import { format } from 'date-fns'
import { parseAxiosResponse } from '../middleware/CommonHelper'
import { useUserStore } from './user'
import { usePhotoGalleryStore } from './photoGallery'
import { useAgpaStore } from './agpa'
import { useWebSocketStore } from './websocket'

export const useMainStore = defineStore('main', {
  state: () => ({
    isInitialized: false,
    citation: null,
    // DEPRECATED: Use useUserStore() instead
    user: null,
    settings: null,
    // DEPRECATED: Use useWebSocketStore() instead
    wsOnline: false,
    wsMessage: null,
    // DEPRECATED: Use usePhotoGalleryStore() instead
    photosGallery: [],
    photosGalleryIndex: 0,
    photosGalleryDisplayed: false,
    photoMetadataEditorDisplayed: false,
    // DEPRECATED: Use useAgpaStore() instead
    agpaMeta: null,
    // UI notifications (kept in main store)
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
      log: "",
      htmlError: ""
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
    }
  },

  actions: {
    // DEPRECATED: Use useUserStore().setCurrentUser() instead
    setCurrentUser(user) {
      const userStore = useUserStore()
      userStore.setCurrentUser(user)
      // Keep in sync for backward compatibility, add avatarUrl
      if (user && user.id) {
        const idAsStr = `${user.id}`
        user.avatarUrl = `/files/avatars/${idAsStr.padStart(3, '0')}.png`
      }
      this.user = user
    },

    // DEPRECATED: Use useUserStore().updateUser() instead
    updateUser(user) {
      const userStore = useUserStore()
      userStore.updateUser(user)
      // Keep in sync for backward compatibility, add avatarUrl
      if (user && user.id) {
        const idAsStr = `${user.id}`
        user.avatarUrl = `/files/avatars/${idAsStr.padStart(3, '0')}.png`
      }
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

    // DEPRECATED: Use useAgpaStore().updateMeta() instead
    updateAgpaMeta(meta) {
      const agpaStore = useAgpaStore()
      agpaStore.updateMeta(meta)
      // Keep in sync
      this.agpaMeta = agpaStore.meta
    },

    updateSettings(settings) {
      this.settings = settings
    },

    // DEPRECATED: Use usePhotoGalleryStore().resetGallery() instead
    photosGalleryReset(gallery) {
      const galleryStore = usePhotoGalleryStore()
      galleryStore.resetGallery(gallery)
      // Keep in sync
      this.photosGallery = galleryStore.photos
      this.photosGalleryIndex = galleryStore.currentIndex
    },

    // DEPRECATED: Use usePhotoGalleryStore().showEditor() instead
    photoMetadataEditorDisplay() {
      const galleryStore = usePhotoGalleryStore()
      galleryStore.showEditor()
      // Keep in sync
      this.photoMetadataEditorDisplayed = galleryStore.isEditorDisplayed
    },

    // DEPRECATED: Use usePhotoGalleryStore().hideEditor() instead
    photoMetadataEditorHide() {
      const galleryStore = usePhotoGalleryStore()
      galleryStore.hideEditor()
      // Keep in sync
      this.photoMetadataEditorDisplayed = galleryStore.isEditorDisplayed
    },

    // DEPRECATED: Use usePhotoGalleryStore().showGallery() instead
    photosGalleryDisplay() {
      const galleryStore = usePhotoGalleryStore()
      galleryStore.showGallery()
      // Keep in sync
      this.photosGalleryDisplayed = galleryStore.isDisplayed
    },

    // DEPRECATED: Use usePhotoGalleryStore().hideGallery() instead
    photosGalleryHide() {
      const galleryStore = usePhotoGalleryStore()
      galleryStore.hideGallery()
      // Keep in sync
      this.photosGalleryDisplayed = galleryStore.isDisplayed
      this.photoMetadataEditorDisplayed = galleryStore.isEditorDisplayed
    },

    // DEPRECATED: Use usePhotoGalleryStore().nextPhoto() instead
    photosGalleryNext() {
      const galleryStore = usePhotoGalleryStore()
      galleryStore.nextPhoto()
      // Keep in sync
      this.photosGalleryIndex = galleryStore.currentIndex
    },

    // DEPRECATED: Use usePhotoGalleryStore().previousPhoto() instead
    photosGalleryPrev() {
      const galleryStore = usePhotoGalleryStore()
      galleryStore.previousPhoto()
      // Keep in sync
      this.photosGalleryIndex = galleryStore.currentIndex
    },

    // DEPRECATED: Use usePhotoGalleryStore().setIndex() instead
    photosGallerySetIndex(index) {
      const galleryStore = usePhotoGalleryStore()
      galleryStore.setIndex(index)
      // Keep in sync
      this.photosGalleryIndex = galleryStore.currentIndex
    },

    // UI notification actions
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
      this.warning.log = format(new Date(), 'yyyy.MM.dd.HH.mm.ss')
      this.warning.displayed = true
    },

    onError(axiosError) {
      console.error(axiosError)

      this.error.query = axiosError?.config
        ? `${axiosError.config.method.toUpperCase()} ${axiosError.config.url}`
        : ''
      this.error.log = format(new Date(), 'yyyy.MM.dd.HH.mm.ss')
      this.error.displayed = true

      if (axiosError.response) {
        this.error.htmlError = `${axiosError.response.status} ${axiosError.response.statusText}`
        this.error.msg = axiosError.response.data?.message || axiosError.message || axiosError
      } else if (axiosError.request) {
        this.error.htmlError = `${axiosError.request.status} ${axiosError.request.statusText}`
        this.error.msg = axiosError.message || axiosError
      } else {
        this.error.htmlError = 'Probleme IHM (probablement)'
        this.error.msg = axiosError.message || axiosError
      }
    },

    async initStore() {
      if (!this.isInitialized) {
        try {
          const response = await axios.get(`/api/welcome`)
          const data = parseAxiosResponse(response)
          if (data) {
            if (data.settings) {
              this.updateSettings(data.settings)
            }
            if (data.citation) {
              this.updateCitation(data.citation)
            }
          }
          this.isInitialized = true
        } catch (error) {
          console.error('Failed to initialize store:', error)
        }
      }
    },

    // DEPRECATED: Use useAgpaStore().initialize() instead
    async initAGPA() {
      const agpaStore = useAgpaStore()
      if (!agpaStore.isInitialized) {
        try {
          await agpaStore.initialize()
          // Keep in sync
          this.agpaMeta = agpaStore.meta
        } catch (error) {
          console.error('Failed to initialize AGPA:', error)
        }
      }
    },

    // DEPRECATED: Use useWebSocketStore().sendMessage() instead
    sendWsMessage(message) {
      const wsStore = useWebSocketStore()
      wsStore.sendMessage(message)
    },

    // DEPRECATED: Use useWebSocketStore().setOnlineStatus() instead
    setWsOnline(status) {
      const wsStore = useWebSocketStore()
      wsStore.setOnlineStatus(status)
      // Keep in sync
      this.wsOnline = wsStore.isOnline
    },

    // DEPRECATED: Use useWebSocketStore().receiveMessage() instead
    setWsMessage(message) {
      const wsStore = useWebSocketStore()
      wsStore.receiveMessage(message)
      // Keep in sync
      this.wsMessage = wsStore.lastMessage
    }
  }
})
