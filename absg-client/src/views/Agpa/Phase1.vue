<template>

<section id="content">
    <div :class="{ stickyHeader: $vuetify.breakpoint.lgAndUp, stickyHeaderSmall: !$vuetify.breakpoint.lgAndUp }">
      <v-row style="padding: 15px">
        <v-tooltip
          v-if="$vuetify.breakpoint.mdAndUp"
          bottom
        >
          <template #activator="{ on }">
            <v-icon
              left
              style="margin-top:-10px; font-size: 30px"
            >
              far fa-question-circle
            </v-icon>
            <div
              class="phase-left-header"
              v-on="on"
              @click="help.displayed = true; help.page = 3"
            >
              <h4>Phase n°1 en cours : Enregistrement des photos</h4>
              <p>Phase n°2 Vérification - à partir du {{ end }}</p>
            </div>
          </template>
          <span>Besoin d'aide sur la phase actuelle du concours ?</span>
        </v-tooltip>

        <v-spacer />
      </v-row>
      <v-progress-linear
        v-if="isLoading"
        color="accent"
        indeterminate
        style="position: absolute; bottom: -5px; left: 0; right: 0; height: 5px"
      />
    </div>
    <div v-if="agpaMeta">
        <div
        v-for="catIdx of agpaMeta.categoriesOrders"
        :key="catIdx"
        style="margin: 15px; margin-top: 50px;"
        >
        <v-card style="margin: 15px auto; width: 650px; min-width: 400px; display: relative; padding: 40px 0 10px 0;">
            <img
            :src="`/img/agpa/cupesMaxi/c${catIdx}.png`"
            width="100px"
            style="position: absolute; top: -50px; left: 275px"
            >
            <v-row style="padding: 5px 15px; margin: 0; background: #efefef; border: 1px solid #ddd; border-width: 1px 0">
            <span style="font-family: 'Tangerine', serif; font-size: 2em">
                {{ agpaMeta.categories[catIdx].title }}
            </span>
            <v-spacer />
            <v-tooltip bottom>
                <v-spacer />
                <template #activator="{ on }">
                <span
                    style="line-height: 48px; margin-right: 10px;"
                    v-on="on"
                ><i class="far fa-user" /> {{ agpaMeta.categories[catIdx].totalUsers }}</span>
                </template>
                <span>Nombre total de participants</span>
            </v-tooltip>
                    &nbsp; &nbsp;
            <v-tooltip bottom>
                <v-spacer />
                <template #activator="{ on }">
                <span
                    style="line-height: 48px"
                    v-on="on"
                ><i class="far fa-image" /> {{ agpaMeta.categories[catIdx].totalPhotos }}</span>
                </template>
                <span>Nombre total de photos</span>
            </v-tooltip>
            </v-row>
            <p style="font-size:0.9em; margin: 10px; text-align: center">
            {{ agpaMeta.categories[catIdx].description }}
            </p>
            <div style="display: flex; width: 100%;">
            <template v-for="(photo, idx) in photos">
                <PhotoWidget
                v-if="photo.categoryId == catIdx"
                :key="idx"
                style="display: inline-block; width: 250px; margin: 0 auto;"
                :photo="photo"
                @new-photo="onNewPhoto(catIdx)"
                @edit-photo="onEditPhoto(photo)"
                @delete-photo="onDeletePhoto(photo)"
                />
            </template>
            </div>
        </v-card>
        </div>

        <!-- Enregistrement/Edition photo -->
        <v-dialog
        v-model="photoEditor.open"
        width="800px"
        >
        <v-card>
            <v-card-title class="grey lighten-4 py-4 title">
            Nouvelle photo {{ agpaMeta.categories[photoEditor.categoryId].title }}
            </v-card-title>
            <v-container
            grid-list-sm
            class="pa-4"
            >
            <v-text-field
                v-model="photoEditor.title"
                prepend-icon="fas fa-feather-alt"
                label="Titre"
            />
            <ImageEditor
                ref="imgEditor"
                :former-url="photoEditor.photo ? photoEditor.photo.url : ''"
                icon="fas fa-camera"
                style="height: 300px;"
            />
            <div v-if="photoEditor.isLoading">
                Enregistrement en cours : {{ photoEditor.complete }}%
            </div>
            </v-container>
            <v-card-actions>
            <v-spacer />
            <v-btn
                text
                color="primary"
                :disabled="photoEditor.isLoading"
                @click="resetEditor()"
            >
                Annuler
            </v-btn>
            <v-btn
                color="accent"
                :disabled="photoEditor.isLoading"
                @click="savePhoto()"
            >
                Enregistrer
            </v-btn>
            </v-card-actions>
        </v-card>
        </v-dialog>

        <!-- Suppression photo -->
        <v-dialog
        v-model="photoDeletion.open"
        width="800px"
        >
        <v-card v-if="photoDeletion.photo">
            <v-card-title class="grey lighten-4">
            Êtes vous sûr de vouloir supprimer cette photo ?
            </v-card-title>
            <div style="text-align: center; margin-top: 10px">
            <img
                :src="photoDeletion.photo.thumb"
                style="margin:auto"
                class="thumb"
            >
            <p style="margin: 10px;">
                {{ photoDeletion.photo.title }}
            </p>
            </div>
            <v-card-actions>
            <v-spacer />
            <v-btn
                text
                color="primary"
                @click="photoDeletion.open = false"
            >
                Annuler
            </v-btn>
            <v-btn
                color="accent"
                @click="deletePhoto()"
            >
                Supprimer
            </v-btn>
            </v-card-actions>
        </v-card>
        </v-dialog>


        <!-- Aide -->
        <v-dialog
        v-model="help.displayed"
        width="800px"
        >
        <v-card>
            <v-card-title class="grey lighten-4">
            <v-icon left>
                far fa-question-circle
            </v-icon>
            Aide sur le déroulement du concours
            </v-card-title>
            <Help selected-tab="2" />
            <v-card-actions>
            <v-spacer />
            <v-btn
                text
                color="primary"
                @click="help.displayed = false"
            >
                Fermer
            </v-btn>
            </v-card-actions>
        </v-card>
        </v-dialog>
    </div>
