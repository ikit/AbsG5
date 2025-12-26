<template>
  <v-container
    fluid
    grid-list-md
    style="padding:0"
  >
    <v-data-iterator
      :items="displayedPhotos"
      :items-per-page="filter.pageSize"
      :page="filter.pageIndex"
      :search="filter.search"
      :expanded="expandedPhotos"
      loading-text="Récupération des photos..."
      no-data-text="Aucune photo à trier."
      no-results-text="Aucune photo trouvée."
      hide-default-footer
    >
      <template #header>
        <div :class="{ stickyHeader: $vuetify.display.lgAndUp, stickyHeaderSmall: !$vuetify.display.lgAndUp }">
          <v-row
            style="margin: 0"
            align="center"
            justify="center"
          >
            <v-text-field
              v-model="filter.search"
              prepend-icon="fa-search"
              placeholder="Rechercher"
              style="max-width: 300px;"
            />
            <v-spacer />
            <v-btn-toggle :disabled="isLoading">
              <v-tooltip bottom>
                <template #activator="{ props }">
                  <v-btn @click.stop="switchViewDoublon()" v-bind="props">
                    <v-icon>{{ filter.viewDoublon ? "fa-solid fa-eye" : "fa-solid fa-eye-slash" }}</v-icon>
                  </v-btn>
                </template>
                <span>Voir les photos signalées comme doublon</span>
              </v-tooltip>
            </v-btn-toggle>


            <v-spacer />
            <v-btn
              icon
              small
              :disabled="isLoading"
              @click="formerPage"
            >
              <v-icon>fa-chevron-left</v-icon>
            </v-btn>
            <span class="grey--text">
              <v-text-field
                v-model="filter.pageIndex"
                style="max-width: 30px; display: inline-block;"
                @input="gotoPage()"
              /> / {{ numberOfPages }}
            </span>
            <v-btn
              icon
              small
              :disabled="isLoading"
              @click="nextPage"
            >
              <v-icon>fa-chevron-right</v-icon>
            </v-btn>
          </v-row>
          <div
            class="grey--text"
            style="font-size: 0.9em; display: block; position: absolute; right: 15px; bottom: 0;"
          >
            {{ photos.length }} photos
          </div>
        </div>
      </template>

      <template #default="props">
        <v-container
          fluid
          grid-list-sm
        >
          <v-row
            row
            wrap
          >
            <v-col
              v-for="p in props.items"
              :key="p.id"
              style="text-align: center;"
            >
              <div style="width: 250px; height: 250px; margin: auto;">
                <div style="width: 250px; height: 250px; display: table-cell; text-align: center; vertical-align: middle;">
                  <img
                    :src="p.thumb"
                    class="thumb"
                    :alt="p.id"
                    @click="photosGalleryDisplay(p.index)"
                  >
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </v-data-iterator>
  </v-container>
</template>


<script>
import axios from 'axios';
import store from '../../store';
import { parseAxiosResponse } from '../../middleware/CommonHelper';

export default {
    store,
    data: () => ({
        isLoading: false,
        photos: [], // La liste de toutes les photos
        displayedPhotos: [], // La liste des photos pré-filtrée fournis à l'iterator
        expandedPhotos: [],
        filter: {
            search: null, // recherche multicritère
            viewDoublon: false, // est-ce qu'on affiche aussi les photos signalées comme doublons
            pageIndex: 1, // page courante affichée
            pageSize: 24, // nombre de photos affichées par page
        },
        rules: {
            from: [
                value => {
                    const pattern = /^([0-9]{4})?(-[0-9]{2}(-[0-9]{2})?)?$/
                    return pattern.test(value) || 'La valeur doit être une date valide: YYYY ou bien YYYY-MM ou bien YYYY-MM-DD'
                }
            ],
            to: [
                value => {
                    const pattern = /^([0-9]{4})?(-[0-9]{2}(-[0-9]{2})?)?$/
                    return pattern.test(value) || 'La valeur doit être une date valide: YYYY ou bien YYYY-MM ou bien YYYY-MM-DD'
                }
            ],
        }
    }),
    computed: {
        numberOfPages () {
            return Math.ceil(this.photos.length / this.filter.pageSize)
        }
    },
    mounted() {
        this.loadCollection()
    },
    methods: {
        loadCollection() {
            this.isLoading = true;
            axios.get(`/api/photos/all`).then(response => {
                let idx = 0;
                this.photos = parseAxiosResponse(response).map(e => ({ ...e, index: idx++ }));
                this.displayedPhotos = this.photos.filter(p => !p.doublon || this.filter.viewDoublon );
                this.filter.pageIndex = 1;
                store.commit('photosGalleryReset', this.displayedPhotos );
                this.isLoading = false;
            }).catch( err => {
                store.commit('onError', err);
                this.isLoading = false;
            });
        },
        photosGalleryDisplay(index) {
            store.commit('photosGallerySetIndex', index);
            store.commit('photoMetadataEditorDisplay');
            store.commit('photosGalleryDisplay');
        },
        nextPage () {
            if (this.filter.pageIndex < this.numberOfPages) this.filter.pageIndex += 1;
            else this.filter.pageIndex = 1;
        },
        formerPage () {
            if (this.filter.pageIndex > 1) this.filter.pageIndex -= 1;
            else this.filter.pageIndex = this.numberOfPages;
        },
        gotoPage () {
            this.filter.pageIndex = pageIndex;
            if (this.filter.pageIndex > this.numberOfPages) this.filter.pageIndex = this.numberOfPages;
            if (this.filter.pageIndex < 1) this.filter.pageIndex = 1;
            
        },
        switchViewDoublon() {
          debugger;
          this.filter.viewDoublon = !this.filter.viewDoublon;
          this.displayedPhotos = this.photos.filter(p => !p.doublon || this.filter.viewDoublon );
          store.commit('photosGalleryReset', this.displayedPhotos);
        }
    }
}
</script>


<style lang="scss" scoped>
@use '../../themes/global.scss' as *;


.thumb {
    background: white;
    padding: 1px;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
    cursor: pointer;
}
</style>
