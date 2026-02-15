<template>
  <section
    v-if="isAdmin"
    id="content"
  >
    <v-card class="monitoring-main-card">
      <!-- Header compact: édition, algorithme, phase sur une ligne -->
      <div class="monitoring-header d-flex align-center ga-3 pa-3 flex-wrap">
        <!-- Sélecteur d'édition -->
        <v-select
          v-model="selectedYear"
          :items="editionsList"
          item-title="label"
          item-value="year"
          label="Édition"
          density="compact"
          hide-details
          variant="outlined"
          class="monitoring-select-edition"
          @update:model-value="onEditionChange"
        />

        <!-- Sélecteur d'algorithme -->
        <v-select
          v-model="selectedAlgorithm"
          :items="algorithmOptions"
          item-title="title"
          item-value="value"
          label="Algo"
          density="compact"
          hide-details
          variant="outlined"
          class="monitoring-select-algo"
          @update:model-value="onAlgorithmChange"
        />

        <v-divider v-if="!$vuetify.display.mobile" vertical class="mx-2" />

        <!-- Indicateur de phase compact -->
        <div v-if="editionPhase" class="d-flex align-center ga-1">
          <span class="text-caption mr-1 monitoring-phase-label">Phase:</span>
          <v-chip
            v-for="phase in phaseItems"
            :key="phase.value"
            :color="editionPhase >= phase.value ? 'primary' : 'grey-lighten-2'"
            :variant="editionPhase === phase.value ? 'flat' : 'tonal'"
            size="x-small"
            :title="phase.title"
          >
            {{ phase.value }}
          </v-chip>
        </div>
      </div>

      <!-- Onglets -->
      <v-tabs
        v-model="currentTab"
        :show-arrows="$vuetify.display.mobile"
        :touch="false"
        :stacked="$vuetify.display.mobile"
      >
        <v-tab value="photos">
          <v-icon :start="!$vuetify.display.mobile">far fa-image</v-icon>
          <span v-if="!$vuetify.display.mobile">Photos</span>
        </v-tab>
        <v-tab value="votes">
          <v-icon :start="!$vuetify.display.mobile">fas fa-vote-yea</v-icon>
          <span v-if="!$vuetify.display.mobile">Votes</span>
        </v-tab>
        <v-tab value="scores">
          <v-icon :start="!$vuetify.display.mobile">fas fa-calculator</v-icon>
          <span v-if="!$vuetify.display.mobile">Calculs V2026</span>
        </v-tab>
        <v-tab value="palmares">
          <v-icon :start="!$vuetify.display.mobile">fas fa-trophy</v-icon>
          <span v-if="!$vuetify.display.mobile">Palmarès</span>
        </v-tab>
        <v-tab value="sliding">
          <v-icon :start="!$vuetify.display.mobile">fas fa-chart-line</v-icon>
          <span v-if="!$vuetify.display.mobile">Glissant</span>
        </v-tab>
        <v-tab value="stats">
          <v-icon :start="!$vuetify.display.mobile">fas fa-chart-pie</v-icon>
          <span v-if="!$vuetify.display.mobile">Stats</span>
        </v-tab>
        <v-tab value="badges">
          <v-icon :start="!$vuetify.display.mobile">fas fa-award</v-icon>
          <span v-if="!$vuetify.display.mobile">Badges</span>
        </v-tab>
      </v-tabs>

      <!-- Contenu des onglets -->
      <v-window v-model="currentTab" :touch="false">
        <!-- Onglet Photos -->
        <v-window-item value="photos">
          <MonitoringPhotos
            v-if="monitoringData"
            :data="monitoringData"
            :year="selectedYear"
            @refresh="loadMonitoringData"
          />
        </v-window-item>

        <!-- Onglet Votes -->
        <v-window-item value="votes">
          <MonitoringVotes
            v-if="monitoringData"
            :data="monitoringData"
            :year="selectedYear"
          />
        </v-window-item>

        <!-- Onglet Calculs V2026 -->
        <v-window-item value="scores">
          <MonitoringScores
            v-if="v2026Steps"
            :steps="v2026Steps"
            :monitoring-data="monitoringData"
            :year="selectedYear"
            :algorithm="selectedAlgorithm"
          />
          <div v-else class="pa-4 text-center">
            <v-progress-circular indeterminate color="primary" />
            <div class="mt-2">Chargement des données de calcul...</div>
          </div>
        </v-window-item>

        <!-- Onglet Palmarès -->
        <v-window-item value="palmares">
          <MonitoringPalmares
            v-if="monitoringData"
            :data="monitoringData"
            :year="selectedYear"
            :algorithm="selectedAlgorithm"
          />
        </v-window-item>

        <!-- Onglet Palmarès Glissant -->
        <v-window-item value="sliding">
          <MonitoringSlidingPalmares
            v-if="slidingEvolution"
            :evolution="slidingEvolution"
            :current-year="selectedYear"
          />
          <div v-else class="pa-4 text-center">
            <v-progress-circular indeterminate color="primary" />
            <div class="mt-2">Chargement de l'évolution du palmarès...</div>
          </div>
        </v-window-item>

        <!-- Onglet Stats -->
        <v-window-item value="stats">
          <MonitoringStats
            v-if="monitoringData"
            :data="monitoringData"
            :year="selectedYear"
          />
        </v-window-item>

        <!-- Onglet Badges -->
        <v-window-item value="badges">
          <MonitoringBadges
            :year="selectedYear"
          />
        </v-window-item>
      </v-window>
    </v-card>
  </section>

  <section v-else>
    <div class="monitoring-access-denied">
      Accès réservé aux administrateurs
    </div>
  </section>
</template>

