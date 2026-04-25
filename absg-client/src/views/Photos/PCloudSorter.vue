<template>
  <section v-if="isArchivist" class="pcloud-sorter">
    <PCloudToolbar
      @refresh="refreshPhotos"
    />
    <PCloudDateNav
      @scroll-to="scrollToGroup"
    />

    <div v-if="store.isLoading && !store.photos.length" class="pcloud-loading">
      <v-progress-circular indeterminate color="primary" size="48" />
      <div class="mt-3">Chargement des photos depuis pCloud...</div>
    </div>

    <PCloudTimeline
      v-else-if="store.photos.length"
      ref="timeline"
    />

    <div v-else-if="!store.isLoading" class="pcloud-empty">
      <v-icon size="64" color="grey-lighten-1">fas fa-cloud</v-icon>
      <div class="mt-3 text-grey">Aucune photo à trier</div>
      <v-btn class="mt-4" variant="outlined" @click="refreshPhotos">
        <v-icon start>fas fa-sync</v-icon> Rafraîchir
      </v-btn>
    </div>

    <PCloudMoveDialog />
  </section>

  <section v-else class="pcloud-denied">
    <v-icon size="48" color="grey">fas fa-lock</v-icon>
    <div class="mt-3">Accès réservé aux archivistes</div>
  </section>
</template>

<script>
import { mapState } from '../../stores/helpers';
import { usePCloudStore } from '../../stores/pcloud';
import PCloudToolbar from './pcloud/PCloudToolbar.vue';
import PCloudDateNav from './pcloud/PCloudDateNav.vue';
import PCloudTimeline from './pcloud/PCloudTimeline.vue';
import PCloudMoveDialog from './pcloud/PCloudMoveDialog.vue';

export default {
  components: {
    PCloudToolbar,
    PCloudDateNav,
    PCloudTimeline,
    PCloudMoveDialog,
  },
  setup() {
    const store = usePCloudStore();
    return { store };
  },
  computed: {
    ...mapState(['user']),
    isArchivist() {
      return this.user?.roles?.includes('archivist');
    }
  },
  mounted() {
    if (this.isArchivist && !this.store.photos.length) {
      this.store.loadPhotos();
    }
  },
  methods: {
    refreshPhotos() {
      this.store.loadPhotos(true);
    },
    scrollToGroup(yearMonth) {
      this.$refs.timeline?.scrollToGroup(yearMonth);
    }
  }
};
</script>

<style lang="scss" scoped>
.pcloud-sorter {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 160px);
}

.pcloud-loading,
.pcloud-empty,
.pcloud-denied {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 16px;
}
</style>
