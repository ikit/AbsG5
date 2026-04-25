<template>
  <v-dialog v-model="store.moveDialogOpen" max-width="550">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon start>fas fa-folder-open</v-icon>
        Déplacer {{ store.selectedCount }} photo{{ store.selectedCount > 1 ? 's' : '' }}
      </v-card-title>

      <v-card-text>
        <!-- Chargement -->
        <div v-if="store.isFoldersLoading" class="text-center pa-4">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <!-- Arborescence des dossiers -->
        <div v-else class="pcloud-folders">
          <div class="text-caption mb-2 text-grey">Choisir un dossier de destination :</div>

          <v-list density="compact" class="pcloud-folders__list">
            <FolderItem
              v-for="folder in store.sortedFolders"
              :key="folder.folderid"
              :folder="folder"
              :selected-id="selectedFolderId"
              @select="selectFolder"
            />
          </v-list>

          <!-- Créer un nouveau dossier -->
          <v-divider class="my-3" />
          <div class="d-flex align-center ga-2">
            <v-text-field
              v-model="newFolderName"
              label="Nouveau dossier"
              density="compact"
              hide-details
              variant="outlined"
              @keyup.enter="createFolder"
            />
            <v-btn
              variant="tonal"
              :disabled="!newFolderName.trim()"
              :loading="isCreating"
              @click="createFolder"
            >
              <v-icon start>fas fa-folder-plus</v-icon> Créer
            </v-btn>
          </div>
        </div>

        <!-- Erreur -->
        <v-alert v-if="error" type="error" density="compact" class="mt-3">
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="store.closeMoveDialog()">
          Annuler
        </v-btn>
        <v-btn
          color="accent"
          variant="flat"
          :disabled="!selectedFolderId"
          :loading="store.isMoving"
          @click="movePhotos"
        >
          <v-icon start>fas fa-arrow-right</v-icon>
          Déplacer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { usePCloudStore } from '../../../stores/pcloud';

const FolderItem = {
  name: 'FolderItem',
  props: {
    folder: { type: Object, required: true },
    selectedId: { type: Number, default: null },
    depth: { type: Number, default: 0 }
  },
  emits: ['select'],
  data: () => ({
    expanded: false
  }),
  template: `
    <div>
      <v-list-item
        :active="selectedId === folder.folderid"
        :style="{ paddingLeft: (depth * 20 + 8) + 'px' }"
        @click="$emit('select', folder.folderid)"
      >
        <template #prepend>
          <v-icon
            v-if="folder.children && folder.children.length"
            size="small"
            class="mr-1"
            @click.stop="expanded = !expanded"
          >
            {{ expanded ? 'fas fa-chevron-down' : 'fas fa-chevron-right' }}
          </v-icon>
          <v-icon v-else size="small" class="mr-1" style="opacity: 0">
            fas fa-chevron-right
          </v-icon>
          <v-icon size="small" color="warning">fas fa-folder</v-icon>
        </template>
        <v-list-item-title class="text-body-2">{{ folder.name }}</v-list-item-title>
      </v-list-item>
      <template v-if="expanded && folder.children">
        <FolderItem
          v-for="child in folder.children"
          :key="child.folderid"
          :folder="child"
          :selected-id="selectedId"
          :depth="depth + 1"
          @select="$emit('select', $event)"
        />
      </template>
    </div>
  `
};

export default {
  components: { FolderItem },
  setup() {
    const store = usePCloudStore();
    return { store };
  },
  data: () => ({
    selectedFolderId: null,
    newFolderName: '',
    isCreating: false,
    error: null,
  }),
  watch: {
    'store.moveDialogOpen'(open) {
      if (open) {
        this.selectedFolderId = null;
        this.newFolderName = '';
        this.error = null;
      }
    }
  },
  methods: {
    selectFolder(folderId) {
      this.selectedFolderId = folderId;
    },

    async createFolder() {
      if (!this.newFolderName.trim()) return;
      this.isCreating = true;
      this.error = null;

      try {
        // Créer dans le dossier sélectionné ou à la racine du dossier trié
        const parentId = this.selectedFolderId || parseInt(process.env.PCLOUD_SORTED_FOLDER_ID || '0', 10);
        const folder = await this.store.createFolder(parentId, this.newFolderName.trim());
        if (folder) {
          this.selectedFolderId = folder.folderid;
          this.newFolderName = '';
        }
      } catch (err) {
        this.error = 'Erreur lors de la création du dossier';
      } finally {
        this.isCreating = false;
      }
    },

    async movePhotos() {
      if (!this.selectedFolderId) return;
      this.error = null;

      try {
        const result = await this.store.moveSelectedPhotos(this.selectedFolderId);
        if (result && result.errors.length === 0) {
          this.store.closeMoveDialog();
        } else if (result && result.errors.length > 0) {
          this.error = `${result.moved} déplacée(s), ${result.errors.length} erreur(s)`;
        }
      } catch (err) {
        this.error = 'Erreur lors du déplacement';
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.pcloud-folders__list {
  max-height: 350px;
  overflow-y: auto;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 4px;
}
</style>
