<template>
    <v-container fluid  grid-list-md style="padding:0">
        <v-data-iterator
            :items="photos"
            :items-per-page="filter.pageSize"
            :page="filter.pageIndex"
            :search="filter.search"
            loading-text="Récupération des photos..."
            no-data-text="Aucune photo à trier."
            no-results-text="Aucune photo trouvée."
            hide-default-footer>

            <template v-slot:header>
                <div class="stickyHeader" >
                    <v-row style="" align="center" justify="center">

                        <v-text-field
                            label="Rechercher"
                            prepend-icon="fas fa-search"
                            v-model="filter.search"
                            style="max-width: 300px;">
                        </v-text-field>
                        <v-spacer></v-spacer>

                        <v-select
                            v-model="filter.collection"
                            :items="filter.collections"
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
                </div>
                <div class="grey--text" style="font-size: 0.9em; display: block; position: absolute; right: 15px; top: 110px;">{{photos.length}} photos</div>
            </template>

            <template v-slot:default="props">
                <v-container fluid grid-list-sm>
                    <v-layout row wrap>
                        <v-flex v-for="(p, index) in props.items" :key="p.id" style="text-align: center;">
                            <div style="width: 250px; height: 250px; margin: auto;">
                                <div style="width: 250px; height: 250px; display: table-cell; text-align: center; vertical-align: middle;">
                                    <img :src="p.thumb" class="thumb" :alt="p.id" @click="photosGalleryDisplay(index + (filter.pageIndex - 1) * filter.pageSize)">
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
import Vue from 'vue';
import axios from 'axios';
import store from '../../store';
import { parseAxiosResponse } from '../../middleware/CommonHelper';

export default {
    store,
    data: () => ({
        photos: [], // La liste des photos à trier
        filter: {
            search: null, // recherche multicritère
            collection: "Toutes",
            collections: ["Toutes", "A trier", "Triées"],
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
        axios.get(`/api/photos/to-check`).then(response => {
            this.photos = parseAxiosResponse(response);
            store.commit('photosGalleryReset', this.photos);
        }).catch( err => {
            store.commit('onError', err);
        });
    },
    computed: {
        numberOfPages () {
            return Math.ceil(this.photos.length / this.filter.pageSize)
        }
    },
    methods: {
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
