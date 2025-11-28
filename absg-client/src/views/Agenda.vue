<template>
  <div>
    <v-tabs
      centered
      class="fixed-tabs-bar"
    >
      <v-tab :to="{path:'/agenda/directory'}">
        <v-icon start>
          fas fa-address-book
        </v-icon> Répertoire
      </v-tab>
      <v-tab :to="{path:'/agenda/locations'}">
        <v-icon start>
          fas fa-map-marked-alt
        </v-icon> Lieux
      </v-tab>
      <v-tab :to="{path:'/agenda/trombi'}"><v-icon start>fas fa-user-circle</v-icon> Trombinoscope</v-tab>
      <!--<v-tab :to="{path:'/agenda/genealogy'}"> <v-icon start>fas fa-sitemap</v-icon> Généalogie</v-tab>
      <v-tab :to="{path:'/agenda/web3g'}"> <v-icon start>fas fa-globe</v-icon> Web 3G</v-tab-->
    </v-tabs>

    <router-view />
  </div>
</template>



<script>
export default  {
    data: () => ({}),
};
</script>

<style lang="scss" scoped>
@import '../themes/global.scss';

</style>
