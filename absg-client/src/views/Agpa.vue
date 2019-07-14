<template>
<div class="agpa" >
    <div class="agpa-menu">
        <v-btn color="accent"><v-icon left>fas fa-home</v-icon> Accueil</v-btn>
        <v-btn><v-icon left>fas fa-scroll</v-icon> Réglement</v-btn>
        <v-btn><v-icon left>fas fa-archive</v-icon> Archives</v-btn>
        <v-btn><v-icon left>fas fa-trophy</v-icon> Palmarès</v-btn>
        <v-btn><v-icon left>fas fa-chart-bar</v-icon>Statistiques</v-btn>
        <v-btn><v-icon left>fas fa-tv</v-icon>Cérémonies</v-btn>
    </div>
    <h1 style="margin-top: 100px; position: relative;">Absolument G Photos Awards</h1>
    <router-view></router-view>
</div>
</template>



<script>
export default {
    data: () => ({
        nav: {
            section: 2
        },
    }),
    props: ['darkMode'],
    methods: {
    }
};
</script>

<style lang="scss" scoped>
@import '../assets/global.scss';

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
    display: block;
    font-size: 5em;
    font-weight: bold;
    text-align: center;
    color: $primary;
    text-shadow: 0 -1px #000;
    text-shadow: 0 1px #aaa;
    font-family: "Comfortaa", sans-serif;
    margin: 20px 0;
    font-family: 'Tangerine', serif;
}
</style>
