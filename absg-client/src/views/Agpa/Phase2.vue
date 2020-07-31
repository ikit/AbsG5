<template>
    <section id="content">
        <div v-bind:class="{ stickyHeader: $vuetify.breakpoint.lgAndUp, stickyHeaderSmall: !$vuetify.breakpoint.lgAndUp }">
            <v-row style="padding: 15px">

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <div class="phase-left-header" v-on="on" @click="help.displayed = true; help.page = 2">
                            <h2>Phase n°2 en cours</h2>
                            <p>Validation des photos</p>
                        </div>
                    </template>
                    <span>Besoin d'aide sur la phase actuelle du concours ?</span>
                </v-tooltip>

                <v-spacer></v-spacer>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            icon small
                            v-on="on"
                            :disabled="isLoading"
                            @click="gotoNextCat(-1)"
                            style="margin-top: 3px;">
                            <v-icon>fas fa-chevron-left</v-icon>
                        </v-btn>
                    </template>
                    <span>Catégorie précédente</span>
                </v-tooltip>

                <v-menu offset-y v-if="agpaMeta && category">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn dark v-bind="attrs" v-on="on" text class="grey--text">
                            {{ agpaMeta.categories[category.categoryId].title }}
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item
                            v-for="catIdx in agpaMeta.categoriesOrders"
                            :key="catIdx"
                            @click="gotoCat(agpaMeta.categories[catIdx].categoryId)"
                        >
                            <v-list-item-title>{{ agpaMeta.categories[catIdx].title }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            icon small
                            v-on="on"
                            :disabled="isLoading"
                            @click="gotoNextCat(1)"
                            style="margin-top: 3px;">
                            <v-icon>fas fa-chevron-right</v-icon>
                        </v-btn>
                    </template>
                    <span>Catégorie suivante</span>
                </v-tooltip>

                <v-spacer></v-spacer>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }" v-on="on">
                        <div class="phase-right-header" @click="help.displayed = true; help.page = 3">
                            <h2>Prochaine phase: Votes</h2>
                            <p>A partir du {{ end }}</p>
                        </div>
                    </template>
                    <span>Besoin d'aide sur le déroulement du concours ?</span>
                </v-tooltip>
            </v-row>
            <v-progress-linear
                color="accent"
                indeterminate
                v-if="isLoading"
                style="position: absolute; bottom: -5px; left: 0; right: 0; height: 5px">
            </v-progress-linear>
        </div>
        <v-container fluid>
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
                        <v-card class="card" style="margin-bottom: 50px" >
                            <div style="text-align: center">
                                {{ photo.title }}
                            </div>
                        </v-card>
                    </div>
                </v-flex>
            </v-layout>
        </v-container>

        <v-dialog v-model="help.displayed" width="800px">
            à l'aide ! {{ help.page }}
        </v-dialog>
    </section>
</template>


<script>
import axios from 'axios';
import { mapState } from 'vuex';
import { getModuleInfo, getPeopleAvatar, parseAxiosResponse } from '../../middleware/CommonHelper';
import { format } from 'date-fns';
import { fr } from "date-fns/locale";
import { agpaPhotoToGalleryPhoto } from '../../middleware/AgpaHelper';
import PhotoWidget from './components/PhotoWidget';
import ImageEditor from '../../components/ImageEditor.vue';
import store from '../../store';

export default {
    store,
    data: () => ({
        isLoading: true,
        current: null,
        year: 0,
        category: null,
        photosGalery: [],
        start: format(new Date(2020, 11, 19), "dd MMM 'à' HH'h'mm", {locale: fr}),
        end: format(new Date(2020, 11, 20), "dd MMM 'à' HH'h'mm", {locale: fr}),
        help: {
            displayed: false,
            page: 0
        }
    }),
    computed: { ...mapState([
        'agpaMeta'
    ])},
    watch: {
        $route(to, from) {
            this.initView();
        },
        'agpaMeta': function () {
            this.initView();
        }
    },
    mounted () {
        if (this.agpaMeta) {
            this.initView();
        }
    },
    methods: {
        initView() {
            // Reset photos list
            this.isLoading = true;
            this.photosGalery = [];
            this.photosGalleryIndex = 0;
            this.catId = Number.parseInt(this.$route.query.catId);
            if (!this.catId) {
                this.catId = this.agpaMeta.categoriesOrders[0];
            }

            axios.get(`/api/agpa/p2`).then(response => {
                this.current = parseAxiosResponse(response);
                if (this.current) {
                    this.category = this.current.categories.find(c => c.categoryId === this.catId);
                    console.log("cat", this.category)
                    for (let photo of this.category.photos) {
                        this.photosGalery.push(photo);
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
        gotoNextCat(step) {
            let catIdx = this.agpaMeta.categoriesOrders.indexOf(this.category.categoryId);
            catIdx += step + this.agpaMeta.categoriesOrders.length;
            catIdx %= this.agpaMeta.categoriesOrders.length;
            this.gotoCat(this.agpaMeta.categoriesOrders[catIdx]);
        },
        gotoCat(catId) {
            this.$router.replace({path: `/agpa/edition?catId=${catId}`});
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

.phase-left-header {
    margin: -5px 0 -10px 0;
    cursor: pointer;

    h2 {
        font-size: 20px;
        line-height: 20px;
        text-align: left;
    }
    p {
        text-align: left;
        font-size: 15px;
        line-height: 20px;
        opacity: 0.5;
        margin: 0;
    }
}
.phase-right-header {
    margin: -5px 0 -10px 0;
    opacity: 0.5;
    cursor: pointer;

    h2 {
        font-size: 20px;
        line-height: 20px;
        text-align: right;
    }
    p {
        text-align: right;
        font-size: 15px;
        line-height: 20px;
        margin: 0;
    }
}

.thumb {
    background: white;
    padding: 1px;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
    cursor: pointer;
}
</style>
