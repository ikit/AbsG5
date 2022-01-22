<template>
  <div>
    <div :class="{ stickyHeader: $vuetify.breakpoint.lgAndUp, stickyHeaderSmall: !$vuetify.breakpoint.lgAndUp }">
      <v-row
        style="margin: 0"
        align="center"
        justify="center"
      >
        <v-select
          :prepend-icon="selectedType ? selectedType.icon : ''"
          prepend-inner=""
          :items="types"
          style="width: 150px; margin-right: 30px"
          label="Collection"
          item-text="label"
          item-value="key"
          @change="changeCollection($event)"
        />

        <v-text-field
          v-model="filter.search"
          prepend-icon="fa-search"
          placeholder="Rechercher"
          style="max-width: 300px;"
        />

        <v-spacer />

        <v-btn-toggle :disabled="isLoading">
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn @click.stop="downloadAsCsv()">
                <v-icon>fas fa-file-download</v-icon>
              </v-btn>
            </template>
            <span>Télécharger les données au format CSV (excel)</span>
          </v-tooltip>
          
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn @click.stop="displayStats()">
                <v-icon>fas fa-chart-pie</v-icon>
              </v-btn>
            </template>
            <span>Voir les statistiques</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn @click.stop="resetDialog(true)">
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
          v-for="c of collections"
          :key="c.id"
        >
          <v-expansion-panel-header>
            {{ c.title }}
            <v-spacer />
            {{ c.count }}/{{ c.total }}
            <i class="fas fa-circle" :class="c.cssStatus"/>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-tooltip
              v-for="i of c.items"
              :key="i.number"
              bottom
            >
              <template #activator="{ on }">
                <div
                  :style="{ 'background-image': `url('${i.img}')` }"
                  :class="i.ok ? 'itemOk' : 'itemGhost'"
                  @click="switchItem(i)"
                  v-on="on"
                />
              </template>
              <span>{{ i.number }} - {{ i.title }}</span>
            </v-tooltip>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-container>

    <v-dialog
      v-model="collectionEditor.open"
      width="600px"
    >
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">
          Ajouter une nouvelle série à votre collection
        </v-card-title>
        <v-container
          grid-list-sm
          class="pa-4"
        >
          <v-combobox
            v-model="collectionEditor.title"
            :items="collectionEditor.existingCollections"
            label="Titre de la série"
            prepend-icon="fas fa-tag"
            item-text="title"
            :disabled="collectionEditor.isLoading"
          />
        <!--
          <v-text-field
            v-model="trombiEditor.date"
            :rules="editorRules.date"
            label="Quand"
            placeholder="AAAA.MM.JJ"
            validate-on-blur
            prepend-icon="far fa-calendar-alt"
          />
        -->
        </v-container>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            color="primary"
            :disabled="collectionEditor.isLoading"
            @click="resetDialog()"
          >
            Annuler
          </v-btn>
          <v-btn
            color="accent"
            :disabled="collectionEditor.isLoading"
            @click="addNewCollecion()"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>


<script>
import Vue from 'vue';
import axios from 'axios';
import { getModuleInfo, getPeopleAvatar, parseAxiosResponse } from '../../middleware/CommonHelper';
import { format } from 'date-fns';

export default {
    data: () => ({
        collections: [],
        types: [
          { key: "COMIC", label: "Bandes dessinées", icon: "fas fa-book" },
          { key: "BOOK", label: "Romans", icon: "fas fa-book" },
          { key: "WINE", label: "Cave", icon: "fas fa-wine-glass-alt" },
          { key: "MANGA", label: "Manga", icon: "fas fa-book" },
          { key: "BOARDGAME", label: "Jeux de sociétés", icon: "fas fa-chess-knight" },
          { key: "LEGO", label: "Légo", icon: "fas fa-cubes" }
        ],
        selectedType: null,
        filter: {
            type: "nom",
            type: "nom",
            search: null,
        },
        collectionEditor: {
          existingCollections: [
            { title: "Achille Talon (Intégrales)", id: 1 },
            { title: "De Cape et de Crocs", id: 2 },
            { title: "Garulfo", id: 3 },
            { title: "Spirou et Fantasio (Intégrales)", id: 4 },
          ],
          title: "",
          items: [],
          open: false,
          isLoading: false,
        }
    }),
    mounted () {
      setTimeout(() => this.changeCollection("COMIC"));
      axios.get(`/api/gtheque/`).then(response => {
          this.collections = parseAxiosResponse(response).map(e => ({
            ...e,
            cssStatus: this.computeCssStatus(e)
          }));
          console.log(this.collections);
      });
    },
    methods: {
      computeCssStatus: function (c) {
        let res = "colStatus ";
        if (c.count === c.total) {
          res += "col100";
        } else if (c.count > c.total / 2) {
          res += "col50";
        } else if (c.count > 1) {
          res += "col1";
        } else {
          res += "col0";
        }
        return res;
      },
      changeCollection: function(colKey) {
        this.selectedType = this.types.find(t => t.key === colKey);
      },
      switchItem: function (item) {
        item.ok = !item.ok;
        for (const c of this.collections) {
          c.count = c.items.filter(i => i.ok).length;
          c.cssStatus = this.computeCssStatus(c)
        }
      },
      displayStats: function() {
        console.log("Voir les stats");
      },
      downloadAsCsv: function() {
        console.log("Télécharger les donnéess");
      },
      resetDialog: function(open = false) {
        this.collectionEditor.open = open;
      },
      addNewCollecion: function() {
        console.log(this.collectionEditor)
      }
    }
}
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';

.colStatus {
  flex: none;
  display: inline-block;
  width: 20px;
  margin: 0 10px;
}
.itemOk, .itemGhost {
  display: inline-block;
  width: 100px;
  height: 150px;
  border: 1px solid #000;
  background-size: cover;
  cursor: pointer;
}
.itemGhost {
  filter: grayscale(1);
  opacity: 0.5;
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
