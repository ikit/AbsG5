<template>
    <v-container fluid  grid-list-md style="padding:0">
        <v-data-iterator
            :items="photos"
            :items-per-page="filter.pageSize"
            :page="filter.pageIndex"
            :search="filter.search"
            :expanded="expandedPhotos"
            loading-text="Récupération des photos..."
            no-data-text="Aucune photo à trier."
            no-results-text="Aucune photo trouvée."
            hide-default-footer>

            <template v-slot:header>
                <div v-bind:class="{ stickyHeader: $vuetify.breakpoint.lgAndUp, stickyHeaderSmall: !$vuetify.breakpoint.lgAndUp }">
                    <v-row style="margin: 0" align="center" justify="center">

                        <v-text-field
                            v-model="filter.search"
                            prepend-icon="fa-search"
                            placeholder="Rechercher"
                            style="max-width: 300px;">
                        </v-text-field>
                        <v-spacer></v-spacer>

                        <v-select
                            v-model="filter.collection"
                            :items="filter.collections"
                            @change="loadCollection($event)"
                            label="Photos"
                            prepend-icon="fas fa-bars"
                            style="max-width: 300px;"
                        ></v-select>

                        <v-spacer></v-spacer>
                        <v-btn
                            icon small
                            :disabled="isLoading"
                            @click="formerPage">
                            <v-icon>fa-chevron-left</v-icon>
                        </v-btn>
                        <span class="grey--text" >
                            {{ filter.pageIndex}} / {{ numberOfPages }}
                        </span>
                        <v-btn
                            icon small
                            :disabled="isLoading"
                            @click="nextPage"
                        >
                            <v-icon>fa-chevron-right</v-icon>
                        </v-btn>
                    </v-row>
                    <div class="grey--text" style="font-size: 0.9em; display: block; position: absolute; right: 15px; bottom: 0;">{{photos.length}} photos</div>
                </div>
            </template>

            <template v-slot:default="props">
                <v-container fluid grid-list-sm>
                    <v-layout row wrap>
                        <v-flex v-for="p in props.items" :key="p.id" style="text-align: center;">
                            <div style="width: 250px; height: 250px; margin: auto;">
                                <div style="width: 250px; height: 250px; display: table-cell; text-align: center; vertical-align: middle;">
                                    <img :src="p.thumb" class="thumb" :alt="p.id" @click="photosGalleryDisplay(p.index)">
                                </div>
                            </div>
                        </v-flex>
                    </v-layout>
                </v-container>
            </template>
        </v-data-iterator>
    </v-container>
</template>


<script>
import axios from 'axios';
import store from '../../store';
import { parseAxiosResponse } from '../../middleware/CommonHelper';

export default {
    store,
    data: () => ({
        isLoading: false,
        photos: [], // La liste des photos à trier
        expandedPhotos: [],
        filter: {
            search: null, // recherche multicritère
            collection: "A trier",
            collections: ["A trier", "Date manquante", "Personnes manquantes", "Lieu manquant"],
            pageIndex: 1, // page courante affichée
            pageSize: 24, // nombre de photos affichées par page
        },
        rules: {
            from: [
                value => {
                    const pattern = /^([0-9]{4})?(-[0-9]{2}(-[0-9]{2})?)?$/
                    return pattern.test(value) || 'La valeur doit être une date valide: YYYY ou bien YYYY-MM ou bien YYYY-MM-DD'
                }
            ],
            to: [
                value => {
                    const pattern = /^([0-9]{4})?(-[0-9]{2}(-[0-9]{2})?)?$/
                    return pattern.test(value) || 'La valeur doit être une date valide: YYYY ou bien YYYY-MM ou bien YYYY-MM-DD'
                }
            ],
        }
    }),
    mounted() {
        this.loadCollection()
    },
    computed: {
        numberOfPages () {
            return Math.ceil(this.photos.length / this.filter.pageSize)
        }
    },
    methods: {
        loadCollection(collection = null) {
            this.isLoading = true;
            let url = `/api/photos/to-check`;
            if (collection === this.filter.collections[1]) {
                url += "?collection=date"
            } else if (collection === this.filter.collections[2]) {
                url += "?collection=person"
            } else if (collection === this.filter.collections[3]) {
                url += "?collection=place"
            }

            axios.get(url).then(response => {
                let idx = 0;
                this.photos = parseAxiosResponse(response).map(e => ({ ...e, index: idx++ }));
                store.commit('photosGalleryReset', this.photos);
                this.isLoading = false;
            }).catch( err => {
                store.commit('onError', err);
                this.isLoading = false;
            });
        },
        photosGalleryDisplay(index) {
            store.commit('photosGallerySetIndex', index);
            store.commit('photoMetadataEditorDisplay');
            store.commit('photosGalleryDisplay');
        },
        nextPage () {
            if (this.filter.pageIndex < this.numberOfPages) this.filter.pageIndex += 1
        },
        formerPage () {
            if (this.filter.pageIndex > 1) this.filter.pageIndex -= 1
        }
    }
}
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';


.thumb {
    background: white;
    padding: 1px;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
    cursor: pointer;
}
</style>
