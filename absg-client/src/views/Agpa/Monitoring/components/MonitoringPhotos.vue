<template>
  <div class="monitoring-photos pa-4">
    <h2>Participation</h2>

    <!-- Résumé de participation -->
    <v-card
      v-if="participationSummary"
      class="mb-4"
      elevation="2"
    >
      <v-card-text>
        <h3 class="mb-3" style="color: #666;">Résumé de la participation</h3>

        <v-row dense>
          <!-- Participants par famille -->
          <v-col cols="12" md="6">
            <div class="font-weight-bold mb-2" style="color: #555;">Participants par famille</div>
            <v-table density="compact" style="font-size: 0.85em;">
              <thead>
                <tr>
                  <th style="text-align: left;">Famille</th>
                  <th style="text-align: center;">Participants</th>
                  <th style="text-align: center;">Photos</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="family in participationSummary.byFamily" :key="family.name">
                  <td style="text-align: left;">{{ family.name }}</td>
                  <td style="text-align: center; font-weight: 500;">{{ family.participants }}</td>
                  <td style="text-align: center;">{{ family.photos }}</td>
                </tr>
                <tr style="border-top: 2px solid #ccc; font-weight: bold;">
                  <td style="text-align: left;">Total</td>
                  <td style="text-align: center;">{{ participationSummary.totalParticipants }}</td>
                  <td style="text-align: center;">{{ participationSummary.totalPhotos }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-col>

          <!-- Photos par catégorie -->
          <v-col cols="12" md="6">
            <div class="font-weight-bold mb-2" style="color: #555;">Photos par catégorie</div>
            <v-table density="compact" style="font-size: 0.85em;">
              <thead>
                <tr>
                  <th style="text-align: left;">Catégorie</th>
                  <th style="text-align: center;" title="Famille Gueudelot">Gd</th>
                  <th style="text-align: center;" title="Famille Guibert">Gb</th>
                  <th style="text-align: center;" title="Famille Guyomard">Gy</th>
                  <th style="text-align: center;">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cat in participationSummary.byCategory" :key="cat.id">
                  <td style="text-align: left;">{{ cat.name }}</td>
                  <td style="text-align: center;">{{ cat.gueudelot || '-' }}</td>
                  <td style="text-align: center;">{{ cat.guibert || '-' }}</td>
                  <td style="text-align: center;">{{ cat.guyomard || '-' }}</td>
                  <td style="text-align: center; font-weight: 500;">{{ cat.total }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Filtre rapide -->
    <v-card class="mb-4" elevation="1">
      <v-card-text class="pa-3">
        <v-text-field
          v-model="photoFilter"
          prepend-icon="fas fa-search"
          label="Filtrer par photographe, titre de photo ou catégorie"
          single-line
          hide-details
          clearable
          density="compact"
        />
      </v-card-text>
    </v-card>

    <!-- Tableau des photos -->
    <v-table style="text-align: left; font-size: 0.8em;">
      <template #default>
        <thead>
          <tr style="vertical-align: baseline;">
            <th style="width: 200px;">Auteur</th>
            <th style="width: 150px;">Catégorie</th>
            <th>Photos</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="group of filteredPhotosByAuthorAndCategory"
            :key="`${group.userId}-${group.categoryId}`"
          >
            <td style="vertical-align: top; padding-top: 10px;">
              {{ group.username }}
            </td>
            <td style="vertical-align: top; padding-top: 10px;">
              {{ group.categoryTitle }}
            </td>
            <td>
              <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                <div
                  v-for="photo in group.photos"
                  :key="photo.id"
                  style="display: inline-block; text-align: center;"
                >
                  <img
                    class="thumb"
                    :src="photo.thumb"
                    @click="showPhotoGallery(photo)"
                    style="display: block; margin-bottom: 5px; cursor: pointer;"
                  >
                  <div
                    @click="openPhotoEditor(photo)"
                    style="cursor: pointer; font-size: 0.9em; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #1976d2;"
                    :title="photo.title"
                  >
                    {{ photo.title }}
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </template>
    </v-table>

    <!-- Dialog d'édition de photo -->
    <v-dialog v-model="photoEditorDialog" width="800px">
      <v-card v-if="selectedPhoto">
        <v-card-title class="bg-grey-lighten-4">
          Modification de la photo {{ selectedPhoto.id }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" md="6">
              <div style="text-align: center;">
                <img
                  :src="selectedPhoto.thumb"
                  :style="{
                    transform: `rotate(${photoRotation}deg)`,
                    transition: 'transform 0.3s ease',
                    maxWidth: '100%',
                    maxHeight: '300px'
                  }"
                  class="thumb"
                >
                <div class="mt-2">
                  <v-btn size="small" @click="photoRotation = (photoRotation - 90) % 360">
                    <v-icon>fas fa-undo</v-icon>
                  </v-btn>
                  <v-btn size="small" class="ml-2" @click="photoRotation = (photoRotation + 90) % 360">
                    <v-icon>fas fa-redo</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="photoTitle"
                label="Titre de la photo"
                density="comfortable"
              />
              <v-select
                v-model="photoCategoryId"
                :items="categoriesOptions"
                item-title="title"
                item-value="id"
                label="Catégorie"
                density="comfortable"
              />
              <v-checkbox
                v-model="photoHasError"
                label="Photo à problème (exclue des votes)"
                color="error"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="photoEditorDialog = false">Annuler</v-btn>
          <v-btn color="primary" :loading="isSaving" @click="savePhoto">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import store from '../../../../stores/helpers';
import { parseAxiosResponse } from '../../../../middleware/CommonHelper';
import { agpaPhotoToGalleryPhoto } from '../../../../middleware/AgpaHelper';

export default {
  props: {
    data: {
      type: Object,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  },
  emits: ['refresh'],
  data: () => ({
    photoFilter: '',
    photoEditorDialog: false,
    selectedPhoto: null,
    photoTitle: '',
    photoCategoryId: null,
    photoRotation: 0,
    photoHasError: false,
    isSaving: false
  }),
  computed: {
    photos() {
      if (!this.data || !this.data.photos) return [];
      return Object.values(this.data.photos);
    },
    categoriesOptions() {
      if (!this.data || !this.data.categories) return [];
      return Object.values(this.data.categories).filter(cat => cat.id > 0);
    },
    participationSummary() {
      if (!this.data || !this.data.photosStats || !this.data.users) return null;

      const familyStats = {
        gueudelot: { participants: new Set(), photos: 0 },
        guibert: { participants: new Set(), photos: 0 },
        guyomard: { participants: new Set(), photos: 0 }
      };

      this.photos.forEach(photo => {
        const user = this.data.users[photo.userId];
        if (user && user.rootFamily) {
          const family = user.rootFamily.toLowerCase();
          if (familyStats[family]) {
            familyStats[family].participants.add(photo.userId);
            familyStats[family].photos += 1;
          }
        }
      });

      const byFamily = [
        { name: 'Gueudelot', participants: familyStats.gueudelot.participants.size, photos: familyStats.gueudelot.photos },
        { name: 'Guibert', participants: familyStats.guibert.participants.size, photos: familyStats.guibert.photos },
        { name: 'Guyomard', participants: familyStats.guyomard.participants.size, photos: familyStats.guyomard.photos }
      ];

      const byCategory = this.data.photosStats
        .filter(stat => stat.catId !== 0)
        .map(stat => ({
          id: stat.catId,
          name: stat.name,
          gueudelot: stat.totalByFamilies?.gueudelot || 0,
          guibert: stat.totalByFamilies?.guibert || 0,
          guyomard: stat.totalByFamilies?.guyomard || 0,
          total: stat.total
        }));

      return {
        byFamily,
        byCategory,
        totalParticipants: byFamily.reduce((sum, f) => sum + f.participants, 0),
        totalPhotos: byFamily.reduce((sum, f) => sum + f.photos, 0)
      };
    },
    photosByAuthorAndCategory() {
      if (!this.photos || !this.data.categories) return [];

      const groups = {};
      this.photos.forEach(photo => {
        const key = `${photo.userId}-${photo.categoryId}`;
        if (!groups[key]) {
          groups[key] = {
            userId: photo.userId,
            username: photo.username,
            categoryId: photo.categoryId,
            categoryTitle: this.data.categories[photo.categoryId]?.title || 'N/A',
            photos: []
          };
        }
        groups[key].photos.push(photo);
      });

      return Object.values(groups).sort((a, b) => {
        const usernameCompare = a.username.localeCompare(b.username);
        if (usernameCompare !== 0) return usernameCompare;
        return a.categoryId - b.categoryId;
      });
    },
    filteredPhotosByAuthorAndCategory() {
      if (!this.photoFilter || this.photoFilter.trim() === '') {
        return this.photosByAuthorAndCategory;
      }

      const search = this.photoFilter.toLowerCase();
      return this.photosByAuthorAndCategory.filter(group => {
        if (group.username.toLowerCase().includes(search)) return true;
        if (group.categoryTitle.toLowerCase().includes(search)) return true;
        return group.photos.some(photo => photo.title.toLowerCase().includes(search));
      });
    }
  },
  methods: {
    showPhotoGallery(photo) {
      const galleryPhotos = this.photos.map(p => agpaPhotoToGalleryPhoto(p));
      const index = galleryPhotos.findIndex(p => p.id === photo.id);
      store.commit('photosGalleryReset', galleryPhotos);
      store.commit('photosGallerySetIndex', index >= 0 ? index : 0);
      store.commit('photosGalleryDisplay');
    },
    openPhotoEditor(photo) {
      this.selectedPhoto = photo;
      this.photoTitle = photo.title;
      this.photoCategoryId = photo.categoryId;
      this.photoRotation = 0;
      this.photoHasError = !!photo.error;
      this.photoEditorDialog = true;
    },
    async savePhoto() {
      if (!this.selectedPhoto) return;

      this.isSaving = true;
      try {
        const formData = new FormData();
        formData.append('id', this.selectedPhoto.id);
        formData.append('title', this.photoTitle);
        formData.append('catId', this.photoCategoryId);
        formData.append('rotation', this.photoRotation);
        formData.append('error', JSON.stringify(this.photoHasError ? { message: 'Photo marquée comme problématique' } : null));

        await axios.post('/api/agpa/photo', formData);
        this.photoEditorDialog = false;
        this.$emit('refresh');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      } finally {
        this.isSaving = false;
      }
    }
  }
};
</script>

<style scoped>
.thumb {
  max-width: 150px;
  max-height: 100px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.thumb:hover {
  opacity: 0.8;
}
</style>
