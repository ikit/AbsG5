<template>
    <section id="content">
        <div v-if="isLoading" style="width: 50px; margin: 50px auto;">
            <v-progress-circular
                :size="50"
                color="primary"
                indeterminate>
            </v-progress-circular>
        </div>
        <div v-if="!isLoading && !current">Une erreur est survenue :( ...<br/>{{ error }}</div>

        <div v-if="current">
            <v-card style="line-height: 75px; margin: 30px 20px; font-family: 'Tangerine', serif; color: orange; font-size: 3em;">

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <router-link :to="{path: '/agpa/archives/' }" style="text-decoration: none;  position: absolute; left: 10px; line-height: 65px;">
                            <v-icon style="color: orange; vertical-align: middle" v-on="on">fas fa-bars</v-icon>
                        </router-link>
                    </template>
                    <span>Retour au sommaire des archives</span>
                </v-tooltip>

                Edition
                <v-btn text icon color="orange" style="vertical-align: inherit;" @click="gotoNextYear(-1)">
                    <v-icon>fas fa-chevron-left</v-icon>
                </v-btn>

                {{ year }}
                <v-btn text icon color="orange" style="vertical-align: inherit;" @click="gotoNextYear(1)">
                    <v-icon>fas fa-chevron-right</v-icon>
                </v-btn>
            </v-card>


            <v-container fluid v-if="current && agpaMeta">
                <v-layout row wrap v-for="(cat, catIdx) in current.categories" :key="catIdx">
                    <h2 :class="`catHeader cat${catIdx}`">{{ agpaMeta.categories[catIdx].title }}</h2>

                </v-layout>
            </v-container>
        </div>
    </section>
</template>


<script>
import axios from 'axios';
import store from '../../store';
import { mapState } from 'vuex';

export default {
    store,
    data: () => ({
        isLoading: true,
        current: null,
        error: null,
        year: 0,
    }),
    computed: { ...mapState([
        'agpaMeta',
        'photosGallery',
        'photosGalleryIndex',
        'photosGalleryDisplayed'
    ])},
    props: ['darkMode'],
    mounted () {
        this.initView();
    },
    watch: {
        $route(to, from) {
            this.initView();
        }
    },
    methods: {
        initView() {
            // Reset photos list
            this.photosGalery = [];
            this.year = Number.parseInt(this.$route.params.year);
            this.category = Number.parseInt(this.$route.params.catId);
            axios.get(`/api/agpa/archives/${this.year}`).then(response => {
                this.current = response.status === 200 ? response.data : null;
                this.error = response.status !== 200 ? response : null;
                this.isLoading = false;
            });
        },
        gotoNextYear(step) {
            let nextYear = this.year + step;
            nextYear = nextYear > this.agpaMeta.maxYear ? this.agpaMeta.minYear : nextYear;
            nextYear = nextYear < this.agpaMeta.minYear ? this.agpaMeta.maxYear : nextYear;
            this.$router.replace({path: `/agpa/archives/${nextYear}`});
        },
    }

};
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';
@import '../../themes/agpa.scss';

#content {
    text-align: center;
}

h2 {
    font-family: 'Tangerine', serif;
    color: orange;
    font-size: 3em;
    margin: 0 35px;
}
h2:hover {
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);

}

.thumb {
    background: white;
    padding: 1px;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
}

</style>
