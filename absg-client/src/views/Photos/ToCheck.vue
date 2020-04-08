<template>
    <v-container fluid  grid-list-md style="padding:0">
        <v-data-iterator
            :items="photos"
            :items-per-page="filter.pageSize"
            :page="filter.pageIndex"
            :search="filter.request"
            hide-default-footer>


            <template v-slot:default="props">
                <v-container fluid grid-list-sm>
                    <v-layout row wrap>
                        <v-flex v-for="(p, index) in props.items" :key="p.id" style="text-align: center;">
                            <div style="width: 250px; height: 250px; margin: auto;">
                                <div style="width: 250px; height: 250px; display: table-cell; text-align: center; vertical-align: middle;">
                                    <img :src="p.thumb" class="thumb" :alt="p.id" @click="photosGalleryDisplay(index)">
                                </div>
                            </div>
                        </v-flex>
                    </v-layout>
                </v-container>
            </template>

            <template v-slot:footer>
                <v-row class="mt-2" style="margin: 0 5px" align="center" justify="center">
                    <span class="grey--text">Citations par page</span>
                    <v-menu offset-y>
                        <template v-slot:activator="{ on }">
                            <v-btn
                                text
                                color="primary"
                                class="ml-2"
                                :disabled="isLoading"
                                v-on="on">
                                    {{ filter.pageSize }}
                                <v-icon>fa-angle-down</v-icon>
                            </v-btn>
                        </template>
                            <v-list>
                            <v-list-item
                                v-for="(number, index) in [24, 48, 96]"
                                :key="index"
                                @click="updateCitationsPerPage(number)">
                                <v-list-item-title>{{ number }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>

                    <v-spacer></v-spacer>

                    <span class="mr-4 grey--text" >
                        Page {{ filter.pageIndex +1}} / {{ numberOfPages }}
                    </span>
                    <v-btn
                        fab small
                        dark
                        :disabled="isLoading"
                        color="accent"
                        class="mr-1"
                        @click="formerPage">
                        <v-icon>fa-chevron-left</v-icon>
                    </v-btn>
                    <v-btn
                        fab small
                        dark
                        :disabled="isLoading"
                        color="accent"
                        class="ml-1"
                        @click="nextPage"
                    >
                        <v-icon>fa-chevron-right</v-icon>
                    </v-btn>
                </v-row>
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
            pageIndex: 0, // page courante affiché (0 = page 1)
            pageSize: 24, // nombre de citations affichées par page
        },
    }),
    mounted() {
        axios.get(`/api/photos/to-check`).then(response => {
            this.photos = parseAxiosResponse(response);
            store.commit('photosGalleryReset', this.photos);
            console.log(this.photos);
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
        photosGalleryHide() {
            store.commit('photosGalleryHide');
        },
        nextPage () {
            if (this.filter.pageIndex + 1 <= this.numberOfPages) this.filter.pageIndex += 1
        },
        formerPage () {
            if (this.filter.pageIndex - 1 >= 1) this.filter.pageIndex -= 1
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
