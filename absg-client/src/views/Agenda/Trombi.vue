<template>
<div>
    <v-container fluid  grid-list-md style="padding:0">
        <v-data-iterator
            :items="photos"
            :items-per-page="filter.pageSize"
            :page="filter.pageIndex"
            :search="filter.search"
            loading-text="Récupération des données..."
            no-data-text="Aucune photo enregistré dans le trombinoscope."
            no-results-text="Aucune photo trouvée."
            hide-default-footer>

            <template v-slot:header>
                <div class="stickyHeader">
                    <v-row style="" align="center" justify="center">
                        <v-menu offset-y>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    text
                                    color="primary"
                                    class="ml-2"
                                    :disabled="isLoading"
                                    v-on="on">
                                        {{ filter.type }}
                                    <v-icon>fa-angle-down</v-icon>
                                </v-btn>
                            </template>
                                <v-list>
                                <v-list-item
                                    v-for="(type, index) in ['nom', 'date', 'age']"
                                    :key="index"
                                    @click="updateFilterType(index)">
                                    <v-list-item-title>{{ type }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>

                        <v-text-field
                            v-if="filter.type === 'name'"
                            v-model="filter.search"
                            prepend-inner-icon="fa-search"
                            label="Rechercher une personne">
                        </v-text-field>
                        <!-- <span class="grey--text">{{immts.length}} images</span> -->
                        <v-spacer></v-spacer>



                        <v-btn
                            icon small
                            :disabled="isLoading"
                            @click="formerPage">
                            <v-icon>fa-chevron-left</v-icon>
                        </v-btn>
                        <span class="grey--text" >
                            Page {{ filter.pageIndex}} / {{ numberOfPages }}
                        </span>
                        <v-btn
                            icon small
                            :disabled="isLoading"
                            @click="nextPage"
                        >
                            <v-icon>fa-chevron-right</v-icon>
                        </v-btn>

                        <v-spacer></v-spacer>

                        <v-btn
                            @click.stop="resetDialog(true)">
                            <v-icon left>fas fa-plus</v-icon>
                            <span v-if="$vuetify.breakpoint.mdAndUp">Nouvelle image</span>
                        </v-btn>
                    </v-row>
                </div>
            </template>

            <template v-slot:default="props">
                <v-container fluid grid-list-sm>
                    <v-layout row wrap>
                        <v-flex v-for="(p, index) in props.items" :key="p.id">
                            <v-img :src="p.thumb" class="thumb" style="margin: auto" :alt="p.id" @click="photosGalleryDisplay(index + (filter.pageIndex - 1) * filter.pageSize)" width="150px" height="150px"></v-img>
                        </v-flex>
                    </v-layout>
                </v-container>
            </template>
        </v-data-iterator>
    </v-container>


    <v-dialog v-model="trombiEditor.open" width="800px">
        <v-card>
            <v-card-title class="grey lighten-4 py-4 title">
                Nouvelle trombinette
            </v-card-title>
            <v-container grid-list-sm class="pa-4">

                <v-text-field
                    prepend-icon="fas fa-feather-alt"
                    label="Titre"
                    v-model="trombiEditor.date">
                </v-text-field>
                <ImageEditor ref="imgEditor" style="height: 300px; position: relative"/>
                <div v-if="trombiEditor.isLoading">
                    Enregistrement en cours : {{ trombiEditor.complete }}%
                </div>
            </v-container>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text color="primary" :disabled="trombiEditor.isLoading" @click="resetDialog()">Annuler</v-btn>
                <v-btn color="accent" :disabled="trombiEditor.isLoading" @click="saveImmt()">Enregistrer</v-btn>
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
        photos: [],
        filter: {
            type: "nom",
            search: null,
            pageIndex: 1,
            pageSize: 50,
        },
        trombiEditor: {
            open: false,
            date: null,
            isLoading: false,
            complete: 0,
        },

    }),
    mounted () {
        this.isLoading = true;
        axios.get(`/api/agenda/trombi/`).then(response => {
            this.photos = parseAxiosResponse(response);
            this.isLoading = false;
            // store.commit('photosGalleryReset', this.immts);
        });
    },
    computed: {
        numberOfPages () {
            return Math.ceil(this.photos.length / this.filter.pageSize)
        }
    },
    methods: {
        initGallery() {
            store.commit('photosGalleryReset', this.immts);
        },
        resetDialog (open = false) {
            this.immtEditor.open = open;
            this.immtEditor.title = null;
            this.immtEditor.isLoading = false;
            this.immtEditor.complete = 0;
        },
        saveImmt: function () {
            const { imgEditor } = this.$refs;

            this.immtEditor.isLoading = true;

            // On récupère l'image
            axios.get(imgEditor.imageUrl(), { responseType: 'blob' }).then(
                response => {
                    const formData = new FormData();
                    formData.append("title", this.immtEditor.title);
                    formData.append("image", response.data )

                    // On envoie tout au serveur pour qu'il enregistre la nouvelle image du moment
                    axios.post(`/api/immt`, formData, {
                        headers: {
                            "Content-Type" : "multipart/form-data",
                        },
                        onUploadProgress: progressEvent => {
                            this.immtEditor.complete = (progressEvent.loaded / progressEvent.total * 100 | 0);
                        }
                    })
                    .then(newImmt => {
                        // On ajoute l'image à la liste des immt
                        this.immts.unshift(newImmt);
                        this.resetDialog();
                    })
                    .catch(err => {
                        store.commit("onError", err);
                    });
                }
            );
        },
        nextPage () {
            if (this.filter.pageIndex < this.numberOfPages) this.filter.pageIndex += 1
        },
        formerPage () {
            if (this.filter.pageIndex > 1) this.filter.pageIndex -= 1
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
</style>
