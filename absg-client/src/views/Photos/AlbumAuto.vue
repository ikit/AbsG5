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

      <div
        style="display: inline-block; margin-left: 15px"
      >
        <v-icon start>
          fas fa-chevron-right
        </v-icon> Album auto (configuration)
      </div>
    </div>

    <v-card style="margin: 20px">
        <v-card-title class="grey lighten-4">
          Configuration de l'album
          <div style="position: absolute; right: 15px; top: 10px">
            <v-btn
              disabled
              @click.stop="download()"
            >
              <v-icon start>
                fas fa-star
              </v-icon>Favoris
            </v-btn>
          </div>
        </v-card-title>
        <div style="display: flex">
          <div class="grey lighten-4" style="width: 200px; padding: 10px; border-bottom: 1px solid #ddd">
            <b>Personnes</b><br/>
            <span style="opacity: 0.5; font-size: 0._em">Sélectionner les photos en fonction des personnes qui sont dessus.</span>
          </div>
          <div style="flex-grow: 1; padding: 10px; border-bottom: 1px solid #eee">
            Tout le monde
          </div>
        </div>
        <div style="display: flex">
          <div class="grey lighten-4" style="width: 200px; padding: 10px; border-bottom: 1px solid #ddd">
            <b>Lieux</b><br/>
            <span style="opacity: 0.5; font-size: 0._em">Sélectionner les photos en fonction des lieux.</span>
          </div>
          <div style="flex-grow: 1; padding: 10px; border-bottom: 1px solid #eee">
            Partout
          </div>
        </div>
        <div style="display: flex">
          <div class="grey lighten-4" style="width: 200px; padding: 10px; border-bottom: 1px solid #ddd">
            <b>Date</b><br/>
            <span style="opacity: 0.5; font-size: 0._em">Sélectionner les photos en fonction de la date de prise de vue</span>
          </div>
          <div style="flex-grow: 1; padding: 10px; border-bottom: 1px solid #eee">
            N'importe quand
          </div>
        </div>

        <v-card-actions>
          <v-spacer />
          <v-btn>
            <v-icon start>
              fas fa-eye
            </v-icon>
            Voir les photos
          </v-btn>
        </v-card-actions>
    </v-card>


  </div>
</template>


<script>
import axios from 'axios';
import store from '../../store';
import { parseAxiosResponse } from '../../middleware/CommonHelper';

export default {
    store,
    data: () => ({
        isLoading: false,
        photos: [], // La liste des photos à trier
        expandedPhotos: [],
        filter: {
            search: null, // recherche multicritère
            collection: "A trier",
            collections: ["A trier", "Date manquante", "Personnes manquantes", "Lieu manquant"],
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
        this.initFilters()
    },
    methods: {
      initFilters() {
        console.log("init")
        axios.get("/api/albums/auto").then(response => {
                console.log("isLoaded");
                // let idx = 0;
                // this.photos = parseAxiosResponse(response).map(e => ({ ...e, index: idx++ }));
                // store.commit('photosGalleryReset', this.photos);
                this.isLoading = false;
            }).catch( err => {
                store.commit('onError', err);
                this.isLoading = false;
            });
      },

        loadCollection(collection = null) {
            this.isLoading = true;
            let url = `/api/photos/to-check`;
            if (collection === this.filter.collections[1]) {
                url += "?collection=date"
            } else if (collection === this.filter.collections[2]) {
                url += "?collection=person"
            } else if (collection === this.filter.collections[3]) {
                url += "?collection=place"
            }

            axios.get(url).then(response => {
                let idx = 0;
                this.photos = parseAxiosResponse(response).map(e => ({ ...e, index: idx++ }));
                store.commit('photosGalleryReset', this.photos);
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
