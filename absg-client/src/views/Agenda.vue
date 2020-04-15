<template>
<div>
    <v-tabs centered>
        <v-tab :to="{path:'/agenda/directory'}"> <v-icon>fas fa-address-book</v-icon> &nbsp; Répertoire</v-tab>
        <v-tab :to="{path:'/agenda/locations'}"> <v-icon>fas fa-map-marked-alt</v-icon> &nbsp; Lieux</v-tab>
        <v-tab :to="{path:'/agenda/events'}"> <v-icon>fas fa-calendar-alt</v-icon> &nbsp; Calendrier</v-tab>
        <v-tab :to="{path:'/agenda/trombi'}"> <v-icon>fas fa-user-circle</v-icon> &nbsp; Trombinoscope</v-tab>
        <v-tab :to="{path:'/agenda/genealogy'}"> <v-icon>fas fa-sitemap</v-icon> &nbsp; Généalogie</v-tab>
        <v-tab :to="{path:'/agenda/web3g'}"> <v-icon>fas fa-globe</v-icon> &nbsp; Web 3G</v-tab>
    </v-tabs>

    <router-view></router-view>
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
