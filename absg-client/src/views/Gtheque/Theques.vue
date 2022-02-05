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
            <i class="fas fa-circle" style="flex: none" :class="c.cssStatus"/>
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
            item-text="title"
            :disabled="serieEditor.isLoading"
            @change="onSerieTitleChanged()"
          />
          
          <v-data-table 
            :headers="serieEditor.headers" 
            :items="serieEditor.items"
            item-key="number"
            v-sortable-data-table
            @sorted="saveOrder">
            <template v-slot:body="{ items, headers }">
              <tbody>
                <tr v-for="(item,idx,k) in items" :key="idx">
                  <td v-for="(header,key) in headers" :key="key">
                    <v-edit-dialog
                      :return-value.sync="item[header.value]"
                      @save="save"
                      @cancel="cancel"
                      @open="open"
                      @close="close"
                      large
                    > {{item[header.value]}}
                      <template v-slot:input>
                        <v-text-field
                          v-model="item[header.value]"
                          label="Edit"
                          single-line
                        ></v-text-field>
                      </template>
                    </v-edit-dialog>
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
            text
            color="primary"
            :disabled="serieEditor.isLoading"
            @click="addItem()"
          >
            Ajouter item
          </v-btn>
          <v-spacer />
          <v-btn
            text
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
