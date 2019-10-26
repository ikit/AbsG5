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
            <v-card style="line-height: 75px; margin-bottom: 16px; font-family: 'Tangerine', serif; color: orange; font-size: 3em;">

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

                    <v-container fluid v-if="cat.photos">
                        <v-layout row wrap>
                            <v-flex v-for="idx in [0, 1, 2, 3, 4]" :key="idx" style="min-width: 250px; width: 15%; margin: 15px">
                                <div>
                                    <div style="width: 250px; height: 250px; margin: auto;">
                                        <div style="width: 250px; height: 250px; display: table-cell; text-align: center; vertical-align: middle;">
                                            <img class="thumb" :src="cat.photos[idx].thumb" @click="photosGalleryDisplay(index)"/>
                                        </div>
                                    </div>
                                    <div style="">

                                    </div>
                                    <v-card class="card shiny" v-bind:class="{
                                        gold: cat.photos[idx].ranking == 1,
                                        sylver: cat.photos[idx].ranking === 2,
                                        bronze: cat.photos[idx].ranking === 3 }" style="margin-bottom: 50px" >
                                        <div>
                                            {{ cat.photos[idx].title }}
                                        </div>
                                        <div style="position: absolute; bottom: 5px; left: 5px; right: 5px; opacity:.5"> {{ cat.photos[idx].user.username }} </div>
                                    </v-card>
                                </div>
                            </v-flex>
                        </v-layout>
                    </v-container>

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
                console.log(this.current);
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


.thumb {
    background: white;
    padding: 1px;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
}

</style>
