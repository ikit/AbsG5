<template>
  <section id="content">
    <div :class="{ stickyHeader: $vuetify.display.lgAndUp, stickyHeaderSmall: !$vuetify.display.lgAndUp }">
      <v-row style="padding: 15px">
        <v-tooltip
          v-if="$vuetify.display.mdAndUp"
          bottom
        >
          <template #activator="{ props }">
            <v-icon
              left
              style="margin-top:-10px; font-size: 30px"
            >
              far fa-question-circle
            </v-icon>
            <div
              class="phase-left-header"
              v-bind="props"
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
        :style="{
          margin: $vuetify.display.smAndDown ? '10px' : '15px',
          marginTop: $vuetify.display.smAndDown ? '40px' : '50px'
        }"
      >
        <v-card
          :style="{
            margin: $vuetify.display.smAndDown ? '0 auto' : '15px auto',
            width: $vuetify.display.smAndDown ? '100%' : '650px',
            maxWidth: $vuetify.display.smAndDown ? '100%' : '650px',
            minWidth: $vuetify.display.smAndDown ? 'auto' : '400px',
            display: 'relative',
            padding: $vuetify.display.smAndDown ? '35px 0 10px 0' : '40px 0 10px 0',
            overflow: 'visible'
          }"
        >
          <img
            :src="`/img/agpa/cupesMaxi/c${catIdx}.png`"
            :style="{
              position: 'absolute',
              top: $vuetify.display.smAndDown ? '-40px' : '-50px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: $vuetify.display.smAndDown ? '80px' : '100px',
              height: $vuetify.display.smAndDown ? '80px' : '100px',
              objectFit: 'contain'
            }"
          >
          <v-row
            :style="{
              padding: $vuetify.display.smAndDown ? '5px 10px' : '5px 15px',
              margin: 0,
              background: '#efefef',
              border: '1px solid #ddd',
              borderWidth: '1px 0',
              flexWrap: $vuetify.display.smAndDown ? 'wrap' : 'nowrap'
            }"
          >
            <span
              :style="{
                fontFamily: 'Tangerine, serif',
                fontSize: $vuetify.display.smAndDown ? '1.5em' : '2em',
                width: $vuetify.display.smAndDown ? '100%' : 'auto',
                textAlign: $vuetify.display.smAndDown ? 'center' : 'left'
              }"
            >
              {{ agpaMeta.categories[catIdx].title }}
            </span>
            <v-spacer v-if="!$vuetify.display.smAndDown" />
            <div
              :style="{
                display: 'flex',
                gap: '10px',
                width: $vuetify.display.smAndDown ? '100%' : 'auto',
                justifyContent: $vuetify.display.smAndDown ? 'center' : 'flex-end',
                marginTop: $vuetify.display.smAndDown ? '5px' : '0'
              }"
            >
              <v-tooltip bottom>
                <template #activator="{ props }">
                  <span
                    style="line-height: 48px;"
                    v-bind="props"
                  ><i class="far fa-user" /> {{ agpaMeta.categories[catIdx].totalUsers }}</span>
                </template>
                <span>Nombre total de participants</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template #activator="{ props }">
                  <span
                    style="line-height: 48px"
                    v-bind="props"
                  ><i class="far fa-image" /> {{ agpaMeta.categories[catIdx].totalPhotos }}</span>
                </template>
                <span>Nombre total de photos</span>
              </v-tooltip>
            </div>
          </v-row>
          <p
            :style="{
              fontSize: '0.9em',
              margin: '10px',
              textAlign: 'center',
              padding: $vuetify.display.smAndDown ? '0 10px' : '0'
            }"
          >
            {{ agpaMeta.categories[catIdx].description }}
          </p>
          <div
            :style="{
              display: 'flex',
              width: '100%',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: $vuetify.display.smAndDown ? '10px' : '0'
            }"
          >
            <template v-for="(photo, idx) in photos">
              <PhotoWidget
                v-if="photo.categoryId == catIdx"
                :key="idx"
                :style="{
                  display: 'inline-block',
                  width: $vuetify.display.smAndDown ? 'calc(50% - 5px)' : '250px',
                  minWidth: $vuetify.display.smAndDown ? '150px' : '250px',
                  margin: $vuetify.display.smAndDown ? '0' : '0 auto'
                }"
                :photo="photo"
                @new-photo="onNewPhoto(catIdx)"
                @edit-photo="onEditPhoto(photo)"
                @delete-photo="onDeletePhoto(photo)"
                @click="photosGalleryDisplay(photo)"
              />
            </template>
          </div>
        </v-card>
      </div>

      <!-- Enregistrement/Edition photo -->
      <v-dialog
        v-model="photoEditor.open"
        :width="$vuetify.display.smAndDown ? '100%' : '800px'"
        :fullscreen="$vuetify.display.xs"
      >
        <v-card>
          <v-card-title class="bg-grey-lighten-4 py-4 title">
            Nouvelle photo {{ agpaMeta.categories[photoEditor.categoryId].title }}
          </v-card-title>
          <v-container
            grid-list-sm
            :class="$vuetify.display.smAndDown ? 'pa-2' : 'pa-4'"
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
            <div
              v-if="photoEditor.isLoading"
              class="loading-indicator"
            >
              <p v-if="photoEditor.complete < 100">
                Téléchargement de la photo sur le serveur : {{ photoEditor.complete }}%
              </p>
              <p v-if="photoEditor.complete >= 100">
                Enregistrement de la photo et création des vignettes
              </p>
            </div>
          </v-container>
          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="text"
              color="primary"
              :disabled="photoEditor.isLoading"
              @click="resetEditor()"
            >
              Annuler
            </v-btn>
            <v-btn
              color="accent"
              :disabled="photoEditor.isLoading"
              :loading="photoEditor.isLoading"
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
        :width="$vuetify.display.smAndDown ? '95%' : '800px'"
        :max-width="$vuetify.display.smAndDown ? '400px' : '800px'"
      >
        <v-card v-if="photoDeletion.photo">
          <v-card-title class="bg-grey-lighten-4">
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
              variant="text"
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
        :width="$vuetify.display.smAndDown ? '100%' : '800px'"
        :fullscreen="$vuetify.display.xs"
      >
        <v-card>
          <v-card-title class="bg-grey-lighten-4">
            <v-icon start>
              far fa-question-circle
            </v-icon>
            Aide sur le déroulement du concours
          </v-card-title>
          <Help :selected-tab="2" />
          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="text"
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
import { mapState } from '../../stores/helpers';
import { useMainStore } from '../../stores/main';
import { usePhotoGalleryStore } from '../../stores/photoGallery';
import { useAgpaStore } from '../../stores/agpa';
import { getModuleInfo, getPeopleAvatar, parseAxiosResponse } from '../../middleware/CommonHelper';
import { format } from 'date-fns';
import { fr } from "date-fns/locale";
import PhotoWidget from './components/PhotoWidget.vue';
import ImageEditor from '../../components/ImageEditor.vue';
import Help from './components/Help.vue';