</section>
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
import Help from './components/Help';

export default {
    name: 'Phase1',
    components: {
        PhotoWidget,
        ImageEditor,
        Help
    },
    store,
    data: () => ({
        photos: {},
        photoEditor: {
            open: false,
            isLoading: false,
            complete: 0,
            categoryId: -1,
            title: "",
            photo: null
        },
        photoDeletion: {
            open: false,
            photo: null
        },
        help: {
            displayed: false,
            page: 0
        },
        end: null,
    }),
    computed: {
        ...mapState([
            'agpaMeta',
        ]),
    },
    watch: {
        'agpaMeta': function () {
            this.refreshGallery();
        }
    },
    mounted () {
        if (this.agpaMeta) {
            this.refreshGallery();
        } else {
            store.dispatch('initAGPA');
        }
    },
    methods: {
        refreshGallery() {
            // Fin de la phase 1
            this.end = format(new Date(this.agpaMeta.boudaries[0].endDate), "dd MMM 'à' HH'h'mm", {locale: fr})

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
                    for (let p of data.photos) {
                        const idx = this.photos.findIndex(e => e.id === -1 && e.categoryId === p.categoryId);
                        if (idx >= 0) {
                            this.photos[idx] = p;
                        }
                    }
                    for (let s of data.stats) {
                        this.agpaMeta.categories[s.categoryId].totalUsers = s.totalUsers;
                        this.agpaMeta.categories[s.categoryId].totalPhotos = s.totalPhotos;
                    }
                })
                .catch(err => {
                    store.commit("onError", err);
                });
        },

        resetEditor (open = false, photo = null) {
            this.photoEditor.open = open;
            this.photoEditor.isLoading = false;
            this.photoEditor.complete = 0;
            this.photoEditor.categoryId = photo ? photo.categoryId : -1;
            this.photoEditor.title = photo ? photo.title : null;
            this.photoEditor.photo = photo;
            setTimeout(() => {
                const { imgEditor } = this.$refs;
                imgEditor.reset();
            });
        },
        savePhoto: function () {
            const { imgEditor } = this.$refs;
            this.photoEditor.isLoading = true;

            // On récupère l'image
            const imageUrl = imgEditor.imageUrl();
            if (imageUrl) {
                // Nouvelle image enregistrée ou modifiée: on doit d'abord récupérer l'image elle même.
                axios.get(imageUrl, { responseType: 'blob' }).then(
                    response => {
                        const photoId = this.photoEditor.photo ? this.photoEditor.photo.id : null;
                        this.savePhotoApiCall(this.photoEditor.categoryId, photoId, this.photoEditor.title, response.data);
                    }
                ).catch( err => {
                    store.commit("onError", err);
                });
            } else {
                // Edition d'une photo sans modification de l'image
                this.savePhotoApiCall(this.photoEditor.categoryId, this.photoEditor.photo.id, this.photoEditor.title, null);
            }

        },
        savePhotoApiCall(catId, photoId, title, imageData) {
            const formData = new FormData();
            formData.append("catId", catId);
            formData.append("title", title);
            if (imageData) {
                formData.append("image", imageData);
            }
            if (photoId) {
                formData.append("id", photoId);
            }

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
                this.resetEditor();
                this.refreshGallery();
            })
            .catch(err => {
                store.commit("onError", err);
            });
        },

        deletePhoto() {
            axios.delete(`/api/agpa/photo/${this.photoDeletion.photo.id}`)
                .then(response => {
                    this.photoDeletion.open = false;
                    this.photoDeletion.photo = null;
                    this.refreshGallery();
                })
                .catch(err => {
                    store.commit("onError", err);
                });
        },
        onNewPhoto(catId, photoId = null) {
            this.resetEditor(true);
            this.photoEditor.categoryId = catId;
        },
        onEditPhoto(photo) {
            this.resetEditor(true, photo);
        },
        onDeletePhoto(photo) {
            this.photoDeletion.open = true;
            this.photoDeletion.photo = photo;
        }

    }
};
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';

@import '../../themes/global.scss';
@import '../../themes/agpa.scss';

#content {
    text-align: center;
}

.phase-left-header {
    margin: -5px 0 -10px 0;
    cursor: pointer;

    h2 {
        font-size: 20px;
        line-height: 20px;
        text-align: left;
        font-family: 'Times New Roman', Times, serif;
    }
    p {
        text-align: left;
        font-size: 15px;
        line-height: 20px;
        opacity: 0.5;
        margin: 0;
    }
}
.phase-right-header {
    margin: -5px 0 -10px 0;
    opacity: 0.5;
    cursor: pointer;

    h4 {
        font-size: 20px;
        line-height: 20px;
        text-align: right;
    }
    p {
        text-align: right;
        font-size: 15px;
        line-height: 20px;
        margin: 0;
    }
}


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
.thumb {
    background: white;
    padding: 1px;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
}
</style>
