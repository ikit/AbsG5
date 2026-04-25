<template>
  <div>
    <v-tabs
      centered
      class="fixed-tabs-bar"
    >
      <v-tab :to="{path:'/photos/immt'}">
        <v-icon start>
          fas fa-image
        </v-icon> Immt
      </v-tab>
      <v-tab :to="{path:'/photos/albums'}">
        <v-icon start>
          fas fa-images
        </v-icon> Albums
      </v-tab>
      <v-tab :to="{path:'/photos/browser'}">
        <v-icon start>
          fab fa-stack-overflow
        </v-icon> Trier
      </v-tab>
      <v-tab v-if="isArchivist" :to="{path:'/photos/pcloud'}">
        <v-icon start>
          fas fa-cloud
        </v-icon> pCloud
      </v-tab>
    </v-tabs>
    <router-view />
  </div>
</template>



<script>
import { mapState } from '../stores/helpers';

export default  {
    data: () => ({
        isArchivist: false
    }),
    computed: {
        ...mapState(['user']),
    },
    mounted() {
        this.isArchivist = this.user?.roles?.indexOf('archivist') > -1 || false;
    }
};
</script>

<style lang="scss" scoped>
@use '../themes/global.scss' as *;
</style>
