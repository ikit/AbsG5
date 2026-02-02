<template>
  <div class="monitoring-badges pa-4">
    <h2>Gestion des Badges</h2>

    <v-card class="mb-4">
      <v-card-title>
        <v-icon start color="primary">fas fa-calculator</v-icon>
        Recalcul des Badges
      </v-card-title>
      <v-card-text>
        <v-alert type="info" variant="tonal" class="mb-4">
          <div class="text-body-2">
            <strong>Information:</strong> Cette action va supprimer tous les badges existants pour l'année sélectionnée
            et les recalculer pour tous les utilisateurs en se basant sur les profils de votes et les statistiques disponibles.
          </div>
        </v-alert>

        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedYear"
              :items="availableYears"
              label="Année à recalculer"
              density="comfortable"
              prepend-icon="fas fa-calendar"
            />
          </v-col>
          <v-col cols="12" md="8" class="d-flex align-center ga-3">
            <v-btn
              color="primary"
              :loading="isComputing"
              :disabled="!selectedYear || isComputing"
              @click="computeBadges"
            >
              <v-icon start>fas fa-sync</v-icon>
              Lancer le calcul
            </v-btn>

            <div v-if="isComputing" class="d-flex align-center ga-2">
              <v-progress-circular indeterminate color="primary" size="20" />
              <span class="text-body-2" style="color: #666;">Calcul en cours...</span>
            </div>
          </v-col>
        </v-row>

        <!-- Résultat du calcul -->
        <v-alert
          v-if="result"
          :type="result.success ? 'success' : 'error'"
          variant="tonal"
          class="mt-4"
          closable
          @click:close="result = null"
        >
          <div class="text-body-2">
            <div class="font-weight-bold mb-2">{{ result.message }}</div>

            <div v-if="result.success" class="d-flex flex-wrap ga-4 mt-2">
              <div>
                <v-icon size="small" color="warning" class="mr-1">fas fa-trash</v-icon>
                <strong>Supprimés:</strong> {{ result.deletedCount }}
              </div>
              <div>
                <v-icon size="small" color="success" class="mr-1">fas fa-plus-circle</v-icon>
                <strong>Créés:</strong> {{ result.createdCount }}
              </div>
              <div>
                <v-icon size="small" color="info" class="mr-1">fas fa-users</v-icon>
                <strong>Utilisateurs:</strong> {{ result.processedUsers }}
              </div>
              <div>
                <v-icon size="small" color="purple" class="mr-1">fas fa-clock</v-icon>
                <strong>Durée:</strong> {{ (result.duration / 1000).toFixed(2) }}s
              </div>
            </div>

            <div v-if="result.errors && result.errors.length > 0" class="mt-3">
              <div class="font-weight-bold text-error mb-1">
                <v-icon size="small">fas fa-exclamation-triangle</v-icon> Erreurs détectées:
              </div>
              <ul class="pl-4">
                <li v-for="(error, idx) in result.errors" :key="idx" class="text-caption">
                  {{ error }}
                </li>
              </ul>
            </div>
          </div>
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Section recalcul global -->
    <v-card>
      <v-card-title>
        <v-icon start color="warning">fas fa-sync-alt</v-icon>
        Recalcul global des éditions
      </v-card-title>
      <v-card-text>
        <v-alert type="warning" variant="tonal" class="mb-4">
          <div class="text-body-2">
            <strong>Attention:</strong> Cette action recalcule les scores, awards et badges pour plusieurs éditions.
            C'est une opération longue qui peut prendre plusieurs minutes.
          </div>
        </v-alert>

        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model.number="recalcFromYear"
              label="Année de début"
              type="number"
              density="comfortable"
              min="2006"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model.number="recalcToYear"
              label="Année de fin"
              type="number"
              density="comfortable"
              :max="currentYear"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="recalcAlgorithm"
              :items="algorithmOptions"
              item-title="title"
              item-value="value"
              label="Algorithme"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" md="3" class="d-flex align-center">
            <v-btn
              color="warning"
              :loading="isRecalculating"
              :disabled="isRecalculating"
              @click="recalculateAll"
            >
              <v-icon start>fas fa-calculator</v-icon>
              Recalculer tout
            </v-btn>
          </v-col>
        </v-row>

        <!-- Résultat du recalcul global -->
        <v-alert
          v-if="recalcResult"
          :type="recalcResult.summary.yearsFailed === 0 ? 'success' : 'warning'"
          variant="tonal"
          class="mt-4"
          closable
          @click:close="recalcResult = null"
        >
          <div class="text-body-2">
            <div class="font-weight-bold mb-2">
              Recalcul terminé: {{ recalcResult.summary.yearsSuccess }}/{{ recalcResult.summary.yearsProcessed }} années réussies
            </div>

            <div class="d-flex flex-wrap ga-4 mt-2">
              <div>
                <strong>Photos:</strong> {{ recalcResult.summary.totalPhotosUpdated }}
              </div>
              <div>
                <strong>Awards supprimés:</strong> {{ recalcResult.summary.totalAwardsDeleted }}
              </div>
              <div>
                <strong>Awards créés:</strong> {{ recalcResult.summary.totalAwardsCreated }}
              </div>
              <div>
                <strong>Badges:</strong> {{ recalcResult.summary.totalBadgesCreated }}
              </div>
            </div>
          </div>
        </v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import axios from 'axios';
import { parseAxiosResponse } from '../../../../middleware/CommonHelper';

export default {
  props: {
    year: {
      type: Number,
      required: true
    }
  },
  data: () => ({
    selectedYear: null,
    availableYears: [],
    isComputing: false,
    result: null,

    // Recalcul global
    recalcFromYear: 2006,
    recalcToYear: new Date().getFullYear(),
    recalcAlgorithm: 'V2026',
    isRecalculating: false,
    recalcResult: null,

    currentYear: new Date().getFullYear(),
    algorithmOptions: [
      { title: 'V2026 (Familles)', value: 'V2026' },
      { title: 'V2010 (Classique)', value: 'V2010' }
    ]
  }),
  mounted() {
    // Initialiser les années disponibles
    for (let y = 2006; y <= this.currentYear; y++) {
      this.availableYears.push(y);
    }
    this.selectedYear = this.year || this.currentYear;
    this.recalcToYear = this.currentYear;
  },
  methods: {
    async computeBadges() {
      if (!this.selectedYear) return;

      this.isComputing = true;
      this.result = null;

      try {
        const response = await axios.post(`/api/agpa/compute-badges/${this.selectedYear}`);
        this.result = parseAxiosResponse(response);
      } catch (error) {
        this.result = {
          success: false,
          message: error.response?.data?.message || 'Erreur lors du calcul des badges'
        };
      } finally {
        this.isComputing = false;
      }
    },

    async recalculateAll() {
      this.isRecalculating = true;
      this.recalcResult = null;

      try {
        const response = await axios.post('/api/agpa/recalculate', {
          fromYear: this.recalcFromYear,
          toYear: this.recalcToYear,
          algorithm: this.recalcAlgorithm
        });
        this.recalcResult = parseAxiosResponse(response);
      } catch (error) {
        this.recalcResult = {
          summary: {
            yearsProcessed: 0,
            yearsSuccess: 0,
            yearsFailed: 1
          },
          error: error.response?.data?.message || 'Erreur lors du recalcul'
        };
      } finally {
        this.isRecalculating = false;
      }
    }
  }
};
</script>
