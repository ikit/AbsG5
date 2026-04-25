import { defineStore } from 'pinia'
import axios from 'axios'
import { parseAxiosResponse } from '../middleware/CommonHelper'

const MONTH_LABELS = [
  '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

function formatMonthYear(yearMonth) {
  if (!yearMonth || yearMonth === 'unknown') return 'Date inconnue'
  const [year, month] = yearMonth.split('-')
  return `${MONTH_LABELS[parseInt(month, 10)] || month} ${year}`
}

export const usePCloudStore = defineStore('pcloud', {
  state: () => ({
    photos: [],
    isLoading: false,
    error: null,

    selectedIds: [],
    lastSelectedId: null,

    searchQuery: '',

    sortedFolders: [],
    isFoldersLoading: false,

    thumbnails: {},

    moveDialogOpen: false,

    isMoving: false,
    moveResult: null,
  }),

  getters: {
    filteredPhotos(state) {
      if (!state.searchQuery) return state.photos
      const q = state.searchQuery.toLowerCase()
      return state.photos.filter(p => p.name.toLowerCase().includes(q))
    },

    timelineGroups() {
      const groups = new Map()
      for (const photo of this.filteredPhotos) {
        const key = photo.yearMonth || 'unknown'
        if (!groups.has(key)) {
          groups.set(key, { key, label: formatMonthYear(key), photos: [] })
        }
        groups.get(key).photos.push(photo)
      }
      return Array.from(groups.values()).sort((a, b) => {
        if (a.key === 'unknown') return 1
        if (b.key === 'unknown') return -1
        return a.key.localeCompare(b.key)
      })
    },

    selectedCount(state) {
      return state.selectedIds.length
    },

    totalPhotos(state) {
      return state.photos.length
    },

    availableYears() {
      const years = new Set()
      for (const photo of this.photos) {
        if (photo.yearMonth) years.add(photo.yearMonth.substring(0, 4))
      }
      return Array.from(years).sort()
    },

    availableMonths() {
      const months = new Map()
      for (const photo of this.photos) {
        if (photo.yearMonth) {
          const year = photo.yearMonth.substring(0, 4)
          if (!months.has(year)) months.set(year, new Set())
          months.get(year).add(photo.yearMonth)
        }
      }
      const result = {}
      for (const [year, set] of months) {
        result[year] = Array.from(set).sort()
      }
      return result
    },

    isSelected(state) {
      return (fileid) => state.selectedIds.includes(fileid)
    }
  },

  actions: {
    async loadPhotos(forceRefresh = false) {
      this.isLoading = true
      this.error = null
      try {
        const url = forceRefresh ? '/api/pcloud/unsorted?refresh=true' : '/api/pcloud/unsorted'
        const response = await axios.get(url)
        this.photos = parseAxiosResponse(response) || []
      } catch (err) {
        this.error = err.message || 'Erreur de chargement'
        console.error('PCloud: erreur chargement photos', err)
      } finally {
        this.isLoading = false
      }
    },

    async loadThumbnails(fileids) {
      if (!fileids.length) return
      try {
        const response = await axios.post('/api/pcloud/thumbnails', { fileids })
        const data = parseAxiosResponse(response)
        if (data) {
          for (const [id, url] of Object.entries(data)) {
            this.thumbnails[id] = url
          }
        }
      } catch (err) {
        console.error('PCloud: erreur chargement thumbnails', err)
      }
    },

    async getFullImageUrl(fileid) {
      try {
        const response = await axios.get(`/api/pcloud/file/${fileid}`)
        const data = parseAxiosResponse(response)
        return data?.url || null
      } catch (err) {
        console.error('PCloud: erreur lien image', err)
        return null
      }
    },

    async loadSortedFolders() {
      this.isFoldersLoading = true
      try {
        const response = await axios.get('/api/pcloud/sorted-folders')
        this.sortedFolders = parseAxiosResponse(response) || []
      } catch (err) {
        console.error('PCloud: erreur chargement dossiers', err)
      } finally {
        this.isFoldersLoading = false
      }
    },

    async createFolder(parentFolderId, name) {
      try {
        const response = await axios.post('/api/pcloud/sorted-folders', { parentFolderId, name })
        const folder = parseAxiosResponse(response)
        if (folder) {
          await this.loadSortedFolders()
        }
        return folder
      } catch (err) {
        console.error('PCloud: erreur création dossier', err)
        throw err
      }
    },

    async moveSelectedPhotos(toFolderId) {
      if (!this.selectedIds.length) return
      this.isMoving = true
      this.moveResult = null
      try {
        const response = await axios.post('/api/pcloud/move', {
          fileids: [...this.selectedIds],
          toFolderId
        })
        const result = parseAxiosResponse(response)
        this.moveResult = result

        if (result && result.moved > 0) {
          const movedIds = new Set(this.selectedIds)
          this.photos = this.photos.filter(p => !movedIds.has(p.fileid))
          this.selectedIds = []
          this.lastSelectedId = null
        }

        return result
      } catch (err) {
        console.error('PCloud: erreur déplacement', err)
        throw err
      } finally {
        this.isMoving = false
      }
    },

    toggleSelection(fileid) {
      const idx = this.selectedIds.indexOf(fileid)
      if (idx > -1) {
        this.selectedIds.splice(idx, 1)
      } else {
        this.selectedIds.push(fileid)
      }
      this.lastSelectedId = fileid
    },

    selectRange(fileid) {
      if (!this.lastSelectedId) {
        this.toggleSelection(fileid)
        return
      }

      const photos = this.filteredPhotos
      const fromIdx = photos.findIndex(p => p.fileid === this.lastSelectedId)
      const toIdx = photos.findIndex(p => p.fileid === fileid)

      if (fromIdx === -1 || toIdx === -1) {
        this.toggleSelection(fileid)
        return
      }

      const start = Math.min(fromIdx, toIdx)
      const end = Math.max(fromIdx, toIdx)

      for (let i = start; i <= end; i++) {
        const id = photos[i].fileid
        if (!this.selectedIds.includes(id)) {
          this.selectedIds.push(id)
        }
      }
      this.lastSelectedId = fileid
    },

    selectAll() {
      this.selectedIds = this.filteredPhotos.map(p => p.fileid)
    },

    clearSelection() {
      this.selectedIds = []
      this.lastSelectedId = null
    },

    openMoveDialog() {
      this.moveDialogOpen = true
      this.loadSortedFolders()
    },

    closeMoveDialog() {
      this.moveDialogOpen = false
    }
  }
})
