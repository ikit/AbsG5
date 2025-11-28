import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn()
  }
}))

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should initialize with null user', () => {
      const store = useUserStore()
      expect(store.currentUser).toBeNull()
    })

    it('should not be logged in initially', () => {
      const store = useUserStore()
      expect(store.isLoggedIn).toBe(false)
    })
  })

  describe('User Management', () => {
    it('should set current user', () => {
      const store = useUserStore()
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user']
      }

      store.setCurrentUser(user)

      expect(store.currentUser).toEqual(user)
      expect(store.isLoggedIn).toBe(true)
    })

    it('should clear user on logout', async () => {
      const store = useUserStore()
      const user = { id: 1, username: 'testuser' }

      store.setCurrentUser(user)
      expect(store.isLoggedIn).toBe(true)

      await store.logout()
      expect(store.currentUser).toBeNull()
      expect(store.isLoggedIn).toBe(false)
    })

    it('should update user data', () => {
      const store = useUserStore()
      const user = { id: 1, username: 'testuser', email: 'old@example.com' }

      store.setCurrentUser(user)
      store.updateUser({ email: 'new@example.com' })

      expect(store.currentUser.email).toBe('new@example.com')
    })
  })

  describe('User Roles', () => {
    it('should check if user is admin', () => {
      const store = useUserStore()

      expect(store.isAdmin).toBe(false)

      store.setCurrentUser({ id: 1, username: 'admin', roles: ['admin'] })
      expect(store.isAdmin).toBe(true)
    })

    it('should get user roles', () => {
      const store = useUserStore()
      const user = { id: 1, username: 'moderator', roles: ['user', 'moderator'] }

      store.setCurrentUser(user)

      expect(store.userRoles).toEqual(['user', 'moderator'])
      expect(store.userRoles).toContain('moderator')
      expect(store.userRoles).not.toContain('admin')
    })
  })

  describe('Getters', () => {
    it('should get avatar URL', () => {
      const store = useUserStore()

      expect(store.avatarUrl).toBeNull()

      store.setCurrentUser({ id: 5, username: 'test' })
      expect(store.avatarUrl).toBe('/files/avatars/005.png')
    })

    it('should get user ID and username', () => {
      const store = useUserStore()

      expect(store.userId).toBeUndefined()
      expect(store.username).toBeUndefined()

      store.setCurrentUser({ id: 42, username: 'testuser' })
      expect(store.userId).toBe(42)
      expect(store.username).toBe('testuser')
    })
  })
})
