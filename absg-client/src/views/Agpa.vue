<template>
<div class="agpa" style="margin-top: 58px; position: relative;">
    <h1>Absolument G Photos Awards</h1>
    <affix
        relative-element-selector="#content" :offset="{ top: 56, bottom: 0 }"
        class="sidebar-menu"
        style="background: rgba(0,0,0,0.1); width: 100%;  padding: 10px 20px; text-align: center">

        <v-btn><v-icon left>fas fa-home</v-icon> Accueil</v-btn>
        <v-btn><v-icon left>fas fa-scroll</v-icon> Réglement</v-btn>
        <v-btn><v-icon left>fas fa-archive</v-icon> Archives</v-btn>
        <v-btn><v-icon left>fas fa-trophy</v-icon> Palmarès</v-btn>
        <v-btn><v-icon left>fas fa-chart-bar</v-icon>Statistiques</v-btn>
        <v-btn><v-icon left>fas fa-tv</v-icon>Cérémonies</v-btn>
    </affix>

    <section id="content" style="text-align: center;">
        <div v-if="isLoading" style="width: 50px; margin: 50px auto;">
            <v-progress-circular
                :size="50"
                color="primary"
                indeterminate>
            </v-progress-circular>
        </div>
        <div v-if="!isLoading && !current">Une erreur est survenue :( ...<br/>{{ error }}</div>
        <Phase1 v-if="current && current.phase == 1" :current="current"></Phase1>
        <Phase2 v-if="current && current.phase == 2" :current="current"></Phase2>
        <Phase3 v-if="current && current.phase == 3" :current="current"></Phase3>
        <Phase4 v-if="current && current.phase == 4" :current="current"></Phase4>
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
        <br/>salut
    </section>

</div>
</template>



<script>
import { Affix } from 'vue-affix';
import axios from 'axios';
import Phase1 from './Agpa/Phase1';
import Phase2 from './Agpa/Phase2';
import Phase3 from './Agpa/Phase3';
import Phase4 from './Agpa/Phase4';
import Phase5 from './Agpa/Phase5';

export default {
    components: {
        Affix,
        Phase1,
        Phase2,
        Phase3,
        Phase4,
        Phase5,
    },
    data: () => ({
        isLoading: true,
        current: null,
        error: null,
    }),
    mounted () {
        axios.get('/api/agpa').then(response => {
            console.log(response);
            this.current = response.status === 200 ? response.data : null;
            this.error = response.status !== 200 ? response : null;
            this.isLoading = false;
        });
    },

    methods: {
        resetDialog (open = false) {
            this.citationEditor.open = open;
            this.citationEditor.citationId = null;
            this.citationEditor.citation = null;
            this.citationEditor.author = null;
        },
        saveCitation: function () {
            this.current = 'cool';
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../assets/global.scss';

h1 {
    display: block;
    font-size: 2em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    text-align: center;
    color: $primary;
    text-shadow: 0 -1px #000;
    text-shadow: 0 1px #aaa;
    font-size: 40px;
    font-family: "Comfortaa", sans-serif;
    margin: 20px 0 60px 0;
}
</style>
