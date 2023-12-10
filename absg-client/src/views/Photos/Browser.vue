<template>
  <v-container
    fluid
    grid-list-md
    style="padding:0"
  >
    <v-data-iterator
      :items="sorted.displayed"
      :items-per-page="sorted.pageSize"
      :page="sorted.idx"
      :search="filter.search"
      loading-text="Récupération des photos..."
      no-data-text="Aucune photo à trier."
      no-results-text="Aucune photo trouvée."
      hide-default-footer
    >
      <template #header>
        <div :class="{ stickyHeader: $vuetify.breakpoint.lgAndUp, stickyHeaderSmall: !$vuetify.breakpoint.lgAndUp }">
          <v-row
            style="margin: 0"
            align="center"
            justify="center"
          >
            <v-text-field
              v-model="filter.search"
              prepend-icon="fa-search"
              placeholder="Rechercher"
              style="max-width: 300px; margin-right: 16px"
            />
            <v-text-field
              v-model="filter.search"
              prepend-icon="fa-calendar-alt"
              placeholder="De YYYY-MM-DD"
              style="max-width: 200px;"
            />
            &nbsp;-&nbsp;
            <v-text-field
              v-model="filter.search"
              placeholder="à YYYY-MM-DD"
              style="max-width: 200px;"
            />
            <v-spacer />
            <v-btn-toggle :disabled="isLoading" v-model="displayMode">
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-btn @click.stop="displaygrid()" v-on="on" value="list">
                    <v-icon>fa-th</v-icon>
                  </v-btn>
                </template>
                <span>Classer les photos dans l'ordre chronologique</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-btn @click.stop="displayTimeline()" v-on="on" value="chrono">
                    <v-icon>fa-calendar-alt</v-icon>
                  </v-btn>
                </template>
                <span>Classer les photos dans l'ordre chronologique</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-btn @click.stop="displayTrombi()" v-on="on" value="person">
                    <v-icon>fa-user</v-icon>
                  </v-btn>
                </template>
                <span>Identifier les personnes sur les photos</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-btn @click.stop="displayLocation()" v-on="on" value="location">
                    <v-icon>fa-map-marked-alt</v-icon>
                  </v-btn>
                </template>
                <span>Identifier les lieux sur les photos</span>
              </v-tooltip>
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-btn @click.stop="displayTrash()" v-on="on" value="trash">
                    <v-icon>fa-trash</v-icon>
                  </v-btn>
                </template>
                <span>Voir les photos supprimées</span>
              </v-tooltip>
            </v-btn-toggle>
            &nbsp;
            <v-btn-toggle>
              <v-tooltip bottom>
                <template #activator="{ on }">
                  <v-btn @click.stop="displayStats()" v-on="on">
                    <v-icon>fa-chart-pie</v-icon>
                  </v-btn>
                </template>
                <span>Voir les statistiques</span>
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
            {{ sorted.photos.length }} photos
          </div>
        </div>
      </template>

      <template #default="props">
        <v-container
          v-if="displayMode = 'list'"
          fluid
          grid-list-sm
        >
          <v-layout
            row
            wrap
          >
            <v-flex
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
              {{ p.date }}
            </v-flex>
          </v-layout>
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
      displayMode: "chrono", // mode d'affichage sélectionné (list, chrono, person, location, trash)
      allPhotos: [], // La liste de toutes les photos
      // Les photos triées (avec date)
      sorted: {
        photos: [],
        displayed: [],
        idx: 0,
        pageSize: 20,
      },
      // les photos à trier (sans date)
      toSort: {
        photos: [],
        displayed: [],
        idx: 0,
        pageSize: 20,
        numberOfPages: 0,
      },
      // Les photos signalé comme doublons et masquées
      trash: {
        photos: [],
        displayed: [],
        idx: 0,
        pageSize: 20,
        numberOfPages: 0,
      },
      filter: {
          search: null, // recherche multicritère
          date: null, // la date de la photo principale affichée
      },
      rules: {
          date: [
              value => {
                  const pattern = /^([0-9]{4})?(-[0-9]{2}(-[0-9]{2})?)?$/
                  return pattern.test(value) || 'La valeur doit être une date valide: YYYY ou bien YYYY-MM ou bien YYYY-MM-DD'
              }
          ]
      }
    }),
    // computed: {
    //     numberOfPages () {
    //         return Math.ceil(this.photos.length / this.filter.pageSize)
    //     }
    // },
    mounted() {
        this.loadCollection()
    },
    methods: {
      updateFilterDateFromPhotoIdx() {
        this.filter.date = this.sorted.photos[this.sorted.idx].date;
      },
      updatePhotoIdxFromDate() {
        this.sorted.idx = this.sorted.photos.findIndex(p => p.date.startsWith(this.filter.date));
      },

    loadCollection() {
        this.isLoading = true;
        axios.get(`/api/photos/all`).then(response => {
            let idx = 0;
            this.allPhotos = parseAxiosResponse(response);
            this.sorted.photos = this.allPhotos.filter(p => p.date && !p.doublon).map(e => ({ ...e, index: idx++ }));
            this.sorted.displayed = this.sorted.photos.slice(this.sorted.idx, this.sorted.pageSize);
            this.sorted.idx = 0;
            this.toSort.photos = this.allPhotos.filter(p => !p.date && !p.doublon).map(e => ({ ...e, index: idx++ }));
            this.toSort.idx = 0;
            this.toSort.numberOfPages = Math.ceil(this.toSort.photos.length / this.toSort.pageSize);
            this.trash.photos = this.allPhotos.filter(p => p.doublon).map(e => ({ ...e, index: idx++ }));
            this.trash.idx = 0;
            this.trash.numberOfPages = Math.ceil(this.trash.photos.length / this.trash.pageSize);
            this.updateFilterDateFromPhotoIdx();
            store.commit('photosGalleryReset', this.photosSorted );
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
    displayTrash() {
      debugger;
      console.log("todo");
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
