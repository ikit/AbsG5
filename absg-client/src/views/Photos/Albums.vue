<template>
    <v-container fluid>
        <v-layout row wrap>
            <!-- Les albums prédéfinis -->
            <v-flex style="max-width: 400px; margin: 15px">
                <v-card @click="openChrologie()">
                    <v-img src="/files/albums/chronologie.jpg" aspect-ratio="1.5">
                        <div class="albumInfo" style="position: absolute; bottom: 0; right: 0; left: 0; text-align: right; font-size: 0.9em; background: rgba(0,0,0, 0.5); padding: 5px; color: #fff">
                            {{ sortedPhotosCount }} photos
                        </div>
                    </v-img>
                    <v-card-title primary-title style="position: relative">
                        Chronologie
                    </v-card-title>
                    <v-card-subtitle>
                        Toutes les photos triées dans l'ordre chronologie
                    </v-card-subtitle>
                </v-card>
            </v-flex>

            <v-flex v-for="album in albums" :key="album.id" style="max-width: 400px; margin: 15px">
                <router-link :to="{path: `/photo/albums/${album.id}`}" style="text-decoration: none">
                    <v-card >
                        <v-img :src="album.thumb" aspect-ratio="1.5">
                            <div class="albumInfo">
                                {{ album.photos.length }} photos
                            </div>
                        </v-img>

                        <v-card-title primary-title style="position: relative">
                            {{ album.title }}
                        </v-card-title>
                        <v-card-subtitle>
                            {{ album.subtitle }}
                        </v-card-subtitle>
                    </v-card>
                </router-link>
            </v-flex>
        </v-layout>
    </v-container>
</template>


<script>
import axios from 'axios';
import store from '../../store';
import { parseAxiosResponse } from '../../middleware/CommonHelper';

export default {
    store,
    data: () => ({
        sortedPhotosCount: 25,
        albums: []
    }),
    methods: {
        openChrologie() {
            axios.get(`/api/photos/checked`).then(response => {
                let idx = 0;
                this.photos = parseAxiosResponse(response).map(e => ({
                    ...e,
                    title: `${e.date}${e.place ? " - " + e.place : ""}${ e.persons ? " - " + e.persons.join(', ') : ""}${e.comment ? " - " + e.comment : ""}`,
                    index: idx++ }));
                store.commit('photosGalleryReset', this.photos);
                store.commit('photosGallerySetIndex', 0);
                store.commit('photosGalleryDisplay');
            }).catch( err => {
                store.commit('onError', err);
            });
        }
    }
}
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';

.albumInfo {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    text-align: right;
    font-size: 0.9em;
    background: rgba(0,0,0, 0.5);
    padding: 5px;
    color: #fff;
}
</style>
