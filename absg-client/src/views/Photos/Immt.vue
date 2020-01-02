<template>
<div>
    <div>
        <v-container fluid  grid-list-md>
            <v-data-iterator
                :items="immts"
                :items-per-page="filter.pageSize"
                :page="filter.pageIndex"
                :search="filter.request"
                hide-default-footer>

                <template v-slot:header>
                    <v-toolbar class="mb-1">
                        <v-text-field
                            v-model="filter.request"
                            prepend-inner-icon="fa-search"
                            label="Rechercher"
                            style="margin-top: 25px;">
                        </v-text-field>
                        <v-spacer></v-spacer>
                        <v-btn
                            color="accent"
                            @click.stop="resetDialog(true)">
                            <v-icon left>fas fa-plus</v-icon>
                            <span v-if="$vuetify.breakpoint.mdAndUp">Nouvelle image</span>
                        </v-btn>
                    </v-toolbar>
                </template>


                <template v-slot:default="props">
                    <v-card style="margin-top: 15px">
                        <v-container fluid>
                            <v-layout row wrap>
                                <v-flex v-for="(immt, index) in immts" :key="immt.id" style="min-width: 200px; width: 15%; margin: 15px">
                                    <div>
                                        <div style="width: 200px; height: 200px; margin: auto;">
                                            <div style="width: 200px; height: 200px; display: table-cell; text-align: center; vertical-align: middle;">
                                                <img class="thumb"
                                                    :src="immt.thumb"
                                                    @click="photosGalleryDisplay(index)"/>
                                            </div>
                                        </div>
                                        <div style="">
                                        </div>
                                        <v-card style="margin-bottom: 50px">
                                            <div style="text-align: center">
                                                {{ immt.title }}
                                            </div>
                                            <div style="text-align: center; font-size: 0.8em; opacity: 0.7">
                                                {{ immt.username }} le {{ immt.date }} </div>
                                        </v-card>
                                    </div>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card>
                </template>

                <template v-slot:footer>
                    <v-row class="mt-2" style="margin: 0 5px" align="center" justify="center">
                        <span class="grey--text">{{ totalImmts }} images. Immt par page</span>
                        <v-menu offset-y>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    text
                                    color="primary"
                                    class="ml-2"
                                    v-on="on">
                                        {{ filter.pageSize }}
                                    <v-icon>fa-angle-down</v-icon>
                                </v-btn>
                            </template>
                                <v-list>
                                <v-list-item
                                    v-for="(number, index) in [10, 20, 50]"
                                    :key="index"
                                    @click="updateImmtsPerPage(number)">
                                    <v-list-item-title>{{ number }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>

                        <v-spacer></v-spacer>

                        <span class="mr-4 grey--text" >
                            Page {{ filter.pageIndex +1}} / {{ totalPages }}
                        </span>
                        <v-btn
                            fab small
                            dark
                            color="accent"
                            class="mr-1"
                            @click="formerPage">
                            <v-icon>fa-chevron-left</v-icon>
                        </v-btn>
                        <v-btn
                            fab small
                            dark
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
    </div>


    <v-dialog v-model="immtEditor.open" width="800px">
        <v-card>
            <v-card-title class="grey lighten-4 py-4 title">
            Nouvelle image du moment
            </v-card-title>
            <v-container grid-list-sm class="pa-4">
                <ImageEditor style="height: 300px; position: relative"/>
                <!-- <v-text-field label="Donnez un titre à l'image" v-model='immtEditor.title' prepend-icon='fas fa-feather-alt'></v-text-field> -->
            </v-container>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="resetDialog()">Annuler</v-btn>
            <v-btn color="accent" @click="saveImmt()">Enregistrer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</div>
</template>



<script>
import axios from 'axios';
import { parseAxiosResponse, getPeopleAvatar, padNumber } from '../../middleware/CommonHelper';
import ImageEditor from '../../components/ImageEditor.vue';
import store from '../../store';

export default {
    components: {
        ImageEditor
    },
    store,
    data: () => ({
        isLoading: false,
        totalImmts: 0,
        totalPages: 0,
        immts: [],
        filter: {
            request: "",
            authorId: null,
            pageIndex: 0,
            pageSize: 20,
        },
        immtEditor: {
            open: false,
            image: null,
            title: null,
            isValid: true,
        },
    }),
    mounted () {
        if (!this.authors) {
            // Il faut initialiser la vue
            this.isLoading = true;
            axios.get(`/api/immt/init`).then(response => {
                const data = parseAxiosResponse(response);
                this.immts = data.immts.map(i => {
                    const id = `${i.year}_${padNumber(i.day, 3)}`
                    return {
                        id,
                        username: i.posterName,
                        title: i.title,
                        date: new Date().toLocaleDateString(),
                        url: `http://absolumentg.fr/assets/img/immt/${id}.jpg`,
                        thumb: `http://absolumentg.fr/assets/img/immt/mini/${id}.jpg`,
                    }
                });
                this.totalImmts = data.total;
                this.isLoading = false;
                store.commit('photosGalleryReset', this.immts);
            });
        }
    },
    methods: {
        initGallery() {
            store.commit('photosGalleryReset', this.immts);
        },
        resetDialog (open = false) {
            this.immtEditor.open = open;
            this.immtEditor.citationId = null;
            this.immtEditor.citation = null;
            this.immtEditor.author = null;
        },
        saveImmt: function () {
            this.citations.push({
                authorAvatar: `/img/avatars/016.png`,
                authorId: 16,
                authorName: this.immtEditor.author,
                citation: this.immtEditor.citation,
            });
            this.resetDialog();
        },
        formerPage() {
            console.log("page précédente");
        },
        nextPage() {
            console.log("page suivante");
        },
        updateImmtsPerPage(count) {
            console.log("updateImmtsPerPage");
        },
        photosGalleryDisplay(index) {
            store.commit('photosGallerySetIndex', index);
            store.commit('photosGalleryDisplay');
        },
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
