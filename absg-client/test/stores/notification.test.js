import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '@/stores/notification'

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

describe('Notification Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should initialize with empty notifications', () => {
      const store = useNotificationStore()
      expect(store.notifications).toEqual([])
      expect(store.unreadCount).toBe(0)
    })

    it('should initialize UI notifications with default values', () => {
      const store = useNotificationStore()
      expect(store.snack).toEqual({ displayed: false, msg: '' })
      expect(store.notif).toEqual({ displayed: false, title: '', msg: '', log: '' })
      expect(store.warning).toEqual({ displayed: false, msg: '', log: '' })
      expect(store.error).toEqual({ displayed: false, query: '', msg: '', log: '', htmlError: '' })
    })
  })

  describe('System Notifications', () => {
    it('should update notifications', () => {
      const store = useNotificationStore()
      const notifications = [
        {
          id: 1,
          module: 'test',
          message: 'Test notification',
          datetime: new Date().toISOString(),
          read: false
        }
      ]

      store.updateNotifications(notifications)

      expect(store.notifications).toHaveLength(1)
      expect(store.notifications[0].message).toBe('Test notification')
      expect(store.unreadCount).toBe(1)
    })

    it('should mark notification as read', async () => {
      const store = useNotificationStore()
      const notifications = [
        {
          id: 1,
          module: 'test',
          message: 'Test',
          datetime: new Date().toISOString(),
          read: false
        }
      ]
      store.updateNotifications(notifications)

      expect(store.unreadCount).toBe(1)

      await store.readNotification(store.notifications[0])

      expect(store.unreadCount).toBe(0)
      expect(store.notifications[0].read).toBe(true)
    })

    it('should mark all notifications as read', async () => {
      const store = useNotificationStore()
      const notifications = [
        {
          id: 1,
          module: 'test',
          message: 'Test 1',
          datetime: new Date().toISOString(),
          read: false
        },
        {
          id: 2,
          module: 'test',
          message: 'Test 2',
          datetime: new Date(Date.now() + 1000).toISOString(),
          read: false
        }
      ]
      store.updateNotifications(notifications)

      expect(store.unreadCount).toBe(2)

      await store.readAllNotifications()

      expect(store.unreadCount).toBe(0)
      expect(store.notifications.every(n => n.read)).toBe(true)
    })
  })

  describe('UI Notifications', () => {
    it('should show snackbar notification', () => {
      const store = useNotificationStore()
      const message = 'Success message'

      store.showSnack(message)

      expect(store.snack.msg).toBe(message)
      expect(store.snack.displayed).toBe(true)
    })

    it('should show info notification', () => {
      const store = useNotificationStore()
      const title = 'Info'
      const message = 'Info message'

      store.showNotif([title, message])

      expect(store.notif.title).toBe(title)
      expect(store.notif.msg).toBe(message)
      expect(store.notif.displayed).toBe(true)
    })

    it('should show warning notification', () => {
      const store = useNotificationStore()
      const message = 'Warning message'

      store.showWarning(message)

      expect(store.warning.msg).toBe(message)
      expect(store.warning.displayed).toBe(true)
      expect(store.warning.log).toBeTruthy()
    })

    it('should show error notification', () => {
      const store = useNotificationStore()
      const message = 'Error message'

      store.showError({ message })

      expect(store.error.msg).toBe(message)
      expect(store.error.displayed).toBe(true)
      expect(store.error.log).toBeTruthy()
    })

    it('should hide UI notifications', () => {
      const store = useNotificationStore()
      store.showSnack('Test')
      store.showNotif(['Test', 'Test'])
      store.showWarning('Test')
      store.showError({ message: 'Test' })

      store.hideSnack()
      store.hideNotif()
      store.hideWarning()
      store.hideError()

      expect(store.snack.displayed).toBe(false)
      expect(store.notif.displayed).toBe(false)
      expect(store.warning.displayed).toBe(false)
      expect(store.error.displayed).toBe(false)
    })
  })
})
