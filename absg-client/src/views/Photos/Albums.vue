<template>
  <div>
    <div
      :class="{ stickyHeader: $vuetify.display.lgAndUp, stickyHeaderSmall: !$vuetify.display.lgAndUp }"
      style="padding: 15px"
    >
      <router-link
        :to="{ path: `/photos/albums` }"
        tag="button"
      >
        <v-icon>fas fa-home</v-icon>
        <span
          v-if="$vuetify.display.lgAndUp"
          style="margin-left: 15px"
        >Liste des albums</span>
      </router-link>

      <v-btn
        style="position: absolute; right: 15px; top: 10px"
        @click.stop="displayNewAlbum()"
      >
        <v-icon start>
          fas fa-plus
        </v-icon>Nouvel album
      </v-btn>
    </div>
    
    <v-container fluid>
      <v-row
        row
        wrap
      >
        <v-col>
          <router-link
            :to="{path: `/photos/albums/auto`}"
            style="text-decoration: none; max-width: 200px"
          >
            <v-card width="350px">
              <div style="height: 125px; text-align: center;">
                <i class="fas fa-images" style="font-size: 80px; margin-top: 20px"></i>
                <div class="albumInfo">
                  3769 photos disponnibles
                </div>
              </div>

              <v-card-title
                primary-title
                style="position: relative"
              >
                Album perso
              </v-card-title>
              <v-card-subtitle>
                Générer un album automatiquement en filtrant parmi toutes les photos enregistrés
              </v-card-subtitle>
            </v-card>
          </router-link>
        </v-col>

        <!-- Les albums créés par les utilisateurs -->
        <v-col
          v-for="album in albums"
          :key="album.id"
        >
          <router-link
            :to="{path: `/photos/albums/${album.id}`}"
            style="text-decoration: none"
          >
            <v-card width="350px">
              <v-img
                :src="album.coverPhoto"
                aspect-ratio="1.5"
              >
                <div class="albumInfo" v-if="album.photos">
                  {{ album.photos.length }} photos
                </div>
              </v-img>

              <v-card-title
                primary-title
                style="position: relative"
              >
                {{ album.title }}
              </v-card-title>
              <v-card-subtitle>
                {{ album.comment }}
              </v-card-subtitle>
            </v-card>
          </router-link>
        </v-col>
      </v-row>
    </v-container>
    

    <v-dialog
      v-model="newAlbum.displayed"
      width="800px"
    >
      <v-card>
        <v-card-title class="grey lighten-4">
          Créer un nouveau album
        </v-card-title>
        <v-card style="margin: 15px">
          <div style="position: relative;">
            <v-icon style="position: absolute; top: 18px; left: 22px;">
              fas fa-info
            </v-icon>
            <p style="margin-left: 50px; padding: 10px; font-style: italic">
              Ce formulaire vous permet de créer un nouvel album photo qui sera partagé (et modifiable) avec tout les membres du site Absolument G.<br>
              Dans un premier temps vous allez juste créer un album "vide" avec juste un titre et un sous-titre optionnel. 
            </p>
          </div>
        </v-card>
        
        <v-text-field
          v-model="newAlbum.title"
          prepend-icon="fas fa-quote-left"
          label="Titre de l'album"
        />

        <v-text-field
          v-model="newAlbum.comment"
          prepend-icon="fas fa-quote-left"
          label="Sous-titre"
        />
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            color="primary"
            @click="newAlbumValidation()"
          >
            Créer l'album et ajouter des photos
          </v-btn>
          <v-btn
            text
            @click="newAlbum.displayed = false;"
          >
            Annuler
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>


<script>
import axios from 'axios';
import store from '../../store';
import { parseAxiosResponse } from '../../middleware/CommonHelper';

export default {
    store,
    data: () => ({
        albums: [],
        newAlbum: {
          displayed: false,
          title: "",
          comment: "",
          isLoading: false
        }
    }),
    mounted() {
        this.listAlbums();
    },
    methods: {
      /**
       * Récupère la liste des albums
       */
      listAlbums() {
          axios.get(`/api/albums`).then(response => {
              this.albums = parseAxiosResponse(response);
          }).catch( err => {
              store.commit('onError', err);
          });
      },

      /**
       * 
       */
      loadPhotos(photos) {
        let idx = 0;
        this.photos = photos.map(e => ({
            ...e,
            title: `${e.date}${e.place ? " - " + e.place : ""}${ e.persons ? " - " + e.persons.join(', ') : ""}${e.comment ? " - " + e.comment : ""}`,
            index: idx++ }));
        store.commit('photosGalleryReset', this.photos);
        store.commit('photosGallerySetIndex', 0);
        store.commit('photosGalleryDisplay');
      },

      displayNewAlbum() {
        this.newAlbum.displayed = true;
        this.newAlbum.isLoading = false;
        this.newAlbum.title = "";
        this.newAlbum.comment = "";
        this.newAlbum.userGroup = "*";
      },

      newAlbumValidation() {
        this.newAlbum.isLoading = true;
          axios.post(`/api/albums/`, this.newAlbum).then(newAlbum => {
              store.commit("onSnack", `Nouvel album "${this.newAlbum.title}" créé.`);
              this.$router.push({ path: `photos/albums/${newAlbum.id}`})
            }).catch( err => {
              this.newAlbum.isLoading = false;
              store.commit("onError", err);
            });
      }
    }
}
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';

.albumInfo {
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    text-align: right;
    font-size: 0.9em;
    background: rgba(0,0,0, 0.5);
    padding: 5px;
    color: #fff;
}
</style>
