<template>
    <v-container fluid>
        <v-layout row wrap>
            <v-flex v-for="album in albums" :key="album.id" style="max-width: 400px; margin: 15px">
                <router-link :to="{path: `/photo/albums/${album.id}`}" style="text-decoration: none">
                    <v-card >
                        <v-img
                            :src="album.thumb"
                            aspect-ratio="1.5">
                        </v-img>

                        <v-card-title primary-title style="position: relative">
                            <h3 class="headline mb-0">{{ album.title }} </h3>
                            <div style="position: absolute; top: 0; right: 15px; text-align: right;">
                                <v-tooltip bottom v-for="author in album.authors" :key="author.id">
                                    <template v-slot:activator="{ on }">
                                        <img style="height: 40px; margin-top: 10px;" :src="author.avatar" :alt="author.username" v-on="on"/>
                                    </template>
                                    <span>{{ author.username }}</span>
                                </v-tooltip>
                            </div>
                        </v-card-title>

                        <v-card-actions style="position: relative">
                            <div style="position: absolute; bottom: 20px; right: 15px; text-align: right; font-size: 0.9em;">
                                {{ album.photos.length }} photos
                            </div>
                        </v-card-actions>
                    </v-card>
                </router-link>
            </v-flex>
        </v-layout>
    </v-container>
</template>


<script>
import Vue from 'vue';

export default {
    data: () => ({
        albums: [
            {
                id: 1,
                title: "Album 1",
                thumb: "https://images.lanouvellerepublique.fr/image/upload/t_1020w/f_auto/5b95be27be7744fb5c8b467b.jpg",
                authors: [{id: 2, username: "Olive", avatar: "", }],
                photos: []
            }
        ]
    })
}
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';
</style>
