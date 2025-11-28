import { defineStore } from 'pinia'
import axios from 'axios'
import { getModuleInfo, getPeopleAvatar } from '../middleware/CommonHelper'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    // User notifications (events history)
    notifications: [],
    unreadNotifications: 0,
    
    // UI notifications (popups/dialogs)
    notif: {
      displayed: false,
      title: '',
      msg: '',
      log: ''
    },
    warning: {
      displayed: false,
      msg: '',
      log: ''
    },
    error: {
      displayed: false,
      query: '',
      msg: '',
      log: '',
      htmlError: ''
    },
    snack: {
      displayed: false,
      msg: ''
    }
  }),

  getters: {
    unreadCount: (state) => state.unreadNotifications,
    hasUnread: (state) => state.unreadNotifications > 0,
    allNotifications: (state) => state.notifications,
    unreadNotificationsList: (state) => state.notifications.filter(n => !n.read)
  },

  actions: {
    /**
     * Update notifications list from API response
     * @param {Array} notifications - Raw notifications from API
     */
    updateNotifications(notifications) {
      this.notifications = notifications.map(e => {
        const m = getModuleInfo(e.module)
        return {
          id: e.id,
          module: m,
          message: e.message,
          datetime: new Date(e.datetime),
          dateLabel: format(new Date(e.datetime), "dd MMM HH'h'mm", { locale: fr }),
          url: getPeopleAvatar(e).url,
          read: e.read,
          data: e.data
        }
      })
      this.unreadNotifications = this.notifications.filter(e => !e.read).length
    },

    /**
     * Mark all notifications as read
     */
    async readAllNotifications() {
      for (const n of this.notifications) {
        n.read = true
      }
      this.unreadNotifications = 0
      
      try {
        await axios.get('/api/markAsRead/all')
      } catch (error) {
        console.error('Failed to mark all as read:', error)
      }
    },

    /**
     * Mark a single notification as read
     * @param {Object} notification - Notification to mark as read
     */
    async readNotification(notification) {
      const idx = this.notifications.findIndex(e => e.datetime === notification.datetime)
      if (idx > -1) {
        this.notifications[idx].read = true
        this.unreadNotifications = Math.max(0, this.unreadNotifications - 1)
        
        try {
          await axios.get(`/api/markAsRead/${notification.id}`)
        } catch (error) {
          console.error('Failed to mark notification as read:', error)
        }
      }
    },

    /**
     * Show a snackbar notification
     * @param {String} msg - Message to display
     */
    showSnack(msg) {
      this.snack.msg = msg
      this.snack.displayed = true
    },

    /**
     * Hide snackbar
     */
    hideSnack() {
      this.snack.displayed = false
    },

    /**
     * Show an info notification dialog
     * @param {Array} info - [title, message]
     */
    showNotif(info) {
      this.notif.title = info[0]
      this.notif.msg = info[1]
      this.notif.displayed = true
    },

    /**
     * Hide info notification dialog
     */
    hideNotif() {
      this.notif.displayed = false
    },

    /**
     * Show a warning dialog
     * @param {String} message - Warning message
     */
    showWarning(message) {
      this.warning.msg = message
      this.warning.log = format(new Date(), 'yyyy.MM.dd.HH.mm.ss')
      this.warning.displayed = true
    },

    /**
     * Hide warning dialog
     */
    hideWarning() {
      this.warning.displayed = false
    },

    /**
     * Show an error dialog
     * @param {Object} axiosError - Axios error object
     */
    showError(axiosError) {
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

    /**
     * Hide error dialog
     */
    hideError() {
      this.error.displayed = false
    },

    /**
     * Fetch notifications from API
     */
    async fetchNotifications() {
      try {
        const response = await axios.get('/api/notifications')
        if (response.data) {
          this.updateNotifications(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }
  }
})
