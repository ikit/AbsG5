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
                            v-model="filter.search"
                            prepend-inner-icon="fa-search"
                            label="Rechercher une personne">
                        </v-text-field>
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
                            <v-img
                                width="150px"
                                height="150px"
                                class="thumb"
                                :src="p.thumb"
                                :alt="p.id"
                                @click="photosGalleryDisplay(index + (filter.pageIndex - 1) * filter.pageSize)"></v-img>
                        </v-flex>
                    </v-layout>
                </v-container>
            </template>
        </v-data-iterator>
    </v-container>


    <v-dialog v-model="trombiEditor.open" width="400px">
        <v-card>
            <v-card-title class="grey lighten-4 py-4 title">
                Nouvelle trombinette
            </v-card-title>
            <v-container grid-list-sm class="pa-4">

                <v-combobox
                    v-model="trombiEditor.person"
                    :items="persons"
                    label="Qui"
                    prepend-icon="fas fa-user"
                ></v-combobox>

                <v-menu
                    v-model="trombiEditor.dateOfTrombiMenu"
                    :close-on-content-click="true"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                >
                    <template v-slot:activator="{ on }">
                        <v-text-field
                            :rules="editorRules.date"
                            v-model="trombiEditor.date"
                            clearable
                            label="Quand"
                            prepend-icon="far fa-calendar-alt"
                            v-on="on"
                        ></v-text-field>
                    </template>
                    <v-date-picker v-model="trombiEditor.date" @input="dateOfTrombiMenu = false"></v-date-picker>
                </v-menu>

                <ImageEditor ref="imgEditor" icon="fas fa-camera" style="height: 300px;"/>
                <div v-if="trombiEditor.isLoading">
                    Enregistrement en cours : {{ trombiEditor.complete }}%
                </div>
            </v-container>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text color="primary" :disabled="trombiEditor.isLoading" @click="resetDialog()">Annuler</v-btn>
                <v-btn color="accent" :disabled="trombiEditor.isLoading" @click="saveTrombi()">Enregistrer</v-btn>
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
        persons: [],
        filter: {
            type: "nom",
            search: null,
            pageIndex: 1,
            pageSize: 50,
        },
        trombiEditor: {
            open: false,
            date: null,
            person: null,
            isLoading: false,
            complete: 0,

            dateOfTrombiMenu: false,
        },
        editorRules: {
            photo: [
                value => !value || value.size < 2000000 || 'La taille de la photo doit être inférieur à 2 MB',
            ],
            date: [
                value => {
                    const pattern = /^([0-9]{4})?(-[0-9]{2}(-[0-9]{2})?)?$/
                    return pattern.test(value) || 'La valeur doit être une date valide: YYYY ou bien YYYY-MM ou bien YYYY-MM-DD'
                }
            ],
        }

    }),
    mounted () {
        this.isLoading = true;
        // On récupère la liste des personnes et des lieux de l'agenda pour l'aide à la saisie
        if (this.persons.length === 0) {
            axios.get(`/api/agenda/persons`).then(response => {
                this.persons = parseAxiosResponse(response).filter(e => e.lastname && e.firstname).map(e => (
                    `${e.firstname} ${e.lastname}`.trim()
                ));
            });
        }
        // On récupère la liste des photos
        axios.get(`/api/agenda/trombi/`).then(response => {
            this.photos = parseAxiosResponse(response);
            this.isLoading = false;
            store.commit('photosGalleryReset', this.photos);
        });
    },
    computed: {
        numberOfPages () {
            return Math.ceil(this.photos.length / this.filter.pageSize)
        }
    },
    methods: {
        initGallery() {
            store.commit('photosGalleryReset', this.photos);
        },
        resetDialog (open = false) {
            this.trombiEditor.open = open;
            this.trombiEditor.date = null;
            this.trombiEditor.isLoading = false;
            this.trombiEditor.complete = 0;
        },
        saveTrombi: function () {
            const { imgEditor } = this.$refs;

            this.trombiEditor.isLoading = true;

            // On récupère l'image
            axios.get(imgEditor.imageUrl(), { responseType: 'blob' }).then(
                response => {
                    const formData = new FormData();
                    formData.append("date", this.trombiEditor.date);
                    formData.append("image", response.data )

                    // On envoie tout au serveur pour qu'il enregistre la nouvelle image du moment
                    axios.post(`/api/agenda/trombi`, formData, {
                        headers: {
                            "Content-Type" : "multipart/form-data",
                        },
                        onUploadProgress: progressEvent => {
                            this.trombiEditor.complete = (progressEvent.loaded / progressEvent.total * 100 | 0);
                        }
                    })
                    .then(newTrombi => {
                        // On ajoute l'image à la liste
                        this.photos.unshift(newTrombi);
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


.thumb {
    margin: auto;
    background: white;
    padding: 1px;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
    cursor: pointer;
}

</style>
