import { defineStore } from 'pinia'
import axios from 'axios'
import { parseAxiosResponse } from '../middleware/CommonHelper'

export const useAgpaStore = defineStore('agpa', {
  state: () => ({
    // AGPA metadata (categories, years, phases, etc.)
    meta: null,
    
    // Current edition data
    currentEdition: null,
    
    // Loading states
    isLoading: false,
    isInitialized: false
  }),

  getters: {
    /**
     * Get AGPA metadata
     */
    agpaMeta: (state) => state.meta,
    
    /**
     * Get current year
     */
    currentYear: (state) => state.meta?.year,
    
    /**
     * Get all categories
     */
    categories: (state) => state.meta?.categories || [],
    
    /**
     * Get category by ID
     */
    getCategoryById: (state) => (id) => {
      return state.meta?.categories?.[id]
    },
    
    /**
     * Get min/max years for archives
     */
    minYear: (state) => state.meta?.minYear,
    maxYear: (state) => state.meta?.maxYear,
    
    /**
     * Get current phase
     */
    currentPhase: (state) => state.meta?.phase,
    
    /**
     * Check if AGPA is active
     */
    isActive: (state) => state.meta?.phase > 0,
    
    /**
     * Check if in voting phase
     */
    isVotingPhase: (state) => state.meta?.phase === 3,
    
    /**
     * Check if in submission phase
     */
    isSubmissionPhase: (state) => state.meta?.phase === 1,
    
    /**
     * Check if in selection phase
     */
    isSelectionPhase: (state) => state.meta?.phase === 2,
    
    /**
     * Check if in results phase
     */
    isResultsPhase: (state) => state.meta?.phase === 4,
    
    /**
     * Get special edition info
     */
    specialEdition: (state) => state.meta?.specialEdition,
    
    /**
     * Check if data is loaded
     */
    isLoaded: (state) => state.isInitialized && state.meta !== null
  },

  actions: {
    /**
     * Update AGPA metadata
     * @param {Object} meta - AGPA metadata from API
     */
    updateMeta(meta) {
      this.meta = meta
      this.isInitialized = true
    },

    /**
     * Initialize AGPA data from API
     * @returns {Promise<Object>} AGPA metadata
     */
    async initialize() {
      if (this.isInitialized && this.meta) {
        return this.meta
      }

      this.isLoading = true
      try {
        const response = await axios.get('/api/agpa')
        const meta = parseAxiosResponse(response)
        this.updateMeta(meta)
        return meta
      } catch (error) {
        console.error('Failed to initialize AGPA:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch current edition data
     * @returns {Promise<Object>} Current edition data
     */
    async fetchCurrentEdition() {
      if (!this.meta?.year) {
        await this.initialize()
      }

      this.isLoading = true
      try {
        const response = await axios.get(`/api/agpa/edition/${this.meta.year}`)
        this.currentEdition = parseAxiosResponse(response)
        return this.currentEdition
      } catch (error) {
        console.error('Failed to fetch current edition:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch archive edition data
     * @param {Number} year - Year to fetch
     * @returns {Promise<Object>} Archive edition data
     */
    async fetchArchiveEdition(year) {
      this.isLoading = true
      try {
        const response = await axios.get(`/api/agpa/archives/${year}`)
        return parseAxiosResponse(response)
      } catch (error) {
        console.error(`Failed to fetch archive for year ${year}:`, error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch category data for a specific year
     * @param {Number} year - Year
     * @param {Number} categoryId - Category ID
     * @returns {Promise<Object>} Category data
     */
    async fetchCategoryData(year, categoryId) {
      this.isLoading = true
      try {
        const response = await axios.get(`/api/agpa/archives/${year}/${categoryId}`)
        return parseAxiosResponse(response)
      } catch (error) {
        console.error(`Failed to fetch category ${categoryId} for year ${year}:`, error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch palmares (hall of fame) data
     * @returns {Promise<Object>} Palmares data
     */
    async fetchPalmares() {
      this.isLoading = true
      try {
        const response = await axios.get('/api/agpa/palmares')
        return parseAxiosResponse(response)
      } catch (error) {
        console.error('Failed to fetch palmares:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Submit a photo to AGPA
     * @param {Object} photoData - Photo data to submit
     * @returns {Promise<Object>} Submission result
     */
    async submitPhoto(photoData) {
      this.isLoading = true
      try {
        const response = await axios.post('/api/agpa/submit', photoData)
        return parseAxiosResponse(response)
      } catch (error) {
        console.error('Failed to submit photo:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Vote for photos
     * @param {Object} votes - Vote data
     * @returns {Promise<Object>} Vote result
     */
    async submitVotes(votes) {
      this.isLoading = true
      try {
        const response = await axios.post('/api/agpa/vote', votes)
        return parseAxiosResponse(response)
      } catch (error) {
        console.error('Failed to submit votes:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Reset store state
     */
    reset() {
      this.meta = null
      this.currentEdition = null
      this.isLoading = false
      this.isInitialized = false
    }
  }
})
