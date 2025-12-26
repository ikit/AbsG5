<template>
  <div>
    <div :class="{ stickyHeader: $vuetify.display.lgAndUp, stickyHeaderSmall: !$vuetify.display.lgAndUp }">
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
          item-title="label"
          item-value="key"
          @change="changeCollection($event)"
        />

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
            <template #activator="{ props }">
              <v-btn @click.stop="downloadAsCsv()" v-bind="props">
                <v-icon>fas fa-file-download</v-icon>
              </v-btn>
            </template>
            <span>Télécharger les données au format CSV (excel)</span>
          </v-tooltip>
          
          <v-tooltip bottom>
            <template #activator="{ props }">
              <v-btn @click.stop="displayStats()" v-bind="props">
                <v-icon>fas fa-chart-pie</v-icon>
              </v-btn>
            </template>
            <span>Voir les statistiques</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ props }">
              <v-btn @click.stop="resetDialog(true)" v-bind="props">
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
          v-for="c of displayedCollections"
          :key="c.id"
        >
          <v-expansion-panel-title>
            {{ c.title }}
            <v-spacer />
            {{ c.count }}/{{ c.total }}
            <i class="fas fa-circle" style="flex: none" :class="c.cssStatus"/>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-tooltip
              v-for="i of c.items"
              :key="i.number"
              bottom
            >
              <template #activator="{ props }">
                <div
                  :style="{ 'background-image': `url('${i.img}')` }"
                  :class="i.ok ? 'itemOk' : 'itemGhost'"
                  @click="switchItem(i)"
                  v-bind="props"
                />
              </template>
              <span>{{ i.number }} - {{ i.title }}</span>
            </v-tooltip>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-container>

    <v-dialog
      v-model="serieEditor.open"
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
            v-model="serieEditor.title"
            :items="serieEditor.availableSeries"
            label="Titre de la série"
            prepend-icon="fas fa-tag"
            item-title="title"
            :disabled="serieEditor.isLoading"
            @change="onSerieTitleChanged()"
          />
          
          <v-data-table 
            :headers="serieEditor.headers" 
            :items="serieEditor.items"
            item-key="number">
            <template v-slot:body="{ items, headers }">
              <tbody>
                <tr v-for="(item,idx,k) in items" :key="idx">
                  <td v-for="(header,key) in headers" :key="key">
                    {{ item[header.value] }}
                    <!-- TODO: v-edit-dialog n'existe plus dans Vuetify 3, à remplacer par un dialog custom -->
                  </td>
                </tr>
              </tbody>
            </template>
          </v-data-table>

        <!--
          <v-data-table>
            <template #item="{ item }">
              <tr>
                <td>{{ item.number }}</td>
                <td>{{ item.title }}</td>
                <td>
                  <v-btn @click.stop="editItem(item)">
                    <v-icon>fas fa-pen</v-icon>
                  </v-btn>
                </td>
              </tr>
            </template>
          </v-data-table>

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
          <v-btn
            variant="text"
            color="primary"
            :disabled="serieEditor.isLoading"
            @click="addItem()"
          >
            Ajouter item
          </v-btn>
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            :disabled="serieEditor.isLoading"
            @click="resetDialog()"
          >
            Annuler
          </v-btn>
          <v-btn
            color="accent"
            :disabled="serieEditor.isLoading"
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
import axios from 'axios';
import { getModuleInfo, getPeopleAvatar, parseAxiosResponse } from '../../middleware/CommonHelper';
import { format } from 'date-fns';

export default {
    data: () => ({
        isLoading: false,
        panel: [],
        collections: [],
        displayedCollections: [],
        types: [
          { key: "COMIC", label: "Bandes dessinées", icon: "fas fa-book" },
          { key: "BOOK", label: "Romans", icon: "fas fa-book" },
          { key: "MANGA", label: "Manga", icon: "fas fa-book" },
          { key: "VINYL", label: "Vinyls", icon: "fas fa-compact-disc" },
          { key: "BOARDGAME", label: "Jeux de sociétés", icon: "fas fa-chess-knight" },
          { key: "LEGO", label: "Légo", icon: "fas fa-cubes" },
          { key: "WINE", label: "Cave", icon: "fas fa-wine-glass-alt" },
        ],
        selectedType: null,
        filter: {
            type: "nom",
            type: "nom",
            search: null,
        },
        serieEditor: {
          availableSeries: [],
          title: "",
          items: [],
          open: false,
          isLoading: false,
          headers: [
            { text: "Numéro", value: "number" },
            { text: "Titre", value: "title" },
            { text: "Vignette", value: "url" }
          ]
        }
    }),
    mounted () {
      const path = this.$route.params.path;
      console.log("Path: " + path)
      axios.get(`/api/gtheque/`).then(response => {
          this.collections = parseAxiosResponse(response).map(e => ({
            ...e,
            cssStatus: this.computeCssStatus(e)
          }));
          this.changeCollection("COMIC");
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
        this.applyFilter();
      },
      applyFilter: function() {
        const tokens = this.filter.search ? this.filter.search.split(" ").map(t => t.toLowerCase()) : [];
        this.displayedCollections = this.collections.filter(c => 
          c.type === this.selectedType.key && 
          (tokens.length === 0 || tokens.some(t => c.title.toLowerCase().indexOf(t) >= 0)
        ));
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
        this.serieEditor.open = open;
      },
      onSerieTitleChanged: function() {
        if (typeof this.serieEditor.title == "string") {
          // Nouvelle collection
          this.serieEditor.id = null;
          this.serieEditor.items = [];
        } else if (typeof this.serieEditor.title == "object") {
          // Edition d'une série existante
          this.serieEditor.items = this.serieEditor.title.items ? this.serieEditor.title.items : [];
          this.serieEditor.id = this.serieEditor.title.id;
          this.serieEditor.title = this.serieEditor.title.title;
        }
        console.log(this.serieEditor);
      },
      addNewCollecion: function() {
        console.log(this.serieEditor)
      },
    save() {},
    cancel() {},
    open() {},
    close() {},
    addItem() {
      this.serieEditor.items.push({
        number: `${this.serieEditor.items.length + 1}`,
        title: "",
        url: ""
      })
    }
    }
}
</script>


<style lang="scss" scoped>
@use '../../themes/global.scss' as *;

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
