<template>
  <div>
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
          style="max-width: 300px;"
          @change="applyFilter()"
        />

        <v-spacer />

        <v-btn-toggle :disabled="isLoading">
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn @click.stop="switchHidden()" v-on="on">
                <v-icon v-if="filter.hideEmpty">fas fa-portrait</v-icon>
                <v-icon v-else>fas fa-user-friends</v-icon>
              </v-btn>
            </template>
            <span>Afficher/Masquer les personnes sans trombi</span>
          </v-tooltip>
          
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn @click.stop="displayStats()" v-on="on">
                <v-icon>fas fa-chart-pie</v-icon>
              </v-btn>
            </template>
            <span>Voir les statistiques</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn @click.stop="resetDialog(true)" v-on="on">
                <v-icon>fas fa-plus</v-icon>
              </v-btn>
            </template>
            <span>Enregistrer une nouvelle photo</span>
          </v-tooltip>
        </v-btn-toggle>
      </v-row>
    </div>

    <v-container>
      <v-expansion-panels
        v-model="panel"
        multiple
        class="albumCollection"
      >
        <v-expansion-panel
          v-for="p of displayedPersons"
          :key="p.id"
          :disabled="p.displayedTrombis.length === 0"
        >
          <v-expansion-panel-header>
            {{ p.fullname }}
            <v-spacer />
            {{ p.trombis.length }}/{{ p.trombiMax }}
            <i class="fas fa-portrait" :class="p.cssStatus" style="margin-left: 10px; margin-right: 10px; flex: none"/>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-tooltip
              v-for="t of p.displayedTrombis"
              :key="t.url"
              bottom
            >
              <template #activator="{ on }">
                <img
                  class="thumb"
                  :src="t.thumb"
                  v-on="on"
                  @click="photosGalleryDisplay(t.index)"
                />
              </template>
              <span>{{ t.title }}</span>
            </v-tooltip>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-container>

    <v-dialog
      v-model="trombiEditor.open"
      width="400px"
    >
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">
          Nouvelle trombinette
        </v-card-title>
        <v-container
          grid-list-sm
          class="pa-4"
        >
          <v-combobox
            v-model="trombiEditor.person"
            :items="persons"
            :rules="editorRules.person"
            label="Qui"
            prepend-icon="fas fa-user"
            item-text="fullname"
          />
          
          <v-text-field
            v-model="trombiEditor.date"
            :rules="editorRules.date"
            label="Quand"
            placeholder="Année de la photo"
            validate-on-blur
            prepend-icon="far fa-calendar-alt"
          />

          <ImageEditor
            ref="imgEditor"
            icon="fas fa-camera"
            style="height: 300px;"
            mode="square"
          />
          <div v-if="trombiEditor.isLoading">
            Enregistrement en cours : {{ trombiEditor.complete }}%
          </div>
        </v-container>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            color="primary"
            :disabled="trombiEditor.isLoading"
            @click="resetDialog()"
          >
            Annuler
          </v-btn>
          <v-btn
            color="accent"
            :disabled="trombiEditor.isLoading"
            @click="saveTrombi()"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="stats.open"
      width="600px"
    >
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">
          Nouvelle trombinette
        </v-card-title>
        <v-container
          grid-list-sm
          class="pa-4"
        >
          <v-combobox
            v-model="trombiEditor.person"
            :items="persons"
            :rules="editorRules.person"
            label="Qui"
            prepend-icon="fas fa-user"
            item-text="fullname"
          />
          
          <v-text-field
            v-model="trombiEditor.date"
            :rules="editorRules.date"
            label="Quand"
            placeholder="Année de la photo"
            validate-on-blur
            prepend-icon="far fa-calendar-alt"
          />

          <ImageEditor
            ref="imgEditor"
            icon="fas fa-camera"
            style="height: 300px;"
            mode="square"
          />
          <div v-if="trombiEditor.isLoading">
            Enregistrement en cours : {{ trombiEditor.complete }}%
          </div>
        </v-container>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            color="primary"
            :disabled="trombiEditor.isLoading"
            @click="resetDialog()"
          >
            Annuler
          </v-btn>
          <v-btn
            color="accent"
            :disabled="trombiEditor.isLoading"
            @click="saveTrombi()"
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
import ImageEditor from '../../components/ImageEditor.vue';
import store from '../../store';

