<template>
<div class="agpa" >
    <v-tabs centered>
        <v-tab :to="{path:'/agpa/'}"> <v-icon>fas fa-star</v-icon> &nbsp; Edition 2019</v-tab>
        <v-tab :to="{path:'/agpa/rules'}"> <v-icon>fas fa-scroll</v-icon> &nbsp; Réglement</v-tab>
        <v-tab :to="{path:'/agpa/archives'}"> <v-icon>fas fa-archive</v-icon> &nbsp; Archives</v-tab>
        <v-tab :to="{path:'/agpa/palmares'}"> <v-icon>fas fa-trophy</v-icon> &nbsp; Palmarès</v-tab>
        <v-tab :to="{path:'/agpa/stats'}"> <v-icon>fas fa-chart-bar</v-icon> &nbsp; Statistiques</v-tab>
        <v-tab :to="{path:'/agpa/ceremony'}"> <v-icon>fas fa-tv</v-icon> &nbsp; Cérémonies</v-tab>
    </v-tabs>

    <router-view></router-view>

</div>
</template>



<script>
import store from '../store';

export default {
    store,
    data: () => ({
        nav: {
            section: 2
        },
    }),
    mounted() {
        // A l'init des AGPA, on récupère si besoin les méta donnée des AGPA
        store.commit('initAGPA');
    },
    props: ['darkMode'],
    methods: {
    }
};
</script>

<style lang="scss" scoped>
@import '../themes/global.scss';

.agpa-menu {
    position: fixed;
    top: 64px;
    left: 85px;
    right: 0;
    background:  #d0d0d0;
    padding: 10px 20px;
    text-align: center;
    z-index: 1000;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
}

h1 {
    font-size: 5em;
    line-height: 150px;
    font-weight: bold;
    font-family: 'Tangerine', serif;
}


</style>