export default {
    name: 'Phase1',
    components: {
        PhotoWidget,
        ImageEditor,
        Help
    },
    data: () => ({
        isLoading: false,
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
            'agpaMeta'
        ]),
        mainStore() {
            return useMainStore();
        },
        photosGallery() {
            return usePhotoGalleryStore();
        },
        agpaStore() {
            return useAgpaStore();
        }
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
            this.agpaStore.initialize();
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
                    this.photosGallery.resetGallery(this.photos.filter(p => p.id > -1));
                })
                .catch(err => {
                    this.mainStore.onError(err);
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
                    this.mainStore.onError(err);
                    this.photoEditor.isLoading = false;
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
                    this.photoEditor.complete = (progressEvent.loaded / progressEvent.total * 100 || 0);
                }
            })
            .then(newPhoto => {
                this.refreshGallery();
                this.resetEditor();
            })
            .catch(err => {
                this.mainStore.onError(err);
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
                    this.mainStore.onError(err);
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
        },
        photosGalleryDisplay(photo) {
            const index = this.photos.filter(p => p.id > -1).findIndex(p => p.id === photo.id);
            if (index > -1) {
                this.photosGallery.setIndex(index);
                this.photosGallery.showGallery();
            }
        },
        photosGalleryHide() {
            this.photosGallery.hideGallery();
        },

    }
};
</script>


<style lang="scss" scoped>
@use '../../themes/global.scss' as *;

@use '../../themes/global.scss' as *;
@use '../../themes/agpa.scss' as *;

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
.loading-indicator {
    margin: 10px 0px 10px 33px;
    border-radius: 3px;
    background: #eee;
    text-align: center;
    padding: 10px;
    p {
        margin: 0;
        padding: 0;
    }
}

h2 {
    font-family: 'Tangerine', serif;
    color: orange;
    font-size: 3em;
}
h3 {
    font-family: 'Tangerine', serif;
    color: rgb(var(--v-theme-accent));
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
