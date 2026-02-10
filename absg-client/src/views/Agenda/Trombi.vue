<template>
  <div>
    <v-container class="sticky-header-container">
      <v-card class="sticky-card">
        <v-card-title class="card-header">
          <v-text-field
            v-model="filter.search"
            prepend-inner-icon="fas fa-search"
            label="Rechercher"
            single-line
            hide-details
            density="compact"
            variant="outlined"
            class="search-field"
            @change="applyFilter()"
          />

          <v-spacer />

          <v-tooltip bottom>
            <template #activator="{ props }">
              <v-btn color="accent" class="mr-2" @click.stop="startMemoryGame()" v-bind="props">
                <v-icon start>fas fa-th</v-icon>
                Memory
              </v-btn>
            </template>
            <span>Jouer au Memory</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ props }">
              <v-btn color="accent" class="mr-4" @click.stop="startChronoGame()" v-bind="props">
                <v-icon start>fas fa-sort-numeric-down</v-icon>
                Chrono
              </v-btn>
            </template>
            <span>Jouer au Chrono Trombi</span>
          </v-tooltip>

          <v-spacer />

          <v-btn-toggle :disabled="isLoading">
            <v-tooltip bottom v-if="isAdmin">
              <template #activator="{ props }">
                <v-btn @click.stop="rebuildTrombis()" v-bind="props">
                  <v-icon>fas fa-redo</v-icon>
                </v-btn>
              </template>
              <span>Reconstruire la liste des trombi</span>
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
        </v-card-title>
      </v-card>
    </v-container>

    <v-container style="padding-top: 0;">
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
          <v-expansion-panel-title>
            {{ p.fullname }}
            <v-spacer />
            {{ p.trombis.length }}/{{ p.trombiMax }}
            <i class="fas fa-portrait" :class="p.cssStatus" style="margin-left: 10px; margin-right: 10px; flex: none"/>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-tooltip
              v-for="t of p.displayedTrombis"
              :key="t.url"
              bottom
            >
              <template #activator="{ props }">
                <img
                  class="thumb"
                  :src="t.thumb"
                  v-bind="props"
                  @click="photosGalleryDisplay(t.index)"
                />
              </template>
              <span>{{ t.title }}</span>
            </v-tooltip>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-container>

    <v-dialog
      v-model="trombiEditor.open"
      width="400px"
    >
      <v-card>
        <v-card-title class="dialog-header bg-primary">
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
            prepend-inner-icon="fas fa-user"
            item-title="fullname"
            variant="outlined"
            density="compact"
            hide-details
          />

          <v-text-field
            v-model="trombiEditor.date"
            :rules="editorRules.date"
            label="Quand"
            placeholder="Année de la photo"
            validate-on-blur
            prepend-inner-icon="fas fa-calendar-alt"
            variant="outlined"
            density="compact"
            hide-details
            class="mt-4"
          />

          <ImageEditor
            ref="imgEditor"
            icon="fas fa-camera"
            style="height: 300px;"
            mode="square"
            class="mt-4"
          />
          <div v-if="trombiEditor.isLoading">
            Enregistrement en cours : {{ trombiEditor.complete }}%
          </div>
        </v-container>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn
            variant="text"
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
      max-width="900px"
    >
      <v-card>
        <v-card-title class="dialog-header bg-primary">
          <v-icon start>fas fa-chart-pie</v-icon>
          Statistiques des trombinoscopes
        </v-card-title>
        <v-card-text class="stats-content">
          <div class="stats-layout">
            <div class="stats-table-container">
              <table class="stats-table">
                <thead>
                  <tr>
                    <th>Famille</th>
                    <th class="col0-header">0%</th>
                    <th class="col1-header">&lt; 50%</th>
                    <th class="col50-header">&gt; 50%</th>
                    <th class="col100-header">100%</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in stats.overview"
                    :key="row.title"
                    :class="{ 'total-row': row.title === 'Total' }"
                  >
                    <td class="family-cell">{{ row.title }}</td>
                    <td>{{ row.col0 }}</td>
                    <td>{{ row.col1 }}</td>
                    <td>{{ row.col50 }}</td>
                    <td>{{ row.col100 }}</td>
                    <td class="total-cell">{{ row.total }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="stats-chart-container">
              <highcharts
                v-if="stats.overviewGraph"
                :options="stats.overviewGraph"
              />
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn
            variant="text"
            @click="stats.open = false"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Memory Game Dialog -->
    <v-dialog
      v-model="memory.open"
      :max-width="memory.gridCols >= 12 ? '1100px' : memory.gridCols >= 10 ? '950px' : '800px'"
      persistent
    >
      <v-card class="memory-card">
        <v-card-title class="dialog-header bg-primary">
          <v-icon start>fas fa-th</v-icon>
          Memory Trombinoscope
          <v-spacer />
          <div class="memory-timer" :class="{ 'timer-warning': memory.timeLeft <= 30 }">
            <v-icon size="small" class="mr-1" style="vertical-align: text-bottom">fas fa-clock</v-icon>
            {{ formatTime(memory.timeLeft) }}
          </div>
        </v-card-title>

        <v-card-text class="memory-content">
          <!-- État initial: pas encore commencé -->
          <div v-if="memory.status === 'ready'" class="memory-intro">
            <v-icon size="64" color="primary" class="mb-4">fas fa-brain</v-icon>
            <h3>Niveau {{ memory.level }}</h3>
            <p>Retrouvez les {{ memory.pairsCount }} paires de photos en moins de {{ formatTime(memory.totalTime) }} !</p>
            <v-btn color="accent" size="large" @click="launchMemoryGame()">
              <v-icon start>fas fa-play</v-icon>
              Commencer
            </v-btn>
          </div>

          <!-- Grille de jeu -->
          <div v-else-if="memory.status === 'playing'" class="memory-grid" :style="{ gridTemplateColumns: `repeat(${memory.gridCols}, 1fr)` }">
            <div
              v-for="(card, index) in memory.cards"
              :key="index"
              class="memory-cell"
              :class="{
                'flipped': card.flipped || card.matched,
                'matched': card.matched
              }"
              @click="flipCard(index)"
            >
              <div class="memory-cell-inner">
                <div class="memory-cell-front">
                  <v-icon size="32" color="primary">fas fa-question</v-icon>
                </div>
                <div class="memory-cell-back">
                  <img :src="card.thumb" :alt="card.name" />
                </div>
              </div>
            </div>
          </div>

          <!-- Victoire -->
          <div v-else-if="memory.status === 'won'" class="memory-result memory-won">
            <v-icon size="64" color="success" class="mb-4">fas fa-trophy</v-icon>
            <h3>Niveau {{ memory.level }} réussi !</h3>
            <p>Vous avez trouvé les {{ memory.pairsCount }} paires en {{ formatTime(memory.totalTime - memory.timeLeft) }} !</p>
            <p class="memory-stats">{{ memory.moves }} coups joués</p>
            <v-btn color="accent" class="mt-2" @click="nextMemoryLevel()">
              <v-icon start>fas fa-arrow-right</v-icon>
              Niveau {{ memory.level + 1 }} ({{ getNextPairsCount() }} paires)
            </v-btn>
            <v-btn variant="text" class="mt-2 ml-2" @click="resetMemoryToLevel1()">
              Recommencer au niveau 1
            </v-btn>
          </div>

          <!-- Défaite -->
          <div v-else-if="memory.status === 'lost'" class="memory-result memory-lost">
            <v-icon size="64" color="error" class="mb-4">fas fa-clock</v-icon>
            <h3>Temps écoulé !</h3>
            <p>Niveau {{ memory.level }} : vous avez trouvé {{ memory.matchedPairs }}/{{ memory.pairsCount }} paires.</p>
            <v-btn color="accent" @click="retryMemoryLevel()">
              <v-icon start>fas fa-redo</v-icon>
              Réessayer ce niveau
            </v-btn>
            <v-btn variant="text" class="ml-2" @click="resetMemoryToLevel1()">
              Recommencer au niveau 1
            </v-btn>
          </div>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <div v-if="memory.status === 'playing'" class="memory-info">
            <span class="memory-level-badge">Niv. {{ memory.level }}</span>
            <span class="ml-3"><v-icon size="small" class="mr-1">fas fa-mouse-pointer</v-icon> {{ memory.moves }} coups</span>
            <span class="ml-3"><v-icon size="small" class="mr-1">fas fa-check-double</v-icon> {{ memory.matchedPairs }}/{{ memory.pairsCount }}</span>
          </div>
          <v-spacer />
          <v-btn variant="text" @click="closeMemoryGame()">
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Chrono Trombi Game Dialog -->
    <v-dialog
      v-model="chrono.open"
      max-width="1000px"
      persistent
    >
      <v-card>
        <v-card-title class="dialog-header bg-primary">
          <v-icon start>fas fa-sort-numeric-down</v-icon>
          Chrono Trombi
          <v-spacer />
          <div class="memory-timer" :class="{ 'timer-warning': chrono.timeLeft <= 30 }">
            <v-icon size="small" class="mr-1" style="vertical-align: text-bottom">fas fa-clock</v-icon>
            {{ formatTime(chrono.timeLeft) }}
          </div>
        </v-card-title>

        <v-card-text class="chrono-content">
          <!-- État ready -->
          <div v-if="chrono.status === 'ready'" class="memory-intro">
            <v-icon size="64" color="primary" class="mb-4">
              {{ chrono.mode === 'chrono' ? 'fas fa-calendar-alt' : 'fas fa-child' }}
            </v-icon>
            <h3>Niveau {{ chrono.level }}</h3>
            <div class="chrono-mode-badge mb-3">
              {{ chrono.mode === 'chrono' ? 'Mode Chronologique' : 'Mode Âge' }}
            </div>
            <p v-if="chrono.mode === 'chrono'">
              Remettez {{ chrono.photosCount }} photos de {{ chrono.peopleCount }} personnes
              dans l'ordre chronologique en moins de {{ formatTime(chrono.totalTime) }} !
            </p>
            <p v-else>
              Classez {{ chrono.photosCount }} photos de {{ chrono.peopleCount }} personnes
              par âge croissant en moins de {{ formatTime(chrono.totalTime) }} !
            </p>
            <p style="font-size: 0.85em; opacity: 0.6;">Cliquez sur deux photos pour les échanger de place.</p>
            <v-btn color="accent" size="large" @click="launchChronoGame()">
              <v-icon start>fas fa-play</v-icon>
              Commencer
            </v-btn>
          </div>

          <!-- Grille de jeu -->
          <div v-else-if="chrono.status === 'playing' || chrono.status === 'won' || chrono.status === 'lost'">
            <div class="chrono-grid">
              <div
                v-for="(card, index) in chrono.cards"
                :key="card.thumb"
                class="chrono-card"
                :class="{
                  'selected': chrono.selectedIndex === index && chrono.status === 'playing',
                  'correct': chrono.validated && card.sortKey === chrono.correctOrder[index],
                  'wrong': chrono.validated && card.sortKey !== chrono.correctOrder[index],
                  'disabled': chrono.status !== 'playing'
                }"
                @click="selectChronoCard(index)"
              >
                <div class="chrono-card-position">{{ index + 1 }}</div>
                <img :src="card.thumb" :alt="card.name" />
                <div class="chrono-card-name">{{ card.name }}</div>
                <div v-if="chrono.validated && chrono.status !== 'playing'" class="chrono-card-year">
                  {{ chrono.mode === 'chrono' ? card.year : card.age + ' ans' }}
                </div>
              </div>
            </div>

            <!-- Bouton valider (pendant le jeu) -->
            <div v-if="chrono.status === 'playing'" class="chrono-validate">
              <v-btn
                color="accent"
                size="large"
                @click="validateChronoOrder()"
              >
                <v-icon start>fas fa-check</v-icon>
                Valider l'ordre
              </v-btn>
            </div>

            <!-- Victoire -->
            <div v-if="chrono.status === 'won'" class="memory-result memory-won" style="padding-top: 16px;">
              <v-icon size="48" color="success" class="mb-2">fas fa-trophy</v-icon>
              <h3>Niveau {{ chrono.level }} réussi !</h3>
              <p>{{ chrono.moves }} échanges en {{ formatTime(chrono.totalTime - chrono.timeLeft) }}</p>
              <v-btn color="accent" class="mt-2" @click="nextChronoLevel()">
                <v-icon start>fas fa-arrow-right</v-icon>
                Niveau {{ chrono.level + 1 }}
              </v-btn>
              <v-btn variant="text" class="mt-2 ml-2" @click="resetChronoToLevel1()">
                Niveau 1
              </v-btn>
            </div>

            <!-- Défaite -->
            <div v-if="chrono.status === 'lost'" class="memory-result memory-lost" style="padding-top: 16px;">
              <v-icon size="48" color="error" class="mb-2">fas fa-clock</v-icon>
              <h3>Temps écoulé !</h3>
              <v-btn color="accent" class="mt-2" @click="retryChronoLevel()">
                <v-icon start>fas fa-redo</v-icon>
                Réessayer
              </v-btn>
              <v-btn variant="text" class="mt-2 ml-2" @click="resetChronoToLevel1()">
                Niveau 1
              </v-btn>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <div v-if="chrono.status === 'playing'" class="memory-info">
            <span class="memory-level-badge">Niv. {{ chrono.level }}</span>
            <span class="chrono-mode-tag ml-2">{{ chrono.mode === 'chrono' ? 'Chrono' : 'Âge' }}</span>
            <span class="ml-3"><v-icon size="small" class="mr-1">fas fa-exchange-alt</v-icon> {{ chrono.moves }} échanges</span>
          </div>
          <v-spacer />
          <v-btn variant="text" @click="closeChronoGame()">
            Fermer
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
import store from '../../stores/helpers';
import {Chart} from 'highcharts-vue';
import Highcharts from 'highcharts';
import HC_sankey from 'highcharts/modules/sankey';
import HC_depwheel from 'highcharts/modules/dependency-wheel';
import { mapState } from '../../stores/helpers';
HC_sankey(Highcharts);
HC_depwheel(Highcharts);

