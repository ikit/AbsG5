<template>
<div>

    <v-container fluid v-if="summary" style="text-align: center;">
        <v-layout row wrap>
            <v-flex v-for="edition in summary" :key="edition.year" style="min-width: 380px; max-width:800px; width: 40%; margin: 15px">
                <v-card>
                    <router-link :to="{path: '/agpa/archives/' + edition.year}">
                        <v-img
                            :src="getEditionPhoto(edition)"
                            aspect-ratio="2.75">
                        </v-img>
                    </router-link>

                    <v-card-title primary-title style="position: relative">
                        <h3 class="headline mb-0">Edition {{ edition.year }} </h3>
                        <div style="position: absolute; top: 0; right: 15px; text-align: right;">
                            <v-tooltip bottom v-for="author in edition.authors" :key="author.id">
                                <template v-slot:activator="{ on }">
                                    <img style="height: 40px; margin-top: 10px;" :src="getAvatar(author)" :alt="getName(author)" v-on="on"/>
                                </template>
                                <span>{{ getName(author) }}</span>
                            </v-tooltip>
                        </div>
                    </v-card-title>

                    <v-card-actions style="position: relative">
                        <router-link :to="{path: '/agpa/archives/' + edition.year}" style="text-decoration: none">
                            <v-btn text color="accent">Voir les photos</v-btn>
                        </router-link>
                        <div style="position: absolute; bottom: 20px; right: 15px; text-align: right; font-size: 0.9em;">
                            {{ edition.totalPhotos }} photos
                        </div>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</div>
</template>


<script>
import axios from 'axios';
import { getPeopleAvatar } from '../../middleware/CommonHelper';

export default {
    name: 'Phase5',
    data: () => ({
        summary: []
    }),
    mounted () {
        axios.get(`/api/agpa/archives`).then(response => {
            this.summary = response.status === 200 ? response.data : null;
            this.error = response.status !== 200 ? response : null;
            this.isLoading = false;
        });
    },
    methods: {
        getAvatar(author) {
            return getPeopleAvatar(author).url;
        },
        getName(author) {
            return author.firstname;
        },
        getEditionPhoto (edition) {
            return `http://absolumentg.fr/assets/img/agpa/${edition.year}/mini/${edition.photos[0].filename}`;;
        },
    }

};
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';

h3 {
    font-family: 'Tangerine', serif;
    color: orange;
}
</style>
