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


                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <router-link :to="{path: '/agpa/archives/' + year }" style="text-decoration: none; color: orange">
                            <span v-on="on">Edition</span>
                        </router-link>
                    </template>
                    <span>Retour au sommaire de l'édition {{ year }}</span>
                </v-tooltip>
                <v-btn text icon color="orange" style="vertical-align: inherit;" @click="gotoNextYear(-1)">
                    <v-icon>fas fa-chevron-left</v-icon>
                </v-btn>

                {{ year }}
                <v-btn text icon color="orange" style="vertical-align: inherit;" @click="gotoNextYear(1)">
                    <v-icon>fas fa-chevron-right</v-icon>
                </v-btn>

                <div style="display: inline-block; width: 100px;">
                </div>

                Catégorie
                <v-btn text icon color="orange" style="vertical-align: inherit;" @click="gotoNextCat(-1)">
                    <v-icon>fas fa-chevron-left</v-icon>
                </v-btn>
                {{ agpaMeta ? agpaMeta.categories[category].title : '...' }}
                <v-btn text icon color="orange" style="vertical-align: inherit;" @click="gotoNextCat(1)">
                    <v-icon>fas fa-chevron-right</v-icon>
                </v-btn>
            </v-card>

            <v-container fluid v-if="current">
                <v-layout row wrap>
                    <v-flex v-for="(photo, index) in photosGalery" :key="photo.id" style="min-width: 250px; width: 15%; margin: 15px">
                        <div>
                            <div style="width: 250px; height: 250px; margin: auto;">
                                <div style="width: 250px; height: 250px; display: table-cell; text-align: center; vertical-align: middle;">
                                    <img class="thumb" :src="photo.thumb" @click="photosGalleryDisplay(index)"/>
                                </div>
                            </div>
                            <div style="">

                            </div>
                            <v-card class="card shiny" v-bind:class="{
                                gold: photo.rank == 1,
                                sylver: photo.rank === 2,
                                bronze: photo.rank === 3 }" style="margin-bottom: 50px" >
                                <div>
                                    {{ photo.title }}
                                </div>
                                <div style="position: absolute; bottom: 5px; left: 5px; right: 5px; opacity:.5"> {{ photo.username }} </div>
                            </v-card>
                        </div>
                    </v-flex>
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
        category: null,
        photosGalery: [],
        liteboxOn: false,
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
            axios.get(`/api/agpa/archives/${this.year}/${this.$route.params.catId}`).then(response => {
                this.current = response.status === 200 ? response.data : null;
                this.error = response.status !== 200 ? response : null;
                this.isLoading = false;
                // Prepare photo galery
                if (this.current) {
                    let idx = 0;
                    for (let photo of this.current.photos) {
                        this.photosGalery.push({
                            url: `http://absolumentg.fr/assets/img/agpa/${this.year}/mini/${photo.filename}`,
                            thumb: `http://absolumentg.fr/assets/img/agpa/${this.year}/mini/vignette_${photo.filename}`,
                            title: photo.title,
                            username: photo.user.username,
                            rank: idx+1,
                        });
                        idx++;
                    }
                    store.commit('photosGalleryReset', this.photosGalery);
                }
            });
        },
        photosGalleryDisplay(index) {
            store.commit('photosGallerySetIndex', index);
            store.commit('photosGalleryDisplay');
        },
        photosGalleryHide() {
            store.commit('photosGalleryHide');
        },
        gotoNextYear(step) {
            let nextYear = this.year + step;
            nextYear = nextYear > this.agpaMeta.maxYear ? this.agpaMeta.minYear : nextYear;
            nextYear = nextYear < this.agpaMeta.minYear ? this.agpaMeta.maxYear : nextYear;
            this.$router.replace({path: `/agpa/archives/${nextYear}/${this.category}`});
        },
        gotoNextCat(step) {
            const cats = this.year < 2012 ? this.agpaMeta.catBefore2012 : this.agpaMeta.catSince2012;
            let catIdx = cats.indexOf(this.category);
            catIdx += step;
            catIdx %= cats.length;
            this.$router.replace({path: `/agpa/archives/${this.year}/${cats[catIdx]}`});
        }
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
    cursor: pointer;
}
</style>