export default {
    components: {
      ImageEditor,
      highcharts: Chart
    },
    store,
    data: () => ({
        isLoading: false,
        isAdmin: false,
        panel: [],
        persons: [],
        displayedPersons: [],
        layoutMode: "GRID",
        sortMode: "ASC",
        filter: {
            hideEmpty: false,
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
          overview: [],
          overviewGraph: null,
        },
        memory: {
          open: false,
          status: 'ready', // ready, playing, won, lost
          cards: [],
          flippedCards: [],
          matchedPairs: 0,
          moves: 0,
          timeLeft: 180,
          totalTime: 180,
          timer: null,
          isProcessing: false,
          level: 1,
          pairsCount: 12,
          gridCols: 8,
        },
        chrono: {
          open: false,
          status: 'ready', // ready, playing, won, lost
          mode: 'chrono', // 'chrono' (par année) ou 'age' (par âge)
          cards: [],
          correctOrder: [],
          selectedIndex: null,
          moves: 0,
          timeLeft: 180,
          totalTime: 180,
          timer: null,
          level: 1,
          photosCount: 10,
          peopleCount: 2,
          validated: false,
        },
    }),

    computed: {
        ...mapState([
            'user'
        ]),
      numberOfPages () {
        return Math.ceil(this.photos.length / this.filter.pageSize)
      }
    },

    mounted () {
        if (this.user) {
            this.isAdmin = this.user.roles.indexOf("admin") > -1;
        }
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

    beforeUnmount() {
      if (this.memory.timer) {
        clearInterval(this.memory.timer);
      }
      if (this.chrono.timer) {
        clearInterval(this.chrono.timer);
      }
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
        this.stats.overview = [
          { title: "Gueudelot", col100: 0, col50: 0, col1: 0, col0: 0, total: 0 },
          { title: "Guibert", col100: 0, col50: 0, col1: 0, col0: 0, total: 0 },
          { title: "Guyomard", col100: 0, col50: 0, col1: 0, col0: 0, total: 0 },
          { title: "Autres", col100: 0, col50: 0, col1: 0, col0: 0, total: 0 },
          { title: "Total", col100: 0, col50: 0, col1: 0, col0: 0, total: 0 }
        ];
        for (const p of this.persons) {
          const row = this.stats.overview.find(e => e.title.toLowerCase() === (p.rootFamily ?? "autres"));
          const status = p.cssStatus.split(" ")[1]
          row[status] += 1;
          row.total += 1;
          this.stats.overview[4][status] += 1;
          this.stats.overview[4].total += 1;
        }
        this.stats.overviewGraph = {
          title: null,
          subtitle: null,
          chart: {
              type: 'bar'
          },
          xAxis: {
              categories: ['Gueudelot', 'Guibert', 'Guyomard', 'Autres']
          },
          yAxis: {
              min: 0,
              title: null
          },
          legend: {
              reversed: true
          },
          plotOptions: {
              series: {
                  stacking: 'normal'
              }
          },
          colors: ['#06A300', '#FFA500', '#E00A16', '#9E9E9E'],
          series: [{
              name: '100%',
              data: [
                this.stats.overview[0].col100,
                this.stats.overview[1].col100, 
                this.stats.overview[2].col100, 
                this.stats.overview[3].col100
              ]
            }, {
              name: '> 50%',
              data: [
                this.stats.overview[0].col50,
                this.stats.overview[1].col50, 
                this.stats.overview[2].col50, 
                this.stats.overview[3].col50
              ]
            }, {
              name: '< 50%',
              data: [
                this.stats.overview[0].col1,
                this.stats.overview[1].col1, 
                this.stats.overview[2].col1, 
                this.stats.overview[3].col1
              ]
            }, {
              name: '0%',
              data: [
                this.stats.overview[0].col0,
                this.stats.overview[1].col0, 
                this.stats.overview[2].col0, 
                this.stats.overview[3].col0
              ]
            }]
        };
        this.stats.open = true;
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
              this.trombiEditor.person.trombis.push(newTrombi);
              this.applyFilter();
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
      },

      rebuildTrombis() {
        this.isLoading = true;
        // On récupère la liste des photos
        axios.get(`/api/agenda/trombi/`).then(response => {
          this.persons = parseAxiosResponse(response).map(e => ({
            ...e,
            trombiCount: e.trombis.length,
            cssStatus: this.computeCssStatus(e)
          }));
          this.applyFilter();

          this.isLoading = false;
        });
      },

      // Memory Game Methods
      startMemoryGame() {
        const config = this.getLevelConfig(this.memory.level);
        this.memory.open = true;
        this.memory.status = 'ready';
        this.memory.cards = [];
        this.memory.flippedCards = [];
        this.memory.matchedPairs = 0;
        this.memory.moves = 0;
        this.memory.pairsCount = config.pairs;
        this.memory.gridCols = config.cols;
        this.memory.totalTime = config.time;
        this.memory.timeLeft = config.time;
        if (this.memory.timer) {
          clearInterval(this.memory.timer);
          this.memory.timer = null;
        }
      },

      resetMemoryToLevel1() {
        this.memory.level = 1;
        const config = this.getLevelConfig(1);
        this.memory.pairsCount = config.pairs;
        this.memory.gridCols = config.cols;
        this.memory.totalTime = config.time;
        this.memory.timeLeft = config.time;
        this.memory.status = 'ready';
        this.memory.cards = [];
        this.memory.flippedCards = [];
        this.memory.matchedPairs = 0;
        this.memory.moves = 0;
        if (this.memory.timer) {
          clearInterval(this.memory.timer);
          this.memory.timer = null;
        }
      },

      nextMemoryLevel() {
        this.memory.level++;
        const config = this.getLevelConfig(this.memory.level);
        this.memory.pairsCount = config.pairs;
        this.memory.gridCols = config.cols;
        this.memory.totalTime = config.time;
        this.memory.timeLeft = config.time;
        this.memory.status = 'ready';
        this.memory.cards = [];
        this.memory.flippedCards = [];
        this.memory.matchedPairs = 0;
        this.memory.moves = 0;
      },

      retryMemoryLevel() {
        const config = this.getLevelConfig(this.memory.level);
        this.memory.totalTime = config.time;
        this.memory.timeLeft = config.time;
        this.memory.status = 'ready';
        this.memory.cards = [];
        this.memory.flippedCards = [];
        this.memory.matchedPairs = 0;
        this.memory.moves = 0;
      },

      getLevelConfig(level) {
        // Configuration des niveaux: { pairs, cols, time }
        // Grilles horizontales et -30s par niveau
        const configs = [
          { pairs: 12, cols: 8,  time: 180 }, // Niveau 1: 8x3  = 24 cartes
          { pairs: 15, cols: 10, time: 150 }, // Niveau 2: 10x3 = 30 cartes
          { pairs: 18, cols: 9,  time: 140 }, // Niveau 3: 9x4  = 36 cartes
          { pairs: 20, cols: 10, time: 130 }, // Niveau 4: 10x4 = 40 cartes
          { pairs: 24, cols: 12, time: 120 }, // Niveau 5: 12x4 = 48 cartes
          { pairs: 28, cols: 14, time: 120 }, // Niveau 6: 14x4 = 56 cartes
          { pairs: 30, cols: 12, time: 120 }, // Niveau 7+: 12x5 = 60 cartes
        ];
        const index = Math.min(level - 1, configs.length - 1);
        return configs[index];
      },

      getNextPairsCount() {
        return this.getLevelConfig(this.memory.level + 1).pairs;
      },

      launchMemoryGame() {
        // Collecter toutes les photos disponibles
        const allTrombis = [];
        for (const person of this.persons) {
          for (const trombi of person.trombis) {
            allTrombis.push({
              thumb: trombi.thumb,
              name: person.fullname
            });
          }
        }

        const requiredPairs = this.memory.pairsCount;

        // Vérifier qu'on a assez de photos
        if (allTrombis.length < requiredPairs) {
          store.commit('onError', { message: `Pas assez de photos pour ce niveau (${requiredPairs} requises, ${allTrombis.length} disponibles)` });
          return;
        }

        // Mélanger et prendre le nombre de photos requis
        const shuffled = allTrombis.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, requiredPairs);

        // Créer les paires
        const cards = [];
        selected.forEach((photo, pairId) => {
          cards.push({ ...photo, pairId, flipped: false, matched: false });
          cards.push({ ...photo, pairId, flipped: false, matched: false });
        });

        // Mélanger les cartes
        this.memory.cards = cards.sort(() => Math.random() - 0.5);
        this.memory.status = 'playing';
        this.memory.flippedCards = [];
        this.memory.matchedPairs = 0;
        this.memory.moves = 0;
        this.memory.timeLeft = this.memory.totalTime;
        this.memory.isProcessing = false;

        // Démarrer le timer
        this.memory.timer = setInterval(() => {
          this.memory.timeLeft--;
          if (this.memory.timeLeft <= 0) {
            this.endMemoryGame(false);
          }
        }, 1000);
      },

      flipCard(index) {
        const card = this.memory.cards[index];

        // Ignorer si on traite déjà une paire, si la carte est déjà retournée ou déjà trouvée
        if (this.memory.isProcessing || card.flipped || card.matched) {
          return;
        }

        // Retourner la carte
        card.flipped = true;
        this.memory.flippedCards.push(index);

        // Si on a retourné 2 cartes
        if (this.memory.flippedCards.length === 2) {
          this.memory.moves++;
          this.memory.isProcessing = true;

          const [firstIndex, secondIndex] = this.memory.flippedCards;
          const firstCard = this.memory.cards[firstIndex];
          const secondCard = this.memory.cards[secondIndex];

          if (firstCard.pairId === secondCard.pairId) {
            // Paire trouvée !
            firstCard.matched = true;
            secondCard.matched = true;
            this.memory.matchedPairs++;
            this.memory.flippedCards = [];
            this.memory.isProcessing = false;

            // Vérifier si toutes les paires sont trouvées
            if (this.memory.matchedPairs === this.memory.pairsCount) {
              this.endMemoryGame(true);
            }
          } else {
            // Pas une paire, retourner les cartes après un délai
            setTimeout(() => {
              firstCard.flipped = false;
              secondCard.flipped = false;
              this.memory.flippedCards = [];
              this.memory.isProcessing = false;
            }, 1000);
          }
        }
      },

      endMemoryGame(won) {
        if (this.memory.timer) {
          clearInterval(this.memory.timer);
          this.memory.timer = null;
        }
        this.memory.status = won ? 'won' : 'lost';
      },

      closeMemoryGame() {
        if (this.memory.timer) {
          clearInterval(this.memory.timer);
          this.memory.timer = null;
        }
        this.memory.open = false;
      },

      formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      },

      // Chrono Trombi Game Methods
      getChronoLevelConfig(level) {
        const configs = [
          { photos: 10, people: 2, time: 180, minYearGap: 3 }, // Niv 1
          { photos: 12, people: 3, time: 160, minYearGap: 3 }, // Niv 2
          { photos: 14, people: 4, time: 140, minYearGap: 2 }, // Niv 3
          { photos: 16, people: 5, time: 120, minYearGap: 2 }, // Niv 4
          { photos: 18, people: 6, time: 120, minYearGap: 1 }, // Niv 5
          { photos: 20, people: 7, time: 120, minYearGap: 1 }, // Niv 6
          { photos: 24, people: 8, time: 120, minYearGap: 1 }, // Niv 7
        ];
        const index = Math.min(level - 1, configs.length - 1);
        return configs[index];
      },

      startChronoGame() {
        const config = this.getChronoLevelConfig(this.chrono.level);
        this.chrono.open = true;
        this.chrono.status = 'ready';
        this.chrono.mode = Math.random() < 0.5 ? 'chrono' : 'age';
        this.chrono.cards = [];
        this.chrono.correctOrder = [];
        this.chrono.selectedIndex = null;
        this.chrono.moves = 0;
        this.chrono.photosCount = config.photos;
        this.chrono.peopleCount = config.people;
        this.chrono.totalTime = config.time;
        this.chrono.timeLeft = config.time;
        this.chrono.validated = false;
        if (this.chrono.timer) {
          clearInterval(this.chrono.timer);
          this.chrono.timer = null;
        }
      },

      parseAge(title) {
        // Titre format: "Fullname - year - 35 ans"
        const match = title.match(/(\d+)\s*ans\s*$/);
        return match ? parseInt(match[1]) : null;
      },

      selectChronoPhotos(config) {
        const isAgeMode = this.chrono.mode === 'age';

        // 1. Filtrer les personnes ayant au moins 3 trombis
        const eligiblePersons = this.persons.filter(p => p.trombis.length >= 3);
        if (eligiblePersons.length < config.people) return null;

        // 2. Choisir N personnes au hasard
        const shuffledPersons = [...eligiblePersons].sort(() => Math.random() - 0.5);
        const selectedPersons = shuffledPersons.slice(0, config.people);

        // 3. Collecter les photos avec clé unique (année ou âge)
        const photosMap = new Map();
        for (const person of selectedPersons) {
          for (const trombi of person.trombis) {
            const age = this.parseAge(trombi.title);
            if (age === null) continue;
            const key = isAgeMode ? age : trombi.year;

            if (!photosMap.has(key)) {
              photosMap.set(key, {
                year: trombi.year,
                age,
                thumb: trombi.thumb,
                name: person.fullname,
                sortKey: key,
              });
            }
          }
        }

        let pool = Array.from(photosMap.values());

        // 4. Appliquer le filtre minGap si > 1
        if (config.minYearGap > 1 && pool.length > config.photos) {
          pool.sort((a, b) => a.sortKey - b.sortKey);
          const spaced = [pool[0]];
          for (let i = 1; i < pool.length; i++) {
            if (pool[i].sortKey - spaced[spaced.length - 1].sortKey >= config.minYearGap) {
              spaced.push(pool[i]);
            }
          }
          if (spaced.length >= config.photos) {
            pool = spaced;
          }
        }

        if (pool.length < config.photos) return null;

        // 5. Prendre le nombre requis au hasard
        const shuffled = pool.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, config.photos);
      },

      launchChronoGame() {
        const config = this.getChronoLevelConfig(this.chrono.level);
        const photos = this.selectChronoPhotos(config);

        if (!photos) {
          store.commit('onError', { message: `Pas assez de photos/personnes pour ce niveau` });
          return;
        }

        // Ordre correct = trié par sortKey (année ou âge)
        const sorted = [...photos].sort((a, b) => a.sortKey - b.sortKey);
        this.chrono.correctOrder = sorted.map(p => p.sortKey);

        // Mélanger les cartes pour le joueur
        this.chrono.cards = [...photos].sort(() => Math.random() - 0.5);
        this.chrono.status = 'playing';
        this.chrono.selectedIndex = null;
        this.chrono.moves = 0;
        this.chrono.validated = false;
        this.chrono.timeLeft = config.time;

        // Timer
        this.chrono.timer = setInterval(() => {
          this.chrono.timeLeft--;
          if (this.chrono.timeLeft <= 0) {
            this.endChronoGame(false);
          }
        }, 1000);
      },

      selectChronoCard(index) {
        if (this.chrono.status !== 'playing') return;

        // Réinitialiser la validation visuelle quand on bouge des cartes
        this.chrono.validated = false;

        if (this.chrono.selectedIndex === null) {
          // Premier clic : sélectionner
          this.chrono.selectedIndex = index;
        } else if (this.chrono.selectedIndex === index) {
          // Clic sur la même : désélectionner
          this.chrono.selectedIndex = null;
        } else {
          // Deuxième clic : échanger les deux cartes
          const temp = this.chrono.cards[this.chrono.selectedIndex];
          this.chrono.cards.splice(this.chrono.selectedIndex, 1, this.chrono.cards[index]);
          this.chrono.cards.splice(index, 1, temp);
          this.chrono.selectedIndex = null;
          this.chrono.moves++;
        }
      },

      validateChronoOrder() {
        this.chrono.validated = true;

        // Vérifier si toutes les positions sont correctes
        const allCorrect = this.chrono.cards.every(
          (card, i) => card.sortKey === this.chrono.correctOrder[i]
        );

        if (allCorrect) {
          this.endChronoGame(true);
        }
      },

      endChronoGame(won) {
        if (this.chrono.timer) {
          clearInterval(this.chrono.timer);
          this.chrono.timer = null;
        }
        this.chrono.validated = true;
        this.chrono.status = won ? 'won' : 'lost';
      },

      closeChronoGame() {
        if (this.chrono.timer) {
          clearInterval(this.chrono.timer);
          this.chrono.timer = null;
        }
        this.chrono.open = false;
      },

      nextChronoLevel() {
        this.chrono.level++;
        this.startChronoGame();
      },

      retryChronoLevel() {
        this.startChronoGame();
      },

      resetChronoToLevel1() {
        this.chrono.level = 1;
        this.startChronoGame();
      },

    }
}
</script>


