<template>
  <v-dialog
    v-model="show"
    max-width="1200px"
    scrollable
  >
    <v-card>
      <v-card-title style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; position: sticky; top: 0; z-index: 10;">
        <v-icon start color="white">fas fa-trophy</v-icon>
        Palmarès Complet
      </v-card-title>

      <v-card-text style="padding: 20px;">
        <!-- Filtres et toggle en une seule ligne -->
        <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;">
          <v-text-field
            v-model="searchText"
            prepend-icon="fas fa-search"
            label="Rechercher"
            single-line
            hide-details
            density="comfortable"
            style="flex: 1; min-width: 250px;"
          />
          <v-select
            v-model="familyFilter"
            :items="familyOptions"
            label="Filtrer par famille"
            clearable
            hide-details
            density="comfortable"
            style="flex: 0 0 200px; min-width: 200px;"
          />
          <v-btn-toggle
            v-model="mode"
            mandatory
            color="primary"
            density="comfortable"
            style="flex: 0 0 auto;"
          >
            <v-btn value="sliding" size="small">
              <v-icon start size="small">fas fa-chart-line</v-icon>
              <span v-if="slidingYearFrom && slidingYearTo">
                {{ slidingYearFrom }}-{{ slidingYearTo }}
              </span>
              <span v-else>
                Glissant
              </span>
            </v-btn>
            <v-btn value="global" size="small">
              <v-icon start size="small">fas fa-history</v-icon>
              Global
            </v-btn>
          </v-btn-toggle>
        </div>

        <!-- Tableau avec scroll -->
        <div style="max-height: 500px; overflow-y: auto;">
          <v-data-table
            :headers="headers"
            :items="filteredItems"
            :items-per-page="-1"
            :loading="loading"
            loading-text="Récupération des données..."
            no-data-text="Aucun palmarès disponible."
            no-results-text="Aucune personne trouvée."
            disable-sort
            hide-default-footer
          >
            <template #[`item.photographe`]="{ item }">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img
                  :src="item.url"
                  style="height: 40px;"
                >
                <span style="font-size: 1.2em">{{ item.username }}</span>

                <!-- Indicateur de variation de rang (uniquement en mode glissant) -->
                <div v-if="mode === 'sliding' && item.rankChange !== null && item.rankChange !== undefined" style="display: flex; align-items: center;">
                  <!-- Montée au classement -->
                  <v-tooltip v-if="item.rankChange < 0" location="top">
                    <template #activator="{ props }">
                      <div v-bind="props" style="display: flex; align-items: center; gap: 4px; padding: 4px 8px; background: #e8f5e9; border-radius: 12px;">
                        <i class="fas fa-arrow-up" style="color: #4caf50; font-size: 0.9em;"></i>
                        <span style="color: #4caf50; font-weight: bold; font-size: 0.85em;">{{ Math.abs(item.rankChange) }}</span>
                      </div>
                    </template>
                    <span>Montée de {{ Math.abs(item.rankChange) }} place{{ Math.abs(item.rankChange) > 1 ? 's' : '' }}</span>
                  </v-tooltip>

                  <!-- Descente au classement -->
                  <v-tooltip v-else-if="item.rankChange > 0" location="top">
                    <template #activator="{ props }">
                      <div v-bind="props" style="display: flex; align-items: center; gap: 4px; padding: 4px 8px; background: #ffebee; border-radius: 12px;">
                        <i class="fas fa-arrow-down" style="color: #f44336; font-size: 0.9em;"></i>
                        <span style="color: #f44336; font-weight: bold; font-size: 0.85em;">{{ item.rankChange }}</span>
                      </div>
                    </template>
                    <span>Descente de {{ item.rankChange }} place{{ item.rankChange > 1 ? 's' : '' }}</span>
                  </v-tooltip>

                  <!-- Position stable -->
                  <v-tooltip v-else location="top">
                    <template #activator="{ props }">
                      <div v-bind="props" style="display: flex; align-items: center; padding: 4px 8px; background: #f5f5f5; border-radius: 12px;">
                        <i class="fas fa-minus" style="color: #9e9e9e; font-size: 0.9em;"></i>
                      </div>
                    </template>
                    <span>Position stable</span>
                  </v-tooltip>
                </div>

                <!-- Badge "Nouveau" -->
                <v-tooltip v-else-if="mode === 'sliding' && item.rankChange === null" location="top">
                  <template #activator="{ props }">
                    <div v-bind="props" style="padding: 4px 8px; background: #fff3e0; border-radius: 12px;">
                      <i class="fas fa-star" style="color: #ff9800; font-size: 0.9em;"></i>
                    </div>
                  </template>
                  <span>Nouveau dans le classement</span>
                </v-tooltip>
              </div>
            </template>

            <template #[`item.awards`]="{ item }">
              <template v-if="item.awards.diamond">
                <i class="fas fa-circle" style="color: #c3f1ff" /> {{ item.awards.diamond }}
              </template>
              <template v-if="item.awards.gold">
                <i class="fas fa-circle" style="color: #c68b00" /> {{ item.awards.gold }}
              </template>
              <template v-if="item.awards.sylver">
                <i class="fas fa-circle" style="color: #9b9b9b" /> {{ item.awards.sylver }}
              </template>
              <template v-if="item.awards.bronze">
                <i class="fas fa-circle" style="color: #964c31" /> {{ item.awards.bronze }}
              </template>
              <template v-if="item.awards.nominated">
                <i class="far fa-circle" /> {{ item.awards.nominated }}
              </template>
              <template v-if="item.awards.honor">
                <i class="far fa-smile" /> {{ item.awards.honor }}
              </template>
            </template>

            <template #[`item.score`]="{ item }">
              <span style="font-weight: bold">{{ item.totalPoints }} </span>
              <template v-if="item.totalPoints > 1">pts</template>
              <template v-else>pt</template>
            </template>

            <template #[`item.participation`]="{ item }">
              <span style="font-weight: bold">{{ item.participation.total }}</span> fois
              <template v-if="item.participation.first != item.participation.last">
                <span style="font-style: italic; opacity: 0.5">(de {{ item.participation.first }} à {{ item.participation.last }})</span>
              </template>
              <template v-else>
                <span style="font-style: italic; opacity: 0.5">(en {{ item.participation.first }})</span>
              </template>
            </template>

            <template #[`item.bestYear`]="{ item }">
              <v-tooltip
                v-if="item.bestYear && item.bestYear.stats && item.bestYear.stats[7] > 0"
                location="right"
              >
                <template #activator="{ props }">
                  <span v-bind="props">{{ item.bestYear.year }}
                    <span style="opacity: 0.5">({{ item.bestYear.stats[6] }} awards - {{ item.bestYear.stats[7] }} pts)</span>
                  </span>
                </template>
                <template v-if="item.bestYear.stats[5]">
                  <i class="fas fa-circle" style="color: #c3f1ff" /> {{ item.bestYear.stats[5] }}
                </template>
                <template v-if="item.bestYear.stats[4]">
                  <i class="fas fa-circle" style="color: #c68b00" /> {{ item.bestYear.stats[4] }}
                </template>
                <template v-if="item.bestYear.stats[3]">
                  <i class="fas fa-circle" style="color: #9b9b9b" /> {{ item.bestYear.stats[3] }}
                </template>
                <template v-if="item.bestYear.stats[2]">
                  <i class="fas fa-circle" style="color: #964c31" /> {{ item.bestYear.stats[2] }}
                </template>
                <template v-if="item.bestYear.stats[0]">
                  <i class="far fa-smile" /> {{ item.bestYear.stats[0] }}
                </template>
              </v-tooltip>
            </template>

            <template #[`item.bestCat`]="{ item }">
              <v-tooltip
                v-if="item.bestCat && item.bestCat.stats && item.bestCat.stats[6] > 0"
                location="right"
              >
                <template #activator="{ props }">
                  <span v-bind="props">{{ item.bestCat.title }}
                    <span style="opacity: 0.5">({{ item.bestCat.stats[5] }} awards - {{ item.bestCat.stats[6] }} pts)</span>
                  </span>
                </template>
                <template v-if="item.bestCat.stats[4]">
                  <i class="fas fa-circle" style="color: #c3f1ff" /> {{ item.bestCat.stats[4] }}
                </template>
                <template v-if="item.bestCat.stats[3]">
                  <i class="fas fa-circle" style="color: #c68b00" /> {{ item.bestCat.stats[3] }}
                </template>
                <template v-if="item.bestCat.stats[2]">
                  <i class="fas fa-circle" style="color: #9b9b9b" /> {{ item.bestCat.stats[2] }}
                </template>
                <template v-if="item.bestCat.stats[1]">
                  <i class="fas fa-circle" style="color: #964c31" /> {{ item.bestCat.stats[1] }}
                </template>
                <template v-if="item.bestCat.stats[0]">
                  <i class="far fa-circle" /> {{ item.bestCat.stats[0] }}
                </template>
              </v-tooltip>
            </template>
          </v-data-table>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          color="primary"
          @click="close"
        >
          Fermer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'PalmaresDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    slidingPalmares: {
      type: Array,
      default: () => []
    },
    globalPalmares: {
      type: Array,
      default: () => []
    },
    slidingYearFrom: {
      type: Number,
      default: null
    },
    slidingYearTo: {
      type: Number,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    initialMode: {
      type: String,
      default: 'sliding'
    }
  },
  data() {
    return {
      mode: 'sliding',
      searchText: '',
      familyFilter: null,
      headers: [
        { title: 'Photographe', key: 'photographe' },
        { title: 'Score', key: 'score' },
        { title: 'Participation', key: 'participation' },
        { title: 'Récompenses', key: 'awards' },
        { title: 'Meilleure année', key: 'bestYear' },
        { title: 'Meilleure catégorie', key: 'bestCat' },
      ],
      familyOptions: [
        { title: 'Gueudelot', value: 'gueudelot' },
        { title: 'Guibert', value: 'guibert' },
        { title: 'Guyomard', value: 'guyomard' },
        { title: 'Autre', value: 'autre' }
      ]
    };
  },
  computed: {
    show: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },
    currentPalmares() {
      return this.mode === 'sliding' ? this.slidingPalmares : this.globalPalmares;
    },
    filteredItems() {
      let result = this.currentPalmares;

      // Filtre par famille
      if (this.familyFilter) {
        result = result.filter(p => {
          const family = (p.rootFamily || 'autre').toLowerCase();
          return family === this.familyFilter.toLowerCase();
        });
      }

      // Filtre par recherche
      if (this.searchText && this.searchText.trim() !== '') {
        const search = this.searchText.toLowerCase();
        result = result.filter(p => {
          return (p.username || '').toLowerCase().includes(search) ||
                 (p.rootFamily || '').toLowerCase().includes(search);
        });
      }

      return result;
    }
  },
  watch: {
    modelValue(newVal) {
      if (newVal) {
        this.mode = this.initialMode;
      }
    }
  },
  methods: {
    close() {
      this.show = false;
    }
  }
};
</script>

<style lang="scss" scoped>
@use '../themes/global.scss' as *;
</style>
