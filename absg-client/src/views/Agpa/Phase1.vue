<template>
<div>
    <div v-for="catIdx of agpaMeta.categoriesOrders" :key="catIdx" style="margin: 15px; margin-top: 50px;">
        <v-card style="margin: 15px auto; width: 650px; min-width: 400px; display: relative; padding: 40px 0 10px 0;">
            <img :src="`/img/agpa/cupesMaxi/c${catIdx}.png`" width="100px" style="position: absolute; top: -50px; left: 275px"/>
            <v-row style="padding: 5px 15px; margin: 0; background: #efefef; border: 1px solid #ddd; border-width: 1px 0">
                <span style="font-family: 'Tangerine', serif; font-size: 2em">
                    {{ agpaMeta.categories[catIdx].title }}
                </span>
                <v-spacer></v-spacer>
                <v-tooltip bottom>
                    <v-spacer></v-spacer>
                    <template v-slot:activator="{ on }">
                        <span v-on="on" style="line-height: 48px"><i class="far fa-user"></i> {{ agpaMeta.categories[catIdx].totalUsers }}</span>
                    </template>
                    <span >Nombre total de participants</span>
                </v-tooltip>
                &nbsp; &nbsp;
                <v-tooltip bottom>
                    <v-spacer></v-spacer>
                    <template v-slot:activator="{ on }">
                        <span v-on="on" style="line-height: 48px"><i class="far fa-image"></i> {{ agpaMeta.categories[catIdx].totalPhotos }}</span>
                    </template>
                    <span >Nombre total de photos</span>
                </v-tooltip>
            </v-row>
            <p style="font-size:0.9em; margin: 10px; text-align: center">{{ agpaMeta.categories[catIdx].description }}</p>
            <div style="display: flex; width: 100%;">
                <template v-for="(photo, idx) in photos">
                    <PhotoWidget
                        v-if="photo.categoryId == catIdx"
                        :key="idx"
                        style="display: inline-block; width: 250px; margin: 0 auto;"
                        :photo="photo"
                        @new-photo="onNewPhoto(catIdx)">
                    </PhotoWidget>

                </template>
            </div>
        </v-card>
    </div>


    <v-dialog v-model="photoEditor.open" width="800px">
        <v-card>
            <v-card-title class="grey lighten-4 py-4 title">
                Nouvelle photo "{{ agpaMeta.categories[photoEditor.categoryId].title }}"
            </v-card-title>
            <v-container grid-list-sm class="pa-4">
                <v-text-field
                    prepend-icon="fas fa-feather-alt"
                    label="Titre"
                    v-model="photoEditor.title">
                </v-text-field>
                <ImageEditor ref="imgEditor" icon="fas fa-camera" style="height: 300px;"/>
                <div v-if="photoEditor.isLoading">
                    Enregistrement en cours : {{ photoEditor.complete }}%
                </div>
            </v-container>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text color="primary" :disabled="photoEditor.isLoading" @click="resetEditor()">Annuler</v-btn>
                <v-btn color="accent" :disabled="photoEditor.isLoading" @click="savePhoto()">Enregistrer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- <v-dialog v-model="photoDeletion.open" width="800px">
        <v-card>
            <v-card-title class="grey lighten-4">
                Supprimer une photo
            </v-card-title>
            <p style="margin: 0 24px;">Êtes vous sûr de vouloir supprimer cette photo ?</p>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="citationDeletion.open = false">Annuler</v-btn>
            <v-btn color="accent" @click="deleteCitation()">Supprimer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog> -->
</div>
</template>


<script>
import axios from 'axios';
import { mapState } from 'vuex';
import { getModuleInfo, getPeopleAvatar, parseAxiosResponse } from '../../middleware/CommonHelper';
import { format } from 'date-fns';
import { fr } from "date-fns/locale";
import PhotoWidget from './components/PhotoWidget';
import ImageEditor from '../../components/ImageEditor.vue';
import store from '../../store';

export default {
    components: {
        PhotoWidget,
        ImageEditor
    },
    store,
    name: 'Phase1',
    data: () => ({
        photos: {},
        photoEditor: {
            open: false,
            isLoading: false,
            complete: 0,
            categoryId: -1,
            title: "",
            photo: null
        }
    }),
    computed: {
        ...mapState([
            'agpaMeta',
        ]),
    },
    mounted () {
        this.refreshGallery();
    },
    methods: {
        refreshGallery() {
            // Récupérer la participation de l'utilisateur et les stats
            axios.get(`/api/agpa/p1`).then(
                response => {
                    // On initialise les slots
                    this.photos = [];
                    for (let catIdx of this.agpaMeta.categoriesOrders) {
                        this.photos.push({ id: -1, categoryId: catIdx });
                        this.photos.push({ id: -1, categoryId: catIdx });
                    }
                    // On insère les photos de l'utilisateurs
                    const data = parseAxiosResponse(response);
                    for (let p of data) {
                        const idx = this.photos.findIndex(e => e.id === -1 && e.categoryId === p.categoryId);
                        if (idx >= 0) {
                            this.photos[idx] = p;
                        }
                    }
                    console.log(this.photos);
                })
                .catch(err => {
                    store.commit("onError", err);
                });
        },

        resetEditor (open = false) {
            this.photoEditor.open = open;
            this.photoEditor.isLoading = false;
            this.photoEditor.complete = 0;
            this.photoEditor.categoryId = -1;
            this.photoEditor.title = "";
        },
        savePhoto: function () {
            const { imgEditor } = this.$refs;
            this.photoEditor.isLoading = true;

            // On récupère l'image
            axios.get(imgEditor.imageUrl(), { responseType: 'blob' }).then(
                response => {
                    const formData = new FormData();
                    formData.append("title", this.photoEditor.title);
                    formData.append("catId", this.photoEditor.categoryId);
                    formData.append("image", response.data);


                    // On envoie tout au serveur pour qu'il enregistre la nouvelle image du moment
                    axios.post(`/api/agpa/photo`, formData, {
                        headers: {
                            "Content-Type" : "multipart/form-data",
                        },
                        onUploadProgress: progressEvent => {
                            this.photoEditor.complete = (progressEvent.loaded / progressEvent.total * 100 | 0);
                        }
                    })
                    .then(newPhoto => {
                        // TODO: ajoute la photo
                        console.log(newPhoto);
                        this.resetEditor();
                    })
                    .catch(err => {
                        store.commit("onError", err);
                    });
                }
            );
        },
        onNewPhoto(catId, photoId = null) {
            this.resetEditor(true);

            this.photoEditor.categoryId = catId;
            console.log(catId, photoId, this.photoEditor);
        }
    }
};
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';

h2 {
    font-family: 'Tangerine', serif;
    color: orange;
    font-size: 3em;
}
h3 {
    font-family: 'Tangerine', serif;
    color: $accent;
    font-size: 2.5em;
}

.emptySlot{
    display: block;
    width: 200px;
    line-height: 200px;
    background: transparent url('/img/agpa/photoSlot.png') 0 0 no-repeat;
}
.emptySlot:hover {
    cursor: pointer;
    background-position-y: -200px;
}
</style>
