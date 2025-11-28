import { defineStore } from 'pinia'
import axios from 'axios'
import { parseAxiosResponse } from '../middleware/CommonHelper'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: false
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated && state.user !== null,
    userId: (state) => state.user?.id,
    username: (state) => state.user?.username,
    userRoles: (state) => state.user?.roles || [],
    isAdmin: (state) => state.user?.roles?.includes('admin') || false,
    avatarUrl: (state) => {
      if (!state.user?.id) return null
      const idAsStr = `${state.user.id}`
      return `/files/avatars/${idAsStr.padStart(3, '0')}.png`
    }
  },

  actions: {
    /**
     * Set the current user and update authentication state
     * @param {Object} user - User object from API
     */
    setCurrentUser(user) {
      if (user) {
        this.user = user
        this.isAuthenticated = true
      } else {
        this.user = null
        this.isAuthenticated = false
      }
    },

    /**
     * Update user data (for profile updates, etc.)
     * @param {Object} userData - Partial user data to update
     */
    updateUser(userData) {
      if (this.user) {
        this.user = { ...this.user, ...userData }
      }
    },

    /**
     * Log in user with credentials
     * @param {Object} credentials - { username, password }
     * @returns {Promise<Object>} User object
     */
    async login(credentials) {
      try {
        const response = await axios.post('/api/login', credentials)
        const user = parseAxiosResponse(response)
        this.setCurrentUser(user)
        return user
      } catch (error) {
        this.logout()
        throw error
      }
    },

    /**
     * Log out current user
     */
    async logout() {
      try {
        await axios.post('/api/logout')
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.setCurrentUser(null)
      }
    },

    /**
     * Check if user session is still valid
     * @returns {Promise<Object|null>} User object or null
     */
    async checkSession() {
      try {
        const response = await axios.get('/api/session')
        const user = parseAxiosResponse(response)
        if (user) {
          this.setCurrentUser(user)
          return user
        } else {
          this.setCurrentUser(null)
          return null
        }
      } catch (error) {
        this.setCurrentUser(null)
        return null
      }
    },

    /**
     * Update user password
     * @param {Object} passwordData - { oldPassword, newPassword }
     * @returns {Promise<Object>} Updated user object
     */
    async changePassword(passwordData) {
      const response = await axios.post('/api/users/change-pwd', passwordData)
      const user = parseAxiosResponse(response)
      if (user) {
        this.updateUser(user)
      }
      return user
    },

    /**
     * Update user profile
     * @param {Object} profileData - Profile data to update
     * @returns {Promise<Object>} Updated user object
     */
    async updateProfile(profileData) {
      const response = await axios.put('/api/users/profile', profileData)
      const user = parseAxiosResponse(response)
      if (user) {
        this.updateUser(user)
      }
      return user
    }
  }
})
