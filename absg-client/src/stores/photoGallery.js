import { defineStore } from 'pinia'

export const usePhotoGalleryStore = defineStore('photoGallery', {
  state: () => ({
    // Photo gallery viewer
    photos: [],
    currentIndex: 0,
    isDisplayed: false,
    
    // Photo metadata editor
    isEditorDisplayed: false
  }),

  getters: {
    currentPhoto: (state) => state.photos[state.currentIndex] || null,
    hasPhotos: (state) => state.photos.length > 0,
    photoCount: (state) => state.photos.length,
    hasPrevious: (state) => state.photos.length > 1,
    hasNext: (state) => state.photos.length > 1,
    isGalleryOpen: (state) => state.isDisplayed,
    isEditorOpen: (state) => state.isEditorDisplayed
  },

  actions: {
    /**
     * Reset gallery with new photos
     * @param {Array} photos - Array of photo objects
     */
    resetGallery(photos) {
      this.photos = photos || []
      this.currentIndex = 0
    },

    /**
     * Set current photo index
     * @param {Number} index - Photo index
     */
    setIndex(index) {
      if (index >= 0 && index < this.photos.length) {
        this.currentIndex = index
      }
    },

    /**
     * Go to next photo
     */
    nextPhoto() {
      if (this.photos.length > 1) {
        this.currentIndex = (this.currentIndex + 1) % this.photos.length
      }
    },

    /**
     * Go to previous photo
     */
    previousPhoto() {
      if (this.photos.length > 1) {
        this.currentIndex = (this.currentIndex - 1 + this.photos.length) % this.photos.length
      }
    },

    /**
     * Show photo gallery
     */
    showGallery() {
      this.isDisplayed = true
    },

    /**
     * Hide photo gallery
     */
    hideGallery() {
      this.isDisplayed = false
      this.isEditorDisplayed = false
    },

    /**
     * Show photo metadata editor
     */
    showEditor() {
      this.isEditorDisplayed = true
    },

    /**
     * Hide photo metadata editor
     */
    hideEditor() {
      this.isEditorDisplayed = false
    },

    /**
     * Update current photo metadata
     * @param {Object} metadata - Updated metadata
     */
    updateCurrentPhotoMetadata(metadata) {
      if (this.currentPhoto) {
        this.photos[this.currentIndex] = {
          ...this.currentPhoto,
          ...metadata
        }
      }
    },

    /**
     * Add photo to gallery
     * @param {Object} photo - Photo object to add
     */
    addPhoto(photo) {
      this.photos.push(photo)
    },

    /**
     * Remove photo from gallery
     * @param {Number} index - Index of photo to remove
     */
    removePhoto(index) {
      if (index >= 0 && index < this.photos.length) {
        this.photos.splice(index, 1)
        // Adjust current index if needed
        if (this.currentIndex >= this.photos.length) {
          this.currentIndex = Math.max(0, this.photos.length - 1)
        }
      }
    },

    /**
     * Clear all photos
     */
    clearGallery() {
      this.photos = []
      this.currentIndex = 0
      this.isDisplayed = false
      this.isEditorDisplayed = false
    }
  }
})