export default {
    components: {
      ImageEditor
    },
    store,
    data: () => ({
        isLoading: false,
        persons: [],
        displayedPersons: [],
        layoutMode: "GRID",
        sortMode: "ASC",
        filter: {
            hideEmpty: true,
            search: null,
        },
        trombiEditor: {
          open: false,
          date: null,
          person: null,
          isLoading: false,
          complete: 0,
        },
        editorRules: {
            person: [
              value => !!value || 'Veuillez sélectionner une personne'
            ],
            photo: [
              value => !!value || value.size < 2000000 || 'La taille de la photo doit être inférieur à 2 MB',
            ],
            date: [
              value => {
                const pattern = /^[0-9]{4}$/
                return !!value || pattern.test(value) || 'La valeur doit être une année valide: YYYY'
              }
            ],
        },
        stats: {
          open: false,
          headers: [
            "Famille",
            "Complet à 100%",
            "Complet à > 50%", 
            "Complet à < 50%",
            "Sans photo"
          ],
          overview: []
        }
    }),

    computed: {
      numberOfPages () {
        return Math.ceil(this.photos.length / this.filter.pageSize)
      }
    },

    mounted () {
      this.isLoading = true;
      // On récupère la liste des photos
      axios.get(`/api/agenda/persons/`).then(response => {
        this.persons = parseAxiosResponse(response).map(e => ({
          ...e,
          trombiCount: e.trombis.length,
          cssStatus: this.computeCssStatus(e)
        }));
        this.applyFilter();

        this.isLoading = false;
      });
    },

    methods: {
      computeCssStatus: function (p) {
        let res = "colStatus ";
        const count = p.trombis.length;
        if (count === p.trombiMax) {
          res += "col100";
        } else if (count > p.trombiMax / 2) {
          res += "col50";
        } else if (count > 0) {
          res += "col1";
        } else {
          res += "col0";
        }
        return res;
      },

      switchLayout() {
        const modes = ["GRID", "TABLE"];
        let idx = modes.indexOf(this.layoutMode) + 1;
        idx = idx === modes.length ? 0 : idx;
        this.layoutMode = modes[idx];
      },

      switchSorting() {
        const modes = ["ASC", "DESC", "RAND"];
        let idx = modes.indexOf(this.sortMode) + 1;
        idx = idx === modes.length ? 0 : idx;
        this.sortMode = modes[idx];

        switch(this.sortMode) {
          case "ASC":
            this.photos.sort((a, b) =>  new Date(a.date).getTime() - new Date(b.date).getTime());
            break;
          case "DESC":
            this.photos.sort((a, b) =>  new Date(b.date).getTime() - new Date(a.date).getTime());
            break;
          case "RAND":
            this.photos.sort(() => 0.5 - Math.random());
            break;
        }
      },

      resetDialog (open = false) {
        this.trombiEditor.open = open;
        this.trombiEditor.date = null;
        this.trombiEditor.isLoading = false;
        this.trombiEditor.complete = 0;
        setTimeout(() => {
          this.$refs.imgEditor.reset()
        });
        return false;
      },

      displayStats() {
        console.log("displayStats", this.persons);
        this.stats.overview = [
          { title: "Gueudelot", c100: 0, c50: 0, c1: 0, c0: 0, total: 0 },
          { title: "Guibert", c100: 0, c50: 0, c1: 0, c0: 0, total: 0 },
          { title: "Guyomard", c100: 0, c50: 0, c1: 0, c0: 0, total: 0 },
          { title: "Total", c100: 0, c50: 0, c1: 0, c0: 0, total: 0 }
        ];
        for (const p of this.persons) {
          const row = this.stats.overview.find(e => e.title.toLowerCase() === p.rootFamily);
        }
      },

      saveTrombi: async function () {
        if (!this.trombiEditor.date) {
          this.trombiEditor
        }

        this.trombiEditor.isLoading = true;

        // On récupère l'image
        axios.get(await this.$refs.imgEditor.imageUrl(), { responseType: 'blob' }).then(
          response => {
            const formData = new FormData();
            formData.append("date", this.trombiEditor.date);
            formData.append("person", JSON.stringify(this.trombiEditor.person));
            formData.append("image", response.data);

            // On envoie tout au serveur pour qu'il enregistre la nouvelle image du moment
            axios.post(`/api/agenda/trombi/`, formData, {
              headers: {
                "Content-Type" : "multipart/form-data",
              },
              onUploadProgress: progressEvent => {
                this.trombiEditor.complete = (progressEvent.loaded / progressEvent.total * 100 || 0);
              }
            })
            .then(response => {
              const newTrombi = parseAxiosResponse(response);
              // On ajoute l'image à la fin
              const p = this.persons.find(p => p.id === newTrombi.pid);
              p.trombis.push(newTrombi)
              this.resetDialog();
            })
            .catch(err => {
              store.commit("onError", err);
            });
          }
        );
      },
      
      photosGalleryDisplay(index) {
        store.commit('photosGallerySetIndex', index);
        store.commit('photosGalleryDisplay');
      },

      switchHidden() {
        this.filter.hideEmpty = !this.filter.hideEmpty;
        this.applyFilter();
      },

      applyFilter() {
        this.displayedPersons = this.filter.hideEmpty ? this.persons.filter(p => p.trombis.length > 0) : this.persons;
        const tokens = this.filter.search ? this.filter.search.split(" ") : [];
        let index = 0;
        for (const person of this.displayedPersons) {
          person.displayedTrombis = [];
          for (const p of person.trombis) {
            let ok = true;
            for (const t of tokens) {
              if (p.title.toLowerCase().indexOf(t.toLowerCase()) === -1) {
                ok = false;
                break;
              }
            }
            if (ok) {
              person.displayedTrombis.push({
                ...p,
                index
              });
              index++;
            }
          }
        }

        if (this.filter.hideEmpty) {
          this.displayedPersons = this.displayedPersons.filter(p => p.displayedTrombis.length > 0);
        }

        const photos = [];
        for (const p of this.displayedPersons) {
          for (const t of p.displayedTrombis) {
            photos.push(t);
          }
        }
        store.commit('photosGalleryReset', photos);
      }
    }
}
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';


.thumb {
    margin: auto;
    background: white;
    padding: 1px;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
    width: 100px;
    height: 100px;
    margin-right: 5px;
    margin-bottom: 5px;
    cursor: pointer;
}

.col100 {
  color: #06A300;
}
.col50 {
  color: #FFA500;
}
.col1 {
  color: #E00A16;
}
.col0 {
  color: #9E9E9E;
}
</style>
