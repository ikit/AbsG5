<template>
  <div>
    <div
      :class="{ stickyHeader: $vuetify.breakpoint.lgAndUp, stickyHeaderSmall: !$vuetify.breakpoint.lgAndUp }"
      style="padding: 15px"
    >
      <router-link
        :to="{ path: `/photos/albums` }"
        tag="button"
      >
        <v-icon>fas fa-home</v-icon>
        <span
          v-if="$vuetify.breakpoint.lgAndUp"
          style="margin-left: 15px"
        >Liste des albums</span>
      </router-link>

      <div v-if="album" style="display: inline-block;">
        <router-link
          :to="{ path: `/photos/albums/${album.id}` }"
          tag="button"
        >
          <v-icon left style="margin-left: 15px">
            fas fa-chevron-right
          </v-icon> {{ album.title }}
        </router-link>
        
        <v-icon left style="margin-left: 15px">
          fas fa-chevron-right
        </v-icon> Edition
      </div>

      <div v-if="album" style="position: absolute; right: 15px; top: 10px">
        <v-btn
          @click.stop="displayUploadDialog = true" style="margin-right: 15px">
          <v-icon left>fas fa-plus</v-icon>
          <span v-if="$vuetify.breakpoint.lgAndUp">Ajouter des photos</span>
        </v-btn>
        
        <v-btn
          :to="{ path: `/photos/albums/${album.id}` }"
          >
          <v-icon left>fas fa-undo</v-icon>
          <span v-if="$vuetify.breakpoint.lgAndUp">Retour à l'album</span>
        </v-btn>
      </div>
    </div>
    
    <v-card v-if="album" style="position: relative; margin: 15px; padding: 15px">
      <div style="width: 70%">
        <v-text-field
          v-model="album.title"
          prepend-icon="fas fa-quote-left"
          label="Titre de l'album"
        />

        <v-text-field
          v-model="album.comment"
          prepend-icon="fas fa-quote-left"
          label="Sous-titre"
        />
      </div>
      <div style="text-align: center; position: absolute; top: 10px; right: 15px; width: 300px">
        <p v-if="!albumCover" style="opacity: 0.5; margin-top: 40px">Pas de photo de couverture ?</p>
        <img v-if="albumCover" :src="albumCover" class="thumb" style="margin: 15px"/>
        <p v-if="albumCover">Couverture de l'album</p>
      </div>
    </v-card>

    <div v-if="album">
      <v-container fluid>
        <v-layout row wrap>
          <draggable v-model="album.photos" tag="v-layout" class="row wrap" group="photos" @start="drag=true" @end="drag=false; save();">
            <v-flex
              v-for="p in album.photos" :key="p.id" style="min-width: 250px; width: 15%; margin: 15px"
            >
              <div>
                <div style="width: 100px; height: 100px; margin: auto;">
                  <div style="width: 100px; height: 100px; display: table-cell; text-align: center; vertical-align: middle;">
                    <img :src="p.url" class="thumb" style="margin: auto" @click="photosGalleryDisplay(p.order)" />
                  </div>
                </div>
                <div style="text-align: center;">
                  <v-tooltip bottom>
                    <template #activator="{ on }">
                      <v-btn icon  v-if="isAdmin" @click="photosGalleryDisplay(p.order)" v-on="on">
                        <v-icon small>
                          fas fa-pen
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Editer les informations de la photo</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template #activator="{ on }">
                      <v-btn icon @click="setCover(p)" v-on="on" style="margin-right: 15px">
                        <v-icon small>
                          fas fa-desktop
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Mettre en couverture</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template #activator="{ on }">
                      <v-btn icon  v-if="isAdmin" @click="deletePhoto(p)" v-on="on">
                        <v-icon small>
                          fas fa-trash
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Suprimer la photo</span>
                  </v-tooltip>
                </div>
              </div>
            </v-flex>
          </draggable>
        </v-layout>
      </v-container>
    </div>

    <v-dialog
      v-model="displayUploadDialog"
      width="800px"
    >
      <v-card>
        <v-card-title class="grey lighten-4">
          Ajouter des photos
        </v-card-title>
        <v-card style="margin: 15px">
          <div style="position: relative;">
            <v-icon style="position: absolute; top: 18px; left: 22px;">
              fas fa-info
            </v-icon>
            <p style="margin-left: 50px; padding: 10px; font-style: italic">
              Ce formulaire vous permet d'enregistrer sur le serveur Absolument G une ou plusieurs photos.<br>
              Ces photos seront traités (redimensionnées et optimisées pour l'affichage web) et automatiquement ajoutées à la fin de l'album.<br>
              N'hésitez pas à mettre les photos originales en haute définition, afin de permettre aux autres membres du site de récupérer des photos
              de bonne qualité si ils le désirent.<br>
              Une fois que vous avez terminé d'enregistrer vos photos, vous pourrez fermer cette boîte de dialogue et réordonner
              les photos comme bon vous semble.
            </p>
          </div>
        </v-card>
        <UploadFiles
          style="margin: 0 15px"
          inputLabel="Sélectionnez vos photos"
          inputAccept="image/*"
          :uploadUrl="uploadUrl"
          @onProgress="onUploadProgress($event)"
          @fileUploaded="onPhotoUploaded(photo)"
        />
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            :disabled="uploadInProgress"
            text
            color="primary"
            @click="displayUploadDialog = false;"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>


<script>
import axios from 'axios';
import store from '../../store';
import { mapState } from "vuex";
import UploadFiles from "../../components/UploadFiles";
import draggable from 'vuedraggable';
import { parseAxiosResponse } from '../../middleware/CommonHelper';

export default {
    components: {
        UploadFiles,
        draggable
    },
    store,
    data: () => ({
        album: null,
        uploadUrl: "",
        isLoading: false,
        isAdmin: false,
        albumCover: null,
        displayUploadDialog: false,
        uploadInProgress: false,
    }),
    computed: {
        ...mapState([
            "user",
        ]),
    },
    mounted() {
      this.albumId = Number.parseInt(this.$route.params.albumId);
      this.isAdmin = this.user ? this.user.roles.indexOf("admin") > -1 : false;
      this.refresh();
    },
    methods: {
        refresh() {
          if (!this.isLoading) {
            this.isLoading = true;
            axios.get(`/api/albums/${this.albumId}`).then(response => {
              this.album = parseAxiosResponse(response);
              console.log(this.album)
              this.uploadUrl = `/api/albums/${this.albumId}/upload`;
              this.albumCover = `/files/photos/absg_0001/THUMB/${this.album.coverPhoto}.jpg`;
              this.loadPhotos(this.album.photos);
              this.isLoading = false;
            }).catch( err => {
              this.isLoading = false;
              store.commit('onError', err);
            });
          }
        },

        setCover(photo) {
          this.album.coverPhoto = photo.id;
          this.albumCover = `/files/photos/absg_0001/THUMB/${this.album.coverPhoto}.jpg`;
          this.save();
        },

        deletePhoto(photo) {
          
          axios.delete(`/api/albums/${this.albumId}/${photo.id}`).then(response => {
            this.refresh();
          }).catch( err => {
            store.commit('onError', err);
            this.refresh();
          });
        },

        dragReorder ({oldIndex, newIndex}) {
          const movedItem = this.album.photos.splice(oldIndex, 1)[0]
          this.album.photos.splice(newIndex, 0, movedItem)
        },

        // Affiche les photos à partir de la liste fournie
        loadPhotos(photos) {
          let idx = 0;
          this.photos = photos.map(e => ({
              ...e,
              title: `${e.date ? e.date: ""}${e.date && e.comment ? " - " : ""}${e.comment ? e.comment : ""}`,
              index: idx++ }));
          store.commit("photosGalleryReset", this.photos);
          store.commit("photosGallerySetIndex", 0);
        },

        // Lorsqu'une nouvelle photo est uploadé, on l'ajoute à la fin de l'album
        onUploadProgress($event) {
          console.log("editor.onUploadProgress", $event)
          this.uploadInProgress = true;
          console.log("progress", $event);
        },

        onPhotoUploaded(photo) {
          this.uploadInProgress = false;
          this.refresh();
        },

        // Affiche la photo indiqué par sa position dans la galerie
        photosGalleryDisplay(index) {
            store.commit("photosGallerySetIndex", index);
            store.commit('photoMetadataEditorDisplay');
            store.commit("photosGalleryDisplay");
        },

        save() {
          axios.post(`/api/albums/${this.albumId}`, this.album).then(() => {
              store.commit("onSnack", `Album ${this.album.title} mis à jour.`);
            }).catch( err => {
              this.isLoading = false;
              store.commit("onError", err);
            });
        }
    }
}
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';

.handler {
  cursor: grab;
}
.handler:active {
  cursor: grabbing;
}

.thumb {
    background: white;
    padding: 1px;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
    cursor: pointer;
    max-height: 80px;
    margin: auto;
    vertical-align: middle;
}

tr {
  height: 90px;
  line-height: 90px;
}
tr:hover {
  background: rgba(0, 0, 0, 0.1)
}

.hiddenButton {
  visibility: hidden;
}
tr:hover .hiddenButton {
  visibility: visible;
}
</style>
