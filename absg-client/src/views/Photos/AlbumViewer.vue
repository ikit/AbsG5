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

      <div v-if="album" style="display: inline-block; margin-left: 15px">
        <v-icon left>
          fas fa-chevron-right
        </v-icon> {{ album.title }}
      </div>

      <div style="position: absolute; right: 15px; top: 10px">
        <v-btn
          @click.stop="download()" style="margin-right: 15px">
          <v-icon left>fas fa-download</v-icon>Télécharger
        </v-btn>
        
        <v-btn
          :to="{ path: `/photos/albums/${album.id}/edit` }"
          >
          <v-icon left>fas fa-pen</v-icon>Modifier
        </v-btn>
      </div>
    </div>
    
  <v-container v-if="album">
    <v-layout
            row
            wrap
          >
            <v-flex
              v-for="p in album.photos"
              :key="p.id"
              style="text-align: center;"
            >
              <div style="width: 250px; height: 250px; margin: auto;">
                <div style="width: 250px; height: 250px; display: table-cell; text-align: center; vertical-align: middle;">
                  <img
                    :src="p.thumb"
                    class="thumb"
                    :alt="p.id"
                    @click="photosGalleryDisplay(p.order)"
                  >
                </div>
              </div>
            </v-flex>
          </v-layout>
        </v-container>
  </v-container>
  


    <v-dialog
      v-model="albumEditor.open"
      width="800px"
    >
      <v-card>
        <v-card-title class="grey lighten-4">
          Editer l'album
        </v-card-title>
        <v-container
          grid-list-sm
          class="pa-4"
        >
          <v-layout
            row
            wrap
          >
            <v-flex xs12>
              <v-text-field
                v-model="albumEditor.title"
                prepend-icon="fas fa-user"
                label="Titre de l'album"
              />
            </v-flex>
            <v-flex xs12>
              <v-text-field
                v-model="albumEditor.comment"
                prepend-icon="fas fa-quote-left"
                label="Optionnel"
              />
            </v-flex>
            <v-flex xs12>
              <v-card>
                <div style="position: relative;">
                  <v-icon style="position: absolute; top: 18px; left: 22px;">
                    fas fa-info
                  </v-icon>
                  <p style="margin-left: 50px; padding: 10px; font-style: italic">
                    Merci de les mettre la citation entre double quotes, et les précisions entre parenthèses: "La citation" (ma précision).
                  </p>
                </div>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            color="primary"
            @click="resetDialog()"
          >
            Annuler
          </v-btn>
          <v-btn
            color="accent"
            @click="saveCitation()"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  
  </div>
</template>


<script>
import axios from 'axios';
import store from '../../store';
import { save as saveFile } from "save-file";
import { parseAxiosResponse } from '../../middleware/CommonHelper';

export default {
    store,
    data: () => ({
        album: null,
        albumEditor: {
            open: false, // si oui ou non la boite de dialogue pour créer/éditer une citation est affichée
            id: null, // l'ID de l'album'
            title: null, // le titre
            comment: null, // l'auteur de la citation (texte saisie libre mais autocomplete avec liste des auteurs existant)
        },
    }),
    mounted() {
      this.albumId = Number.parseInt(this.$route.params.albumId);
      axios.get(`/api/albums/${this.albumId}`).then(response => {
        this.album = parseAxiosResponse(response);
        console.log(this.album);
        this.loadPhotos(this.album.photos);
      }).catch( err => {
          store.commit('onError', err);
      });
    },
    methods: {
        loadPhotos(photos) {
          let idx = 0;
          this.photos = photos.map(e => ({
              ...e,
              title: `${e.date}${e.place ? " - " + e.place : ""}${ e.persons ? " - " + e.persons.join(', ') : ""}${e.comment ? " - " + e.comment : ""}`,
              index: idx++ }));
          store.commit('photosGalleryReset', this.photos);
          store.commit('photosGallerySetIndex', 0);
        },

        // Affiche la photo indiqué par sa position dans la galerie
        photosGalleryDisplay(index) {
            store.commit('photosGallerySetIndex', index);
            store.commit('photosGalleryDisplay');
        },

        // Télécharge les photos de l'album dans un zip
        download() {
          axios.get(`/api/albums/${this.albumId}/download`, {
            responseType: 'blob',
            onDownloadProgress: progressEvent => {
              const total = parseFloat(progressEvent.currentTarget.responseHeaders['Content-Length'])
              const current = progressEvent.currentTarget.response.length

              let percentCompleted = Math.floor(current / total * 100)
              console.log('completed: ', percentCompleted)
            }
          }).then((response) => {
          saveFile(response, `Photos - ${this.album.title}.zip`)
        }).catch(err => store.commit("onError", err));

      }
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
