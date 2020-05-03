<template>
    <section id="content">

        <div class="stickyHeader">
            <v-row style="padding: 15px">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            v-on="on"
                            depressed small
                            :to="{path: `/agpa/archives/${year}` }">
                            <v-icon left>fas fa-chevron-left</v-icon>
                            <span v-if="$vuetify.breakpoint.mdAndUp">Retour</span>
                        </v-btn>
                    </template>
                    <span>Retour au sommaire de l'édition</span>
                </v-tooltip>

                <v-spacer></v-spacer>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            icon small
                            v-on="on"
                            :disabled="isLoading"
                            @click="gotoNextYear(-1)">
                            <v-icon>fa-chevron-left</v-icon>
                        </v-btn>
                    </template>
                    <span>Edition précédente</span>
                </v-tooltip>
                <span class="grey--text" >
                    {{ year }}
                </span>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            icon small
                            v-on="on"
                            :disabled="isLoading"
                            @click="gotoNextYear(1)">
                            <v-icon>fa-chevron-right</v-icon>
                        </v-btn>
                    </template>
                    <span>Edition suivante</span>
                </v-tooltip>

                <v-spacer></v-spacer>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            icon small
                            v-on="on"
                            :disabled="isLoading"
                            @click="gotoNextCat(-1)">
                            <v-icon>fas fa-chevron-left</v-icon>
                        </v-btn>
                    </template>
                    <span>Catégorie précédente</span>
                </v-tooltip>
                <span class="grey--text" >
                    {{ agpaMeta ? agpaMeta.categories[category].title : '...' }}
                </span>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            icon small
                            v-on="on"
                            :disabled="isLoading"
                            @click="gotoNextCat(1)">
                            <v-icon>fas fa-chevron-right</v-icon>
                        </v-btn>
                    </template>
                    <span>Catégorie suivante</span>
                </v-tooltip>

                <v-spacer></v-spacer>
            </v-row>
            <v-progress-linear
                color="accent"
                indeterminate
                v-if="isLoading"
                style="position: absolute; bottom: -5px; left: 0; right: 0; height: 5px">
            </v-progress-linear>
        </div>

        <div v-if="current">
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
import { parseAxiosResponse } from '../../middleware/CommonHelper';
import { agpaPhotoToGalleryPhoto } from '../../middleware/AgpaHelper';


export default {
    store,
    data: () => ({
        isLoading: true,
        current: null,
        year: 0,
        category: null,
        photosGalery: []
    }),
    computed: { ...mapState([
        'agpaMeta'
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
            this.photosGalleryIndex = 0;
            this.year = Number.parseInt(this.$route.params.year);
            this.category = Number.parseInt(this.$route.params.catId);
            axios.get(`/api/agpa/archives/${this.year}/${this.category}`).then(response => {
                this.current = parseAxiosResponse(response);
                // Prepare photo galery
                if (this.current) {
                    for (let photo of this.current.photos) {
                        this.photosGalery.push(agpaPhotoToGalleryPhoto(photo));
                    }
                    store.commit('photosGalleryReset', this.photosGalery);
                }
                this.isLoading = false;
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
            let catIdx = this.current.categoriesOrders.indexOf(this.category);
            catIdx += step + this.current.categoriesOrders.length;
            catIdx %= this.current.categoriesOrders.length;
            this.$router.replace({path: `/agpa/archives/${this.year}/${this.current.categoriesOrders[catIdx]}`});
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
