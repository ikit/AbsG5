<template>
  <div class="pcloud-timeline" ref="container">
    <div
      v-for="group in store.timelineGroups"
      :key="group.key"
      :ref="el => setGroupRef(group.key, el)"
      :data-group="group.key"
      class="pcloud-timeline__group"
    >
      <!-- En-tête mois (sticky) -->
      <div class="pcloud-timeline__month-header">
        <span>{{ group.label }}</span>
        <span class="pcloud-timeline__count">{{ group.photos.length }} photos</span>
      </div>

      <!-- Grille photos -->
      <div class="pcloud-timeline__grid">
        <div
          v-for="photo in group.photos"
          :key="photo.fileid"
          class="pcloud-timeline__item"
          :class="{ 'pcloud-timeline__item--selected': store.isSelected(photo.fileid) }"
          @click.exact="store.toggleSelection(photo.fileid)"
          @click.shift="store.selectRange(photo.fileid)"
          @dblclick="openFullImage(photo)"
        >
          <img
            v-if="store.thumbnails[photo.fileid]"
            :src="store.thumbnails[photo.fileid]"
            :alt="photo.name"
            loading="lazy"
            @error="onThumbError($event, photo.fileid)"
          />
          <div v-else class="pcloud-timeline__placeholder">
            <v-icon size="24" color="grey-lighten-1">fas fa-image</v-icon>
          </div>

          <div class="pcloud-timeline__checkbox">
            <v-icon
              :color="store.isSelected(photo.fileid) ? 'accent' : 'white'"
              size="18"
            >
              {{ store.isSelected(photo.fileid) ? 'fas fa-check-circle' : 'far fa-circle' }}
            </v-icon>
          </div>

          <div v-if="photo.dateStr" class="pcloud-timeline__item-date">
            {{ photo.dateStr }}
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog plein écran pour voir la photo -->
    <v-dialog v-model="fullImageOpen" max-width="95vw" max-height="95vh">
      <v-card class="pcloud-fullimage">
        <v-btn
          icon
          variant="text"
          class="pcloud-fullimage__close"
          @click="fullImageOpen = false"
        >
          <v-icon>fas fa-times</v-icon>
        </v-btn>
        <div v-if="fullImageLoading" class="pcloud-fullimage__loading">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <img
          v-if="fullImageUrl"
          :src="fullImageUrl"
          class="pcloud-fullimage__img"
          @load="fullImageLoading = false"
        />
        <div v-if="fullImageName" class="pcloud-fullimage__name">{{ fullImageName }}</div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { usePCloudStore } from '../../../stores/pcloud';

export default {
  setup() {
    const store = usePCloudStore();
    return { store };
  },
  data: () => ({
    groupRefs: {},
    observer: null,
    fullImageOpen: false,
    fullImageUrl: null,
    fullImageName: null,
    fullImageLoading: false,
  }),
  mounted() {
    this.setupIntersectionObserver();
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  methods: {
    setGroupRef(key, el) {
      if (el) {
        this.groupRefs[key] = el;
        if (this.observer) {
          this.observer.observe(el);
        }
      }
    },

    setupIntersectionObserver() {
      this.observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const groupKey = entry.target.dataset.group;
            this.loadGroupThumbnails(groupKey);
          }
        }
      }, {
        rootMargin: '300px',
        threshold: 0
      });

      // Observer les groupes déjà rendus
      for (const [, el] of Object.entries(this.groupRefs)) {
        this.observer.observe(el);
      }
    },

    loadGroupThumbnails(groupKey) {
      const group = this.store.timelineGroups.find(g => g.key === groupKey);
      if (!group) return;

      const needed = group.photos
        .filter(p => !this.store.thumbnails[p.fileid])
        .map(p => p.fileid);

      if (needed.length > 0) {
        this.store.loadThumbnails(needed);
      }
    },

    scrollToGroup(yearMonth) {
      const el = this.groupRefs[yearMonth];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },

    onThumbError(event, fileid) {
      // Supprime le thumbnail en cache pour retenter plus tard
      delete this.store.thumbnails[fileid];
    },

    async openFullImage(photo) {
      this.fullImageOpen = true;
      this.fullImageLoading = true;
      this.fullImageName = photo.name;
      this.fullImageUrl = null;

      const url = await this.store.getFullImageUrl(photo.fileid);
      if (url) {
        this.fullImageUrl = url;
      } else {
        this.fullImageLoading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.pcloud-timeline {
  padding: 8px 16px 32px;
}

.pcloud-timeline__month-header {
  position: sticky;
  top: 108px;
  z-index: 10;
  background: rgb(var(--v-theme-surface-variant));
  padding: 8px 16px;
  font-family: "Comfortaa", sans-serif;
  font-size: 1.1em;
  font-weight: 600;
  border-bottom: 2px solid rgb(var(--v-theme-primary));
  border-radius: 4px 4px 0 0;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pcloud-timeline__count {
  opacity: 0.5;
  font-size: 0.8em;
  font-weight: 400;
}

.pcloud-timeline__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 6px;
  padding: 8px 0 16px;
}

.pcloud-timeline__item {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: border-color 0.15s;
  background: rgba(var(--v-theme-on-surface), 0.05);

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.5);
  }

  &--selected {
    border-color: rgb(var(--v-theme-accent));
    box-shadow: 0 0 0 1px rgb(var(--v-theme-accent));
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.pcloud-timeline__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pcloud-timeline__checkbox {
  position: absolute;
  top: 4px;
  left: 4px;
  opacity: 0;
  transition: opacity 0.15s;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));

  .pcloud-timeline__item:hover &,
  .pcloud-timeline__item--selected & {
    opacity: 1;
  }
}

.pcloud-timeline__item-date {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  font-size: 0.7em;
  padding: 12px 6px 3px;
  text-align: center;
}

// Full image dialog
.pcloud-fullimage {
  position: relative;
  background: #000 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.pcloud-fullimage__close {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  color: white !important;
}

.pcloud-fullimage__loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.pcloud-fullimage__img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.pcloud-fullimage__name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 16px;
  font-size: 0.85em;
  text-align: center;
}
</style>
