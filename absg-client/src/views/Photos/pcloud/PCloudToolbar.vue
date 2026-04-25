<template>
  <div class="pcloud-toolbar d-flex align-center ga-3 pa-3 flex-wrap">
    <v-text-field
      v-model="store.searchQuery"
      prepend-inner-icon="fas fa-search"
      label="Filtrer par nom"
      density="compact"
      hide-details
      variant="outlined"
      clearable
      class="pcloud-toolbar__search"
    />

    <v-divider vertical class="mx-1" />

    <span class="text-body-2 text-no-wrap">
      {{ store.totalPhotos }} photos
    </span>

    <template v-if="store.selectedCount > 0">
      <v-chip color="accent" size="small">
        {{ store.selectedCount }} sél.
      </v-chip>
      <v-btn
        size="small"
        variant="text"
        @click="store.clearSelection()"
      >
        Désélectionner
      </v-btn>
    </template>

    <v-spacer />

    <v-btn
      size="small"
      variant="text"
      @click="store.selectAll()"
    >
      <v-icon start size="small">fas fa-check-double</v-icon>
      Tout
    </v-btn>

    <v-btn
      size="small"
      variant="flat"
      color="accent"
      :disabled="store.selectedCount === 0"
      @click="store.openMoveDialog()"
    >
      <v-icon start size="small">fas fa-folder-open</v-icon>
      Déplacer ({{ store.selectedCount }})
    </v-btn>

    <v-btn
      size="small"
      variant="outlined"
      :loading="store.isLoading"
      @click="$emit('refresh')"
    >
      <v-icon start size="small">fas fa-sync</v-icon>
      Rafraîchir
    </v-btn>
  </div>
</template>

<script>
import { usePCloudStore } from '../../../stores/pcloud';

export default {
  emits: ['refresh'],
  setup() {
    const store = usePCloudStore();
    return { store };
  }
};
</script>

<style lang="scss" scoped>
.pcloud-toolbar {
  background: rgba(var(--v-theme-on-surface), 0.03);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  position: sticky;
  top: 0;
  z-index: 20;
}

.pcloud-toolbar__search {
  max-width: 280px;
  min-width: 180px;
}
</style>
