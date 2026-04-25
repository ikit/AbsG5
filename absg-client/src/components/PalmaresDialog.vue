<template>
  <v-dialog
    v-model="show"
    max-width="1200px"
    scrollable
  >
    <v-card>
      <v-card-title class="palmares-dialog__title">
        <v-icon start color="white">fas fa-trophy</v-icon>
        Palmarès Complet
      </v-card-title>

      <v-card-text class="palmares-dialog__content">
        <!-- Filtres et toggle en une seule ligne -->
        <div class="palmares-dialog__filters">
          <v-text-field
            v-model="searchText"
            prepend-icon="fas fa-search"
            label="Rechercher"
            single-line
            hide-details
            density="comfortable"
            class="palmares-dialog__search"
          />
          <v-select
            v-model="familyFilter"
            :items="familyOptions"
            label="Filtrer par famille"
            clearable
            hide-details
            density="comfortable"
            class="palmares-dialog__family-select"
          />
          <!-- Sélecteur de période glissante -->
          <v-menu
            v-model="showPeriodMenu"
            :close-on-content-click="false"
            location="bottom"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                size="small"
                variant="flat"
                color="primary"
                :disabled="mode !== 'sliding'"
              >
                <v-icon start size="small">fas fa-calendar-alt</v-icon>
                <span v-if="slidingYearFrom && slidingYearTo">
                  {{ slidingYearFrom }}-{{ slidingYearTo }}
                </span>
                <span v-else>Période</span>
                <v-icon end size="x-small">fas fa-caret-down</v-icon>
              </v-btn>
            </template>
            <v-card class="palmares-dialog__period-card">
              <div class="palmares-dialog__period-label">Période glissante (3 ans)</div>
              <v-slider
                v-model="localSliderYear"
                :min="sliderMin"
                :max="sliderMax"
                :step="1"
                show-ticks="always"
                thumb-label="always"
                color="primary"
                hide-details
                @end="onSliderEnd"
              >
                <template #thumb-label="{ modelValue }">
                  {{ modelValue - 2 }}-{{ modelValue }}
                </template>
              </v-slider>
              <div class="palmares-dialog__period-range">
                <span>{{ sliderMin - 2 }}</span>
                <span>{{ sliderMax }}</span>
              </div>
            </v-card>
          </v-menu>

          <v-btn-toggle
            v-model="mode"
            mandatory
            color="primary"
            density="comfortable"
            class="palmares-dialog__mode-toggle"
          >
            <v-btn value="sliding" size="small">
              <v-icon start size="small">fas fa-chart-line</v-icon>
              Glissant
            </v-btn>
            <v-btn value="global" size="small">
              <v-icon start size="small">fas fa-history</v-icon>
              Global
            </v-btn>
          </v-btn-toggle>
        </div>

        <!-- Tableau avec scroll -->
        <div class="palmares-dialog__table-container">
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
              <div class="palmares-dialog__photographer">
                <img :src="item.url" class="palmares-dialog__avatar" :alt="item.username">
                <span class="palmares-dialog__username">{{ item.username }}</span>

                <!-- Indicateur de variation de rang (uniquement en mode glissant) -->
                <div v-if="mode === 'sliding' && item.rankChange !== null && item.rankChange !== undefined" class="palmares-dialog__rank-change">
                  <!-- Montée au classement -->
                  <v-tooltip v-if="item.rankChange < 0" location="top">
                    <template #activator="{ props }">
                      <div v-bind="props" class="palmares-dialog__rank-badge palmares-dialog__rank-badge--up">
                        <i class="fas fa-arrow-up"></i>
                        <span>{{ Math.abs(item.rankChange) }}</span>
                      </div>
                    </template>
                    <span>Montée de {{ Math.abs(item.rankChange) }} place{{ Math.abs(item.rankChange) > 1 ? 's' : '' }}</span>
                  </v-tooltip>

                  <!-- Descente au classement -->
                  <v-tooltip v-else-if="item.rankChange > 0" location="top">
                    <template #activator="{ props }">
                      <div v-bind="props" class="palmares-dialog__rank-badge palmares-dialog__rank-badge--down">
                        <i class="fas fa-arrow-down"></i>
                        <span>{{ item.rankChange }}</span>
                      </div>
                    </template>
                    <span>Descente de {{ item.rankChange }} place{{ item.rankChange > 1 ? 's' : '' }}</span>
                  </v-tooltip>

                  <!-- Position stable -->
                  <v-tooltip v-else location="top">
                    <template #activator="{ props }">
                      <div v-bind="props" class="palmares-dialog__rank-badge palmares-dialog__rank-badge--stable">
                        <i class="fas fa-minus"></i>
                      </div>
                    </template>
                    <span>Position stable</span>
                  </v-tooltip>
                </div>

                <!-- Badge "Nouveau" -->
                <v-tooltip v-else-if="mode === 'sliding' && item.rankChange === null" location="top">
                  <template #activator="{ props }">
                    <div v-bind="props" class="palmares-dialog__rank-badge palmares-dialog__rank-badge--new">
                      <i class="fas fa-star"></i>
                    </div>
                  </template>
                  <span>Nouveau dans le classement</span>
                </v-tooltip>
              </div>
            </template>

            <template #[`item.awards`]="{ item }">
              <AwardBadges :awards="item.awards" />
            </template>

            <template #[`item.score`]="{ item }">
              <span class="palmares-dialog__score">{{ item.totalPoints }} </span>
              <template v-if="item.totalPoints > 1">pts</template>
              <template v-else>pt</template>
            </template>

            <template #[`item.bestYear`]="{ item }">
              <v-tooltip
                v-if="item.bestYear && item.bestYear.stats && item.bestYear.stats[7] > 0"
                location="right"
              >
                <template #activator="{ props }">
                  <span v-bind="props">{{ item.bestYear.year }}
                    <span class="palmares-dialog__muted">({{ item.bestYear.stats[6] }} awards - {{ item.bestYear.stats[7] }} pts)</span>
                  </span>
                </template>
                <template v-if="item.bestYear.stats[5]">
                  <i class="fas fa-circle award-diamond" /> {{ item.bestYear.stats[5] }}
                </template>
                <template v-if="item.bestYear.stats[4]">
                  <i class="fas fa-circle award-gold" /> {{ item.bestYear.stats[4] }}
                </template>
                <template v-if="item.bestYear.stats[3]">
                  <i class="fas fa-circle award-silver" /> {{ item.bestYear.stats[3] }}
                </template>
                <template v-if="item.bestYear.stats[2]">
                  <i class="fas fa-circle award-bronze" /> {{ item.bestYear.stats[2] }}
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
                    <span class="palmares-dialog__muted">({{ item.bestCat.stats[5] }} awards - {{ item.bestCat.stats[6] }} pts)</span>
                  </span>
                </template>
                <template v-if="item.bestCat.stats[4]">
                  <i class="fas fa-circle award-diamond" /> {{ item.bestCat.stats[4] }}
                </template>
                <template v-if="item.bestCat.stats[3]">
                  <i class="fas fa-circle award-gold" /> {{ item.bestCat.stats[3] }}
                </template>
                <template v-if="item.bestCat.stats[2]">
                  <i class="fas fa-circle award-silver" /> {{ item.bestCat.stats[2] }}
                </template>
                <template v-if="item.bestCat.stats[1]">
                  <i class="fas fa-circle award-bronze" /> {{ item.bestCat.stats[1] }}
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
import AwardBadges from './AwardBadges.vue';

