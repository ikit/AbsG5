<template>
  <div class="monitoring-sliding-palmares pa-4">
    <h2>Évolution du palmarès glissant</h2>

    <p class="text-body-2 mb-4 monitoring-sp__description">
      Le palmarès glissant calcule les classements sur une fenêtre de 3 ans.
      Cette vue montre l'évolution des positions au fil des années.
    </p>

    <!-- Sélecteur de fenêtre -->
    <v-card class="mb-4">
      <v-card-text>
        <v-select
          v-model="selectedWindow"
          :items="windowOptions"
          item-title="label"
          item-value="index"
          label="Période"
          density="compact"
          hide-details
          class="monitoring-sp__window-select"
        />
      </v-card-text>
    </v-card>

    <!-- Tableau du classement -->
    <v-card v-if="currentWindow">
      <v-card-title>
        Classement {{ currentWindow.windowStart }} - {{ currentWindow.windowEnd }}
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="currentWindow.rankings"
          density="compact"
          item-value="userId"
        >
          <template #[`item.rank`]="{ item }">
            <strong>{{ item.rank }}</strong>
          </template>

          <template #[`item.username`]="{ item }">
            <div class="d-flex align-center">
              {{ item.username }}
              <v-chip v-if="item.rootFamily" size="x-small" :color="getFamilyColor(item.rootFamily)" class="ml-2">
                {{ item.rootFamily?.substring(0, 2).toUpperCase() }}
              </v-chip>
            </div>
          </template>

          <template #[`item.awards`]="{ item }">
            <div class="d-flex ga-1">
              <template v-if="item.diamonds">
                <v-icon color="cyan-lighten-2" size="x-small">fas fa-circle</v-icon>
                <span class="text-caption mr-1">{{ item.diamonds }}</span>
              </template>
              <template v-if="item.golds">
                <v-icon color="amber-darken-2" size="x-small">fas fa-circle</v-icon>
                <span class="text-caption mr-1">{{ item.golds }}</span>
              </template>
              <template v-if="item.sylvers">
                <v-icon color="grey" size="x-small">fas fa-circle</v-icon>
                <span class="text-caption mr-1">{{ item.sylvers }}</span>
              </template>
              <template v-if="item.bronzes">
                <v-icon color="brown" size="x-small">fas fa-circle</v-icon>
                <span class="text-caption">{{ item.bronzes }}</span>
              </template>
            </div>
          </template>

          <template #[`item.totalPoints`]="{ item }">
            <strong>{{ item.totalPoints }}</strong> pts
          </template>

          <template #[`item.rankChange`]="{ item }">
            <div v-if="item.rankChange !== null" class="d-flex align-center">
              <template v-if="item.rankChange > 0">
                <v-icon color="success" size="small">fas fa-arrow-up</v-icon>
                <span class="text-success ml-1">+{{ item.rankChange }}</span>
              </template>
              <template v-else-if="item.rankChange < 0">
                <v-icon color="error" size="small">fas fa-arrow-down</v-icon>
                <span class="text-error ml-1">{{ item.rankChange }}</span>
              </template>
              <template v-else>
                <span class="monitoring-sp__dash">—</span>
              </template>
            </div>
            <v-chip v-else size="x-small" color="info" variant="tonal">
              NEW
            </v-chip>
          </template>

          <template #[`item.previousRank`]="{ item }">
            <span v-if="item.previousRank !== null" class="monitoring-sp__muted">
              {{ item.previousRank }}
            </span>
            <span v-else>-</span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Graphique d'évolution (optionnel) -->
    <v-card v-if="evolution && evolution.windows && evolution.windows.length > 1" class="mt-4">
      <v-card-title>Évolution des top 5</v-card-title>
      <v-card-text>
        <div class="monitoring-sp__placeholder">
          Graphique d'évolution à venir...
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    evolution: {
      type: Object,
      required: true
    },
    currentYear: {
      type: Number,
      required: true
    }
  },
  data: () => ({
    selectedWindow: null,
    headers: [
      { title: '#', key: 'rank', width: '60px' },
      { title: 'Photographe', key: 'username' },
      { title: 'Récompenses', key: 'awards', sortable: false },
      { title: 'Points', key: 'totalPoints' },
      { title: 'Évolution', key: 'rankChange', sortable: false },
      { title: 'Rang préc.', key: 'previousRank' }
    ]
  }),
  computed: {
    windowOptions() {
      if (!this.evolution?.windows) return [];
      return this.evolution.windows.map((w, index) => ({
        index,
        label: `${w.windowStart} - ${w.windowEnd}`
      })).reverse(); // Plus récent en premier
    },
    currentWindow() {
      if (this.selectedWindow === null || !this.evolution?.windows) return null;
      return this.evolution.windows[this.selectedWindow];
    }
  },
  watch: {
    evolution: {
      handler() {
        // Sélectionner la fenêtre la plus récente par défaut
        if (this.evolution?.windows?.length > 0 && this.selectedWindow === null) {
          this.selectedWindow = this.evolution.windows.length - 1;
        }
      },
      immediate: true
    }
  },
  methods: {
    getFamilyColor(family) {
      const colors = {
        gueudelot: 'blue-lighten-4',
        guibert: 'grey-lighten-1',
        guyomard: 'green-lighten-4'
      };
      return colors[(family || '').toLowerCase()] || 'grey-lighten-3';
    }
  }
};
</script>

<style lang="scss" scoped>
.monitoring-sp__description { opacity: 0.7; }
.monitoring-sp__window-select { max-width: 300px; }
.monitoring-sp__dash { opacity: 0.5; }
.monitoring-sp__muted { opacity: 0.6; }
.monitoring-sp__placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
}
</style>
