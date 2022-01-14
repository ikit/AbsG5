<template>
  <div>
    <v-tabs
      centered
      class="fixed-tabs-bar"
    >
      <v-tab :to="{path:'/photos/immt'}">
        <v-icon left>
          fas fa-image
        </v-icon> Immt
      </v-tab>
      <v-tab :to="{path:'/photos/albums'}">
        <v-icon left>
          fas fa-images
        </v-icon> Albums
      </v-tab>
      <v-tab :to="{path:'/photos/browser'}">
        <v-icon left>
          fab fa-stack-overflow
        </v-icon> Trier
      </v-tab>
    </v-tabs>
    <router-view />
  </div>
</template>



<script>
export default  {
    data: () => ({})
};
</script>

<style lang="scss" scoped>
@import '../themes/global.scss';
</style>
