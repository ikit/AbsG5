<template>
  <div>
    <v-container
      fluid
      grid-list-md
      style="padding:0"
    >
      <v-data-iterator
        :items="immts"
        :items-per-page="filter.pageSize"
        :page="filter.pageIndex"
        :search="filter.request"
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
                v-model="filter.request"
                prepend-icon="fa-search"
                placeholder="Rechercher"
                style="max-width: 300px;"
              />
              <!-- <span class="grey--text">{{immts.length}} images</span> -->
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
                Page {{ filter.pageIndex }} / {{ numberOfPages }}
              </span>
              <v-btn
                icon
                small
                :disabled="isLoading"
                @click="nextPage"
              >
                <v-icon>fa-chevron-right</v-icon>
              </v-btn>

              <v-spacer />

              <v-btn
                v-if="$vuetify.display.mdAndUp"
                @click.stop="resetDialog(true)"
              >
                <v-icon start>
                  fas fa-plus
                </v-icon>
                <span v-if="$vuetify.display.mdAndUp">Nouvelle image</span>
              </v-btn>
              <v-btn
                v-else
                fab
                small
                @click.stop="resetDialog(true)"
              >
                <v-icon>fas fa-plus</v-icon>
              </v-btn>
            </v-row>
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
                style="text-align: center; max-width: 250px;"
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
                <v-card style="margin-bottom: 50px">
                  <div style="text-align: center">
                    {{ p.title }}
                  </div>
                  <div style="text-align: center; font-size: 0.8em; opacity: 0.7">
                    {{ p.user ? p.user.username : "" }} le {{ p.date }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </template>
      </v-data-iterator>
    </v-container>


    <v-dialog
      v-model="immtEditor.open"
      width="800px"
    >
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">
          Nouvelle image du moment
        </v-card-title>
        <v-container
          grid-list-sm
          class="pa-4"
        >
          <div
            v-if="immtEditor.displayTodayWarning"
            style="position: relative; color: #ff8f00; padding-left: 40px;"
          >
            <v-icon
              color="warning"
              style="position:absolute; top: 10px; left: 0"
            >
              fas fa-exclamation-triangle
            </v-icon>
            Attention, il y a déjà une image pour aujourd'hui. <br>
            Vous allez donc remplacer l'image existante par une nouvelle.
          </div>


          <v-text-field
            v-model="immtEditor.title"
            prepend-icon="fas fa-feather-alt"
            label="Titre"
          />
          <ImageEditor
            ref="imgEditor"
            icon="fas fa-camera"
            style="height: 300px;"
          />
          <div v-if="immtEditor.isLoading">
            Enregistrement en cours : {{ immtEditor.complete }}%
          </div>
        </v-container>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            color="primary"
            :disabled="immtEditor.isLoading"
            @click="resetDialog()"
          >
            Annuler
          </v-btn>
          <v-btn
            color="accent"
            :disabled="immtEditor.isLoading"
            @click="saveImmt()"
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
import { parseAxiosResponse, getPeopleAvatar, padNumber } from '../../middleware/CommonHelper';
import { addDays, format } from 'date-fns';
import ImageEditor from '../../components/ImageEditor.vue';
import store from '../../store';

export default {
    components: {
        ImageEditor
    },
    store,
    data: () => ({
        isLoading: false,
        immts: [],
        todayId: "",
        filter: {
            authorId: null,
            pageIndex: 1,
            pageSize: 20,
        },
        immtEditor: {
            open: false,
            displayTodayWarning: false,
            title: null,
            isLoading: false,
            complete: 0,
        },
    }),
    computed: {
        numberOfPages () {
            return Math.ceil(this.immts.length / this.filter.pageSize)
        }
    },
    mounted () {
        if (!this.authors) {
            // Il faut initialiser la vue
            this.isLoading = true;
            const t = new Date();
            this.todayId = format(new Date(), "yyyy_DDD", { useAdditionalDayOfYearTokens: true });

            axios.get(`/api/immt/`).then(response => {
                let idx = 0;
                const data = parseAxiosResponse(response);
                this.immts = data.map(i => {
                    const tokens = i.id.split("_");
                    let date = new Date(tokens[0], 0, 1);
                    date = addDays(date, +tokens[1]);
                    if (this.todayId === i.id) {
                        this.immtEditor.displayTodayWarning = true;
                    }
                    return {
                        id: i.id,
                        username: i.posterName,
                        title: i.title,
                        date: date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }),
                        url: i.url,
                        thumb: i.thumb,
                        index: idx++
                    }
                });
                this.isLoading = false;
                store.commit('photosGalleryReset', this.immts);
            });
        }
    },
    methods: {
        initGallery() {
            store.commit('photosGalleryReset', this.immts);
        },
        resetDialog (open = false) {
            this.immtEditor.open = open;
            this.immtEditor.title = null;
            this.immtEditor.isLoading = false;
            this.immtEditor.complete = 0;

            const { imgEditor } = this.$refs;
            imgEditor.reset();
        },
        saveImmt: function () {
            const { imgEditor } = this.$refs;
            this.immtEditor.isLoading = true;

            // On récupère l'image
            axios.get(imgEditor.imageUrl(), { responseType: 'blob' }).then(
                response => {
                    const formData = new FormData();
                    formData.append("title", this.immtEditor.title);
                    formData.append("image", response.data )

                    // On envoie tout au serveur pour qu'il enregistre la nouvelle image du moment
                    axios.post(`/api/immt`, formData, {
                        headers: {
                            "Content-Type" : "multipart/form-data",
                        },
                        onUploadProgress: progressEvent => {
                            this.immtEditor.complete = (progressEvent.loaded / progressEvent.total * 100 || 0);
                        }
                    })
                    .then(newImmt => {
                        // On ajoute l'image à la liste des immt
                        this.immts.unshift(newImmt);
                        this.resetDialog();
                    })
                    .catch(err => {
                        store.commit("onError", err);
                    });
                }
            );
        },
        nextPage () {
            if (this.filter.pageIndex < this.numberOfPages) this.filter.pageIndex += 1
        },
        formerPage () {
            if (this.filter.pageIndex > 1) this.filter.pageIndex -= 1
        },
        photosGalleryDisplay(index) {
            store.commit('photosGallerySetIndex', index);
            store.commit('photosGalleryDisplay');
        },
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
