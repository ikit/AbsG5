import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAgpaStore } from '@/stores/agpa'

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

describe('AGPA Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should initialize with null metadata', () => {
      const store = useAgpaStore()
      expect(store.meta).toBeNull()
      expect(store.currentEdition).toBeNull()
      expect(store.isLoading).toBe(false)
      expect(store.isInitialized).toBe(false)
    })

    it('should have correct initial getters', () => {
      const store = useAgpaStore()
      expect(store.agpaMeta).toBeNull()
      expect(store.currentYear).toBeUndefined()
      expect(store.categories).toEqual([])
      expect(store.isActive).toBeFalsy()
      expect(store.isLoaded).toBe(false)
    })
  })

  describe('Metadata Management', () => {
    it('should update metadata', () => {
      const store = useAgpaStore()
      const meta = {
        year: 2025,
        phase: 1,
        categories: [
          { id: 1, name: 'Nature' },
          { id: 2, name: 'Portrait' }
        ],
        minYear: 2020,
        maxYear: 2025
      }

      store.updateMeta(meta)

      expect(store.meta).toEqual(meta)
      expect(store.isInitialized).toBe(true)
      expect(store.currentYear).toBe(2025)
      expect(store.categories).toHaveLength(2)
    })

    it('should get category by ID', () => {
      const store = useAgpaStore()
      const meta = {
        categories: {
          1: { id: 1, name: 'Nature' },
          2: { id: 2, name: 'Portrait' }
        }
      }

      store.updateMeta(meta)

      expect(store.getCategoryById(1)).toEqual({ id: 1, name: 'Nature' })
      expect(store.getCategoryById(2)).toEqual({ id: 2, name: 'Portrait' })
    })
  })

  describe('Phase Detection', () => {
    it('should detect submission phase', () => {
      const store = useAgpaStore()
      store.updateMeta({ phase: 1 })

      expect(store.currentPhase).toBe(1)
      expect(store.isSubmissionPhase).toBe(true)
      expect(store.isActive).toBe(true)
      expect(store.isVotingPhase).toBe(false)
    })

    it('should detect selection phase', () => {
      const store = useAgpaStore()
      store.updateMeta({ phase: 2 })

      expect(store.isSelectionPhase).toBe(true)
      expect(store.isActive).toBe(true)
    })

    it('should detect voting phase', () => {
      const store = useAgpaStore()
      store.updateMeta({ phase: 3 })

      expect(store.isVotingPhase).toBe(true)
      expect(store.isActive).toBe(true)
    })

    it('should detect results phase', () => {
      const store = useAgpaStore()
      store.updateMeta({ phase: 4 })

      expect(store.isResultsPhase).toBe(true)
      expect(store.isActive).toBe(true)
    })

    it('should detect inactive state', () => {
      const store = useAgpaStore()
      store.updateMeta({ phase: 0 })

      expect(store.isActive).toBe(false)
    })
  })

  describe('Year Range', () => {
    it('should provide min and max years', () => {
      const store = useAgpaStore()
      store.updateMeta({
        minYear: 2020,
        maxYear: 2025
      })

      expect(store.minYear).toBe(2020)
      expect(store.maxYear).toBe(2025)
    })
  })

  describe('Special Edition', () => {
    it('should provide special edition info', () => {
      const store = useAgpaStore()
      const specialEdition = {
        name: 'Special Contest',
        description: 'A special edition'
      }

      store.updateMeta({ specialEdition })

      expect(store.specialEdition).toEqual(specialEdition)
    })
  })

  describe('Reset', () => {
    it('should reset store state', () => {
      const store = useAgpaStore()
      store.updateMeta({ year: 2025, phase: 1 })
      store.currentEdition = { data: 'test' }
      store.isLoading = true

      store.reset()

      expect(store.meta).toBeNull()
      expect(store.currentEdition).toBeNull()
      expect(store.isLoading).toBe(false)
      expect(store.isInitialized).toBe(false)
    })
  })
})
