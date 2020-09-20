<template>
    <v-container fluid v-if="summary" style="text-align: center;">
        <v-layout row wrap>
            <v-flex v-for="edition in summary" :key="edition.year" style="width: 400px; max-width: 400px; margin: 15px">
                <router-link :to="{path: '/agpa/archives/' + edition.year}" style="text-decoration: none">
                    <v-card>
                        <v-img :src="getEditionPhoto(edition)" aspect-ratio="2.75"></v-img>

                        <v-card-title primary-title style="position: relative">
                            <h3 class="headline mb-0">Edition {{ edition.year }} </h3>
                            <div style="position: absolute; top: 0; right: 15px; text-align: right;">
                                <v-tooltip bottom v-for="(author, index) in edition.authors" :key="author.id">
                                    <template v-slot:activator="{ on }">
                                        <img style="height: 40px; margin-top: 10px;" :src="getAvatar(author)" :alt="getName(author)" v-on="on"/>
                                    </template>
                                    <span>{{ `${getPlace(index)}: ${getName(author)}` }}</span>
                                </v-tooltip>
                            </div>
                        </v-card-title>

                        <v-card-actions style="position: relative; padding-left: 18px;">
                            {{ edition.totalPhotos }} photos

                            <v-tooltip bottom v-if="edition.palmares">
                                <template v-slot:activator="{ on }">
                                    <div v-on="on" style="position: absolute; bottom: 10px; right: 15px; text-align: right; font-size: 0.9em;">
                                        <template v-if="edition.palmares.diamond">
                                            <i class="fas fa-circle" style="color: #c3f1ff"></i> {{ edition.palmares.diamond }}
                                        </template>
                                        <template v-if="edition.palmares.gold">
                                            <i class="fas fa-circle" style="color: #c68b00"></i> {{ edition.palmares.gold }}
                                        </template>
                                        <template v-if="edition.palmares.sylver">
                                            <i class="fas fa-circle" style="color: #9b9b9b"></i> {{ edition.palmares.sylver }}
                                        </template>
                                        <template v-if="edition.palmares.bronze">
                                            <i class="fas fa-circle" style="color: #964c31"></i> {{ edition.palmares.bronze }}
                                        </template>
                                        <template v-if="edition.palmares.nominated">
                                            <i class="far fa-circle"></i> {{ edition.palmares.nominated }}
                                        </template>
                                        <template v-if="edition.palmares.honor">
                                            <i class="far fa-smile"></i> {{ edition.palmares.honor }}
                                        </template>
                                    </div>
                                </template>
                                <span>Mon palmarès {{ edition.year }}</span>
                            </v-tooltip>
                        </v-card-actions>
                    </v-card>
                </router-link>
            </v-flex>
        </v-layout>
    </v-container>
</template>


<script>
import axios from 'axios';
import store from '../../store';
import { getPeopleAvatar, parseAxiosResponse } from '../../middleware/CommonHelper';

export default {
    name: 'Phase5',
    store,
    data: () => ({
        summary: []
    }),
    mounted () {
        axios.get(`/api/agpa/archives`).then(response => {
            this.summary = parseAxiosResponse(response);
            this.isLoading = false;
        }).catch( err => {
            store.commit("onError", err);
        });
    },
    methods: {
        getPlace(index) {
            return ["1er", "2e", "3e", "4e"][index];
        },
        getAvatar(author) {
            return getPeopleAvatar(author).url;
        },
        getName(author) {
            return author.firstname;
        },
        getEditionPhoto (edition) {
            if (edition) {
                return `/files/agpa/${edition.year}/mini/${edition.photos[0].filename}`;
            }
            return null
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
