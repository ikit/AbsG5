<template>
  <div class="monitoring-scores pa-4">
    <div class="d-flex align-center flex-wrap ga-3 mb-4">
      <h2 class="flex-grow-1">Calcul des notes V2026</h2>

      <!-- Filtres -->
      <v-text-field
        v-model="searchFilter"
        prepend-icon="fas fa-search"
        label="Rechercher"
        single-line
        hide-details
        density="compact"
        style="max-width: 250px; min-width: 200px;"
      />
      <v-select
        v-model="selectedCategory"
        :items="categoryOptions"
        item-title="label"
        item-value="id"
        label="Catégorie"
        density="compact"
        hide-details
        style="max-width: 200px; min-width: 180px;"
      />
    </div>

    <!-- Explication de l'algorithme V2026 -->
    <v-expansion-panels class="mb-4">
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-icon start>fas fa-info-circle</v-icon>
          Comment fonctionne l'algorithme V2026 ?
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="text-body-2">
            <p class="mb-2"><strong>Principe :</strong> Chaque photo est classée indépendamment par chaque famille (Gueudelot, Guibert, Guyomard). Le score final est basé sur la moyenne des rangs obtenus.</p>

            <ol class="mb-2">
              <li><strong>Étape 1 - Collecte :</strong> Les votes sont comptabilisés par famille pour chaque photo.</li>
              <li><strong>Étape 2 - Rangs :</strong> Dans chaque catégorie, les photos sont classées par points pour chaque famille.</li>
              <li><strong>Étape 3 - Moyenne :</strong> Le rang moyen est calculé à partir des 3 rangs famille.</li>
              <li><strong>Étape 4 - Score :</strong> Le rang moyen est converti en score 0-100 (100 = meilleur).</li>
              <li><strong>Étape 5 - Attribution :</strong> Les AGPA sont attribués selon le classement final.</li>
            </ol>

            <p><strong>Règles de départage :</strong> Titre présent > Catégorie plus peuplée > Plus de votes > Palmarès plus petit</p>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Tableau des scores par catégorie -->
    <template v-if="selectedCategory">
      <v-card class="mb-4">
        <v-card-title>
          {{ getCategoryName(selectedCategory) }}
          <span class="text-body-2 ml-2" style="opacity: 0.6;">
            ({{ getCategoryPhotoCount(selectedCategory) }} photos)
          </span>
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="tableHeaders"
            :items="filteredPhotos"
            :search="searchFilter"
            density="compact"
            item-value="photoId"
          >
            <template #[`item.rank`]="{ item, index }">
              <span class="font-weight-bold">{{ item.rankInCategory || index + 1 }}</span>
            </template>

            <template #[`item.photo`]="{ item }">
              <div class="d-flex align-center">
                <span style="opacity: 0.5; margin-right: 8px;">({{ item.photoId }})</span>
                {{ item.title }}
              </div>
            </template>

            <template #[`item.author`]="{ item }">
              <div>
                {{ item.authorName }}
                <v-chip size="x-small" :color="getFamilyColor(item.authorFamily)" class="ml-1">
                  {{ item.authorFamily?.substring(0, 2).toUpperCase() }}
                </v-chip>
              </div>
            </template>

            <template #[`item.familyRanks`]="{ item }">
              <div class="d-flex ga-1">
                <v-tooltip location="bottom">
                  <template #activator="{ props }">
                    <v-chip
                      v-bind="props"
                      size="x-small"
                      :color="item.families.gueudelot?.rank === 1 ? 'blue' : 'grey-lighten-2'"
                      :text-color="item.families.gueudelot?.rank === 1 ? 'white' : 'black'"
                    >
                      G: {{ item.families.gueudelot?.rank || '-' }}
                    </v-chip>
                  </template>
                  <span>
                    Gueudelot: {{ item.families.gueudelot?.points || 0 }} pts
                    ({{ item.families.gueudelot?.votes || 0 }} votes)
                  </span>
                </v-tooltip>

                <v-tooltip location="bottom">
                  <template #activator="{ props }">
                    <v-chip
                      v-bind="props"
                      size="x-small"
                      :color="item.families.guibert?.rank === 1 ? 'grey-darken-2' : 'grey-lighten-2'"
                      :text-color="item.families.guibert?.rank === 1 ? 'white' : 'black'"
                    >
                      B: {{ item.families.guibert?.rank || '-' }}
                    </v-chip>
                  </template>
                  <span>
                    Guibert: {{ item.families.guibert?.points || 0 }} pts
                    ({{ item.families.guibert?.votes || 0 }} votes)
                  </span>
                </v-tooltip>

                <v-tooltip location="bottom">
                  <template #activator="{ props }">
                    <v-chip
                      v-bind="props"
                      size="x-small"
                      :color="item.families.guyomard?.rank === 1 ? 'green-lighten-1' : 'grey-lighten-2'"
                      :text-color="item.families.guyomard?.rank === 1 ? 'white' : 'black'"
                    >
                      Y: {{ item.families.guyomard?.rank || '-' }}
                    </v-chip>
                  </template>
                  <span>
                    Guyomard: {{ item.families.guyomard?.points || 0 }} pts
                    ({{ item.families.guyomard?.votes || 0 }} votes)
                  </span>
                </v-tooltip>
              </div>
            </template>

            <template #[`item.avgRank`]="{ item }">
              {{ item.avgRank?.toFixed(2) || '-' }}
            </template>

            <template #[`item.scoreV2026`]="{ item }">
              <strong>{{ item.scoreV2026 }}</strong>
            </template>

            <template #[`item.award`]="{ item }">
              <v-icon
                v-if="item.award === 'diamond'"
                color="cyan-lighten-2"
                size="small"
              >fas fa-circle</v-icon>
              <v-icon
                v-else-if="item.award === 'gold'"
                color="amber-darken-2"
                size="small"
              >fas fa-circle</v-icon>
              <v-icon
                v-else-if="item.award === 'sylver'"
                color="grey"
                size="small"
              >fas fa-circle</v-icon>
              <v-icon
                v-else-if="item.award === 'bronze'"
                color="brown"
                size="small"
              >fas fa-circle</v-icon>
              <v-icon
                v-else-if="item.award === 'nominated'"
                color="grey"
                size="small"
              >far fa-circle</v-icon>
              <span v-else>-</span>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </template>

    <!-- Classement global -->
    <v-card v-else>
      <v-card-title>Classement global V2026</v-card-title>
      <v-card-text>
        <v-data-table
          :headers="globalHeaders"
          :items="globalRanking"
          :search="searchFilter"
          density="compact"
          item-value="photoId"
        >
          <template #[`item.rank`]="{ item }">
            <strong>{{ item.rank }}</strong>
          </template>

          <template #[`item.photo`]="{ item }">
            <div class="d-flex align-center">
              <span style="opacity: 0.5; margin-right: 8px;">({{ item.photoId }})</span>
              {{ item.title }}
            </div>
          </template>

          <template #[`item.category`]="{ item }">
            {{ item.categoryName }}
          </template>

          <template #[`item.author`]="{ item }">
            {{ item.authorName }}
          </template>

          <template #[`item.avgRank`]="{ item }">
            {{ item.avgRank?.toFixed(2) || '-' }}
          </template>

          <template #[`item.scoreV2026`]="{ item }">
            <strong>{{ item.scoreV2026 }}</strong>
          </template>

          <template #[`item.award`]="{ item }">
            <v-icon
              v-if="item.award === 'diamond'"
              color="cyan-lighten-2"
              size="small"
            >fas fa-circle</v-icon>
            <v-icon
              v-else-if="item.award === 'gold'"
              color="amber-darken-2"
              size="small"
            >fas fa-circle</v-icon>
            <v-icon
              v-else-if="item.award === 'sylver'"
              color="grey"
              size="small"
            >fas fa-circle</v-icon>
            <v-icon
              v-else-if="item.award === 'bronze'"
              color="brown"
              size="small"
            >fas fa-circle</v-icon>
            <v-icon
              v-else-if="item.award === 'nominated'"
              color="grey"
              size="small"
            >far fa-circle</v-icon>
            <span v-else>-</span>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    steps: {
      type: Object,
      required: true
    },
    monitoringData: {
      type: Object,
      default: null
    },
    year: {
      type: Number,
      required: true
    },
    algorithm: {
      type: String,
      default: 'V2026'
    }
  },
  data: () => ({
    searchFilter: '',
    selectedCategory: null,
    tableHeaders: [
      { title: '#', key: 'rank', width: '50px' },
      { title: 'Photo', key: 'photo' },
      { title: 'Auteur', key: 'author' },
      { title: 'Rangs Familles', key: 'familyRanks', sortable: false },
      { title: 'Rang Moy.', key: 'avgRank' },
      { title: 'Score', key: 'scoreV2026' },
      { title: 'AGPA', key: 'award', width: '80px' }
    ],
    globalHeaders: [
      { title: '#', key: 'rank', width: '50px' },
      { title: 'Photo', key: 'photo' },
      { title: 'Catégorie', key: 'category' },
      { title: 'Auteur', key: 'author' },
      { title: 'Rang Moy.', key: 'avgRank' },
      { title: 'Score', key: 'scoreV2026' },
      { title: 'AGPA', key: 'award', width: '80px' }
    ]
  }),
  computed: {
    categoryOptions() {
      const options = [{ id: null, label: 'Classement global' }];
      if (this.steps && this.steps.categories) {
        for (const catId in this.steps.categories) {
          const cat = this.steps.categories[catId];
          options.push({
            id: parseInt(catId),
            label: `${cat.categoryName} (${cat.totalPhotos})`
          });
        }
      }
      return options;
    },
    filteredPhotos() {
      if (!this.selectedCategory || !this.steps?.categories?.[this.selectedCategory]) {
        return [];
      }
      return this.steps.categories[this.selectedCategory].photos || [];
    },
    globalRanking() {
      return this.steps?.globalRanking || [];
    }
  },
  methods: {
    getCategoryName(catId) {
      return this.steps?.categories?.[catId]?.categoryName || `Catégorie ${catId}`;
    },
    getCategoryPhotoCount(catId) {
      return this.steps?.categories?.[catId]?.totalPhotos || 0;
    },
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