export default {
  name: 'PalmaresDialog',
  components: { AwardBadges },
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
    },
    sliderMin: {
      type: Number,
      default: 2008
    },
    sliderMax: {
      type: Number,
      default: () => new Date().getFullYear()
    }
  },
  emits: ['update:modelValue', 'update:slidingPeriod'],
  data() {
    return {
      mode: 'sliding',
      searchText: '',
      familyFilter: null,
      showPeriodMenu: false,
      localSliderYear: null,
      headers: [
        { title: 'Photographe', key: 'photographe' },
        { title: 'Score', key: 'score' },
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
        this.localSliderYear = this.slidingYearTo || this.sliderMax;
      }
    }
  },
  methods: {
    close() {
      this.show = false;
    },
    onSliderEnd(value) {
      this.$emit('update:slidingPeriod', { from: value - 2, to: value });
    }
  }
};
</script>

<style lang="scss" scoped>
.palmares-dialog {
  &__title {
    background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
    color: white;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  &__content {
    padding: 20px;
  }

  &__filters {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    align-items: center;
  }

  &__search {
    flex: 1;
    min-width: 250px;
  }

  &__family-select {
    flex: 0 0 200px;
    min-width: 200px;
  }

  &__mode-toggle {
    flex: 0 0 auto;
  }

  &__period-card {
    min-width: 320px;
    padding: 16px 24px 8px;

    :deep(.v-slider-thumb__label) {
      color: white !important;
    }
  }

  &__period-label {
    font-size: 0.85em;
    opacity: 0.6;
    margin-bottom: 4px;
  }

  &__period-range {
    display: flex;
    justify-content: space-between;
    font-size: 0.75em;
    opacity: 0.4;
    margin-top: -4px;
    padding: 0 2px;
  }

  &__table-container {
    max-height: 500px;
    overflow-y: auto;
  }

  &__photographer {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__avatar {
    height: 40px;
    border-radius: 4px;
  }

  &__username {
    font-size: 1.2em;
  }

  &__rank-change {
    display: flex;
    align-items: center;
  }

  &__rank-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.85em;

    &--up {
      background: rgba(var(--v-theme-success), 0.15);
      color: rgb(var(--v-theme-success));
      font-weight: bold;
    }

    &--down {
      background: rgba(var(--v-theme-error), 0.15);
      color: rgb(var(--v-theme-error));
      font-weight: bold;
    }

    &--stable {
      background: rgba(var(--v-theme-on-surface), 0.08);
      color: rgba(var(--v-theme-on-surface), 0.5);
    }

    &--new {
      background: rgba(var(--v-theme-warning), 0.15);
      color: rgb(var(--v-theme-warning));
    }
  }

  &__score {
    font-weight: bold;
  }

  &__muted {
    font-style: italic;
    opacity: 0.5;
  }
}

// Couleurs des récompenses AGPA : définies globalement dans themes/global.scss
// Classes: .award-diamond, .award-gold, .award-silver, .award-bronze
</style>