<script>
import axios from 'axios';
import { mapState } from '../../../stores/helpers';
import { parseAxiosResponse } from '../../../middleware/CommonHelper';
import store from '../../../stores/helpers';

// Import des composants enfants
import MonitoringPhotos from './components/MonitoringPhotos.vue';
import MonitoringVotes from './components/MonitoringVotes.vue';
import MonitoringScores from './components/MonitoringScores.vue';
import MonitoringPalmares from './components/MonitoringPalmares.vue';
import MonitoringSlidingPalmares from './components/MonitoringSlidingPalmares.vue';
import MonitoringStats from './components/MonitoringStats.vue';
import MonitoringBadges from './components/MonitoringBadges.vue';

export default {
  components: {
    MonitoringPhotos,
    MonitoringVotes,
    MonitoringScores,
    MonitoringPalmares,
    MonitoringSlidingPalmares,
    MonitoringStats,
    MonitoringBadges
  },
  store,
  data: () => ({
    isAdmin: false,
    isLoading: false,
    currentTab: 'photos',

    // Sélection d'édition
    selectedYear: null,
    editionsList: [],

    // Sélection d'algorithme
    selectedAlgorithm: 'V2026',
    algorithmOptions: [
      { title: 'V2026 (Familles)', value: 'V2026' },
      { title: 'V2010 (Classique)', value: 'V2010' }
    ],

    // Phase de l'édition
    editionPhase: null,
    phaseItems: [
      { title: 'Soumission', value: 1 },
      { title: 'Validation', value: 2 },
      { title: 'Votes', value: 3 },
      { title: 'Calcul', value: 4 },
      { title: 'Cérémonie', value: 5 }
    ],

    // Données
    monitoringData: null,
    v2026Steps: null,
    slidingEvolution: null,
    votesByVoter: null
  }),
  computed: {
    ...mapState([
      'agpaMeta',
      'user'
    ])
  },
  watch: {
    agpaMeta: {
      handler() {
        if (this.agpaMeta && !this.selectedYear) {
          this.selectedYear = this.agpaMeta.year;
          this.loadEditionsList();
        }
      },
      immediate: true
    },
    currentTab(newTab) {
      // Charger les données spécifiques à l'onglet si nécessaire
      if (newTab === 'scores' && !this.v2026Steps) {
        this.loadV2026Steps();
      }
      if (newTab === 'sliding' && !this.slidingEvolution) {
        this.loadSlidingEvolution();
      }
    }
  },
  mounted() {
    this.isAdmin = this.user?.roles?.indexOf("admin") > -1;
    if (this.agpaMeta) {
      this.selectedYear = this.agpaMeta.year;
      this.loadEditionsList();
    } else {
      store.dispatch('initAGPA');
    }
  },
  methods: {
    async loadEditionsList() {
      try {
        const response = await axios.get('/api/agpa/editions');
        const data = parseAxiosResponse(response);
        if (data && data.editions) {
          this.editionsList = data.editions.map(e => ({
            year: e.year,
            label: `${e.year} (${e.totalPhotos} photos)`,
            phase: e.phase,
            hasAwards: e.hasAwards
          }));

          // Définir la phase de l'édition sélectionnée
          const currentEdition = this.editionsList.find(e => e.year === this.selectedYear);
          if (currentEdition) {
            this.editionPhase = currentEdition.phase;
          }

          // Charger les données de monitoring
          this.loadMonitoringData();
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la liste des éditions:', error);
      }
    },

    async loadMonitoringData() {
      if (!this.selectedYear) return;

      this.isLoading = true;
      try {
        const response = await axios.get(`/api/agpa/monitoring/${this.selectedYear}/${this.selectedAlgorithm}`);
        this.monitoringData = parseAxiosResponse(response);

        // Charger les données V2026 si on est sur cet onglet
        if (this.currentTab === 'scores') {
          await this.loadV2026Steps();
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de monitoring:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async loadV2026Steps() {
      if (!this.selectedYear) return;

      try {
        const response = await axios.get(`/api/agpa/monitoring/${this.selectedYear}/v2026-steps`);
        this.v2026Steps = parseAxiosResponse(response);
      } catch (error) {
        console.error('Erreur lors du chargement des étapes V2026:', error);
      }
    },

    async loadSlidingEvolution() {
      try {
        const response = await axios.get('/api/agpa/palmares/sliding-evolution');
        this.slidingEvolution = parseAxiosResponse(response);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'évolution du palmarès glissant:', error);
      }
    },

    async loadVotesByVoter() {
      if (!this.selectedYear) return;

      try {
        const response = await axios.get(`/api/agpa/monitoring/${this.selectedYear}/votes-by-voter`);
        this.votesByVoter = parseAxiosResponse(response);
      } catch (error) {
        console.error('Erreur lors du chargement des votes par votant:', error);
      }
    },

    onEditionChange(year) {
      this.selectedYear = year;

      // Mettre à jour la phase
      const edition = this.editionsList.find(e => e.year === year);
      if (edition) {
        this.editionPhase = edition.phase;
      }

      // Recharger les données
      this.monitoringData = null;
      this.v2026Steps = null;
      this.loadMonitoringData();
    },

    onAlgorithmChange() {
      this.loadMonitoringData();
    }
  }
};
</script>

<style lang="scss" scoped>
.monitoring-main-card {
  margin: 24px;
}

.monitoring-header {
  background: rgba(var(--v-theme-on-surface), 0.03);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.monitoring-select-edition {
  max-width: 160px;
  min-width: 130px;
}

.monitoring-select-algo {
  max-width: 150px;
  min-width: 120px;
}

.monitoring-phase-label {
  opacity: 0.7;
}

.monitoring-access-denied {
  text-align: center;
  margin-top: 20px;
}
</style>