<style lang="scss" scoped>
@use '../../themes/global.scss' as *;

.sticky-header-container {
  position: sticky;
  top: 48px;
  z-index: 10;
  padding-bottom: 0;
}

.sticky-card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.dialog-header {
  color: white;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.dialog-actions {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.search-field {
  max-width: 300px;
}

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

.stats-content {
  padding: 16px 24px;
}

.stats-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.stats-table-container {
  flex: 1;
  min-width: 300px;
}

.stats-chart-container {
  flex: 1;
  min-width: 300px;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  th, td {
    padding: 10px 12px;
    text-align: center;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  }

  thead tr {
    background: rgba(var(--v-theme-surface-variant), 0.7);

    th {
      font-weight: 600;
      font-size: 0.85em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  tbody tr:hover {
    background: rgba(var(--v-theme-surface-variant), 0.3);
  }

  .family-cell {
    text-align: left;
    font-weight: 600;
  }

  .total-cell {
    font-weight: 600;
  }

  .total-row {
    background: rgba(var(--v-theme-surface-variant), 0.5);
    font-weight: 600;

    td {
      border-top: 2px solid rgba(var(--v-theme-on-surface), 0.15);
    }
  }

  .col0-header { color: #9E9E9E; }
  .col1-header { color: #E00A16; }
  .col50-header { color: #FFA500; }
  .col100-header { color: #06A300; }
}

// Memory Game Styles
.memory-card {
  overflow: hidden;
}

.memory-timer {
  font-family: monospace;
  font-size: 1.2em;
  font-weight: bold;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.timer-warning {
  background: rgba(255, 0, 0, 0.3);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.memory-content {
  padding: 24px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.memory-intro,
.memory-result {
  text-align: center;
  padding: 32px;

  h3 {
    font-size: 1.5em;
    margin-bottom: 8px;
  }

  p {
    opacity: 0.8;
    margin-bottom: 16px;
  }
}

.memory-stats {
  font-size: 0.9em;
  opacity: 0.6;
}

.memory-grid {
  display: grid;
  gap: 8px;
  width: 100%;
}

.memory-cell {
  aspect-ratio: 1;
  perspective: 1000px;
  cursor: pointer;
}

.memory-cell-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s;
  transform-style: preserve-3d;
}

.memory-cell.flipped .memory-cell-inner {
  transform: rotateY(180deg);
}

.memory-cell-front,
.memory-cell-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.memory-cell-front {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
}

.memory-cell-back {
  transform: rotateY(180deg);
  background: white;
  padding: 2px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }
}

.memory-cell.matched .memory-cell-back {
  box-shadow: 0 0 0 3px rgb(var(--v-theme-success));
}

.memory-cell.matched {
  cursor: default;
}

.memory-info {
  font-size: 0.9em;
  opacity: 0.8;
  display: flex;
  align-items: center;
}

.memory-level-badge {
  background: rgb(var(--v-theme-primary));
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85em;
}

// Chrono Trombi Game Styles
.chrono-content {
  padding: 24px;
  min-height: 300px;
}

.chrono-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.chrono-card {
  width: 90px;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  background: rgb(var(--v-theme-surface));
  transition: box-shadow 0.15s;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
  }

  img {
    width: 90px;
    height: 90px;
    object-fit: cover;
    display: block;
    pointer-events: none;
  }
}

.chrono-card-position {
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 0.7em;
  font-weight: bold;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
}

.chrono-card-name {
  font-size: 0.7em;
  text-align: center;
  padding: 4px 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
}

.chrono-card-year {
  font-size: 0.75em;
  text-align: center;
  font-weight: bold;
  padding: 2px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  pointer-events: none;
}

.chrono-card.selected {
  box-shadow: 0 0 0 3px rgb(var(--v-theme-primary));
}

.chrono-card.correct {
  box-shadow: 0 0 0 3px rgb(var(--v-theme-success));
}

.chrono-card.wrong {
  box-shadow: 0 0 0 3px rgb(var(--v-theme-error));
}

.chrono-card.disabled {
  cursor: default;

  &:hover {
    transform: none;
  }
}

.chrono-validate {
  text-align: center;
  margin-top: 20px;
}

.chrono-mode-badge {
  display: inline-block;
  padding: 4px 16px;
  border-radius: 20px;
  background: rgba(var(--v-theme-primary), 0.15);
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
  font-size: 0.9em;
}

.chrono-mode-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 600;
  background: rgba(var(--v-theme-secondary), 0.2);
  color: rgb(var(--v-theme-secondary));
}


@media (max-width: 600px) {
  .card-header {
    flex-wrap: wrap;
  }

  .search-field {
    flex: 1;
    min-width: 150px;
    max-width: unset;
  }

  .stats-layout {
    flex-direction: column;
  }

  .stats-table-container,
  .stats-chart-container {
    min-width: 100%;
  }

  .memory-grid {
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 4px;
  }

  .memory-content {
    padding: 12px;
  }

  .memory-cell {
    min-width: 50px;
  }

  .chrono-card {
    width: 70px;

    img {
      width: 70px;
      height: 70px;
    }
  }

  .chrono-grid {
    gap: 6px;
  }

  .chrono-content {
    padding: 12px;
  }

}
</style>
