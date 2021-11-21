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

      <v-btn
        style="position: absolute; right: 15px; top: 10px"
        @click.stop="newAlbum()">
        <v-icon left>fas fa-plus</v-icon>Nouvel album
      </v-btn>
    </div>
    
  <v-container fluid>
    <v-layout
      row
      wrap
    >
      <v-flex>
        <router-link
          :to="{path: `/photos/albums/auto`}"
          style="text-decoration: none"
        >
          <v-card>
            <v-img
              src="https://absolumentg.fr/files/photos/absg_0002/WEB/0002_1629750602581.jpg"
              aspect-ratio="1.5"
            >
              <div class="albumInfo">
                3769 photos disponnibles
              </div>
            </v-img>

            <v-card-title
              primary-title
              style="position: relative"
            >
              Album automatique
            </v-card-title>
            <v-card-subtitle>
              Générer un album en filtrant parmi toutes les photos enregistrés
            </v-card-subtitle>
          </v-card>
        </router-link>
      </v-flex>

      <!-- Les albums créés par les utilisateurs -->
      <v-flex
        v-for="album in albums"
        :key="album.id"
        style="max-width: 400px; margin: 15px"
      >
        <router-link
          :to="{path: `/photos/albums/${album.id}`}"
          style="text-decoration: none"
        >
          <v-card>
            <v-img
              :src="album.coverPhoto"
              aspect-ratio="1.5"
            >
              <div class="albumInfo">
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
      </v-flex>
    </v-layout>
  </v-container>
  </div>
</template>


<script>
import axios from 'axios';
import store from '../../store';
import { parseAxiosResponse } from '../../middleware/CommonHelper';

export default {
    store,
    data: () => ({
        albums: []
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
