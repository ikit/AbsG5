import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePhotoGalleryStore } from '@/stores/photoGallery'

describe('Photo Gallery Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should initialize with empty gallery', () => {
      const store = usePhotoGalleryStore()
      expect(store.photos).toEqual([])
      expect(store.currentIndex).toBe(0)
      expect(store.isDisplayed).toBe(false)
      expect(store.isEditorDisplayed).toBe(false)
    })

    it('should have correct initial getters', () => {
      const store = usePhotoGalleryStore()
      expect(store.currentPhoto).toBeNull()
      expect(store.hasPhotos).toBe(false)
      expect(store.photoCount).toBe(0)
      expect(store.isGalleryOpen).toBe(false)
      expect(store.isEditorOpen).toBe(false)
    })
  })

  describe('Gallery Management', () => {
    it('should reset gallery with photos', () => {
      const store = usePhotoGalleryStore()
      const photos = [
        { id: 1, url: 'photo1.jpg' },
        { id: 2, url: 'photo2.jpg' }
      ]

      store.resetGallery(photos)

      expect(store.photos).toEqual(photos)
      expect(store.photoCount).toBe(2)
      expect(store.hasPhotos).toBe(true)
      expect(store.currentIndex).toBe(0)
    })

    it('should add photo to gallery', () => {
      const store = usePhotoGalleryStore()
      const photo = { id: 1, url: 'photo1.jpg' }

      store.addPhoto(photo)

      expect(store.photoCount).toBe(1)
      expect(store.photos[0]).toEqual(photo)
    })

    it('should remove photo from gallery', () => {
      const store = usePhotoGalleryStore()
      store.resetGallery([
        { id: 1, url: 'photo1.jpg' },
        { id: 2, url: 'photo2.jpg' }
      ])

      store.removePhoto(0)

      expect(store.photoCount).toBe(1)
      expect(store.photos[0].id).toBe(2)
    })

    it('should clear gallery', () => {
      const store = usePhotoGalleryStore()
      store.resetGallery([{ id: 1, url: 'photo1.jpg' }])
      store.showGallery()

      store.clearGallery()

      expect(store.photos).toEqual([])
      expect(store.currentIndex).toBe(0)
      expect(store.isDisplayed).toBe(false)
    })
  })

  describe('Navigation', () => {
    beforeEach(() => {
      const store = usePhotoGalleryStore()
      store.resetGallery([
        { id: 1, url: 'photo1.jpg' },
        { id: 2, url: 'photo2.jpg' },
        { id: 3, url: 'photo3.jpg' }
      ])
    })

    it('should navigate to next photo', () => {
      const store = usePhotoGalleryStore()
      expect(store.currentIndex).toBe(0)

      store.nextPhoto()
      expect(store.currentIndex).toBe(1)

      store.nextPhoto()
      expect(store.currentIndex).toBe(2)
    })

    it('should wrap around to first photo', () => {
      const store = usePhotoGalleryStore()
      store.setIndex(2)

      store.nextPhoto()
      expect(store.currentIndex).toBe(0)
    })

    it('should navigate to previous photo', () => {
      const store = usePhotoGalleryStore()
      store.setIndex(2)

      store.previousPhoto()
      expect(store.currentIndex).toBe(1)
    })

    it('should wrap around to last photo', () => {
      const store = usePhotoGalleryStore()
      expect(store.currentIndex).toBe(0)

      store.previousPhoto()
      expect(store.currentIndex).toBe(2)
    })

    it('should set specific index', () => {
      const store = usePhotoGalleryStore()

      store.setIndex(1)
      expect(store.currentIndex).toBe(1)
      expect(store.currentPhoto.id).toBe(2)
    })
  })

  describe('Display Control', () => {
    it('should show and hide gallery', () => {
      const store = usePhotoGalleryStore()

      store.showGallery()
      expect(store.isGalleryOpen).toBe(true)

      store.hideGallery()
      expect(store.isGalleryOpen).toBe(false)
    })

    it('should show and hide editor', () => {
      const store = usePhotoGalleryStore()

      store.showEditor()
      expect(store.isEditorOpen).toBe(true)

      store.hideEditor()
      expect(store.isEditorOpen).toBe(false)
    })

    it('should hide editor when hiding gallery', () => {
      const store = usePhotoGalleryStore()
      store.showGallery()
      store.showEditor()

      store.hideGallery()

      expect(store.isGalleryOpen).toBe(false)
      expect(store.isEditorOpen).toBe(false)
    })
  })

  describe('Photo Metadata', () => {
    it('should update current photo metadata', () => {
      const store = usePhotoGalleryStore()
      store.resetGallery([
        { id: 1, url: 'photo1.jpg', title: 'Old Title' }
      ])

      store.updateCurrentPhotoMetadata({ title: 'New Title' })

      expect(store.currentPhoto.title).toBe('New Title')
      expect(store.currentPhoto.url).toBe('photo1.jpg')
    })

    it('should not update if no current photo', () => {
      const store = usePhotoGalleryStore()

      expect(() => {
        store.updateCurrentPhotoMetadata({ title: 'Test' })
      }).not.toThrow()
    })
  })
})
