<template>
  <div
    :style="{
      padding: '15px',
      borderRadius: '8px',
      backgroundColor: badge.color + '15',
      border: '2px solid ' + getBorderColor(),
      height: '100%',
      position: 'relative',
      opacity: getCardOpacity()
    }"
  >
    <!-- Indicateurs de statut en haut à droite -->
    <div style="position: absolute; top: 8px; right: 8px; display: flex; gap: 4px;">
      <!-- Badge obtenu toutes éditions confondues -->
      <v-tooltip v-if="badgeStatus && badgeStatus.everObtained" bottom>
        <template #activator="{ props }">
          <div
            v-bind="props"
            :style="{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#4caf50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.7em',
              fontWeight: 'bold'
            }"
          >
            <i class="fas fa-check"></i>
          </div>
        </template>
        <span>Obtenu {{ badgeStatus.years.length }} fois ({{ badgeStatus.years.join(', ') }})</span>
      </v-tooltip>

      <!-- Badge actif (obtenu sur les 3 dernières éditions) -->
      <v-tooltip v-if="badgeStatus && badgeStatus.isActive" bottom>
        <template #activator="{ props }">
          <div
            v-bind="props"
            :style="{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.7em',
              fontWeight: 'bold',
              animation: 'pulse 2s infinite'
            }"
          >
            <i class="fas fa-fire"></i>
          </div>
        </template>
        <span>Actif (obtenu récemment)</span>
      </v-tooltip>

      <!-- Badge progressif -->
      <v-tooltip v-if="badge.timing === 'progressive'" bottom>
        <template #activator="{ props }">
          <div
            v-bind="props"
            :style="{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#2196f3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.6em',
              fontWeight: 'bold'
            }"
          >
            3Y
          </div>
        </template>
        <span>Badge progressif (calculé sur 3 ans)</span>
      </v-tooltip>
    </div>

    <!-- Header du badge -->
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding-right: 60px;">
      <i :class="badge.icon" :style="{ color: badge.color, fontSize: '1.5em' }"></i>
      <div style="font-size: 1.1em; font-weight: bold; color: #333;">{{ badge.badge }}</div>
    </div>

    <!-- Description -->
    <div style="font-size: 0.9em; color: #666; margin-bottom: 8px;">{{ badge.description }}</div>

    <!-- Condition -->
    <div style="font-size: 0.75em; color: #999; font-style: italic; padding: 6px 8px; background: rgba(0,0,0,0.05); border-radius: 4px; margin-bottom: 8px;">
      <i class="fas fa-info-circle" style="margin-right: 4px;"></i>{{ badge.condition }}
    </div>

    <!-- Prérequis pour les badges combo -->
    <div v-if="badge.requires && badge.requires.length > 0" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.1);">
      <div style="font-size: 0.75em; color: #666; margin-bottom: 6px; font-weight: 600;">
        <i class="fas fa-puzzle-piece" style="margin-right: 4px;"></i>Prérequis:
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 4px;">
        <div
          v-for="req in badge.requires"
          :key="req"
          :style="{
            fontSize: '0.7em',
            padding: '3px 8px',
            borderRadius: '12px',
            background: getRequirementStatus(req) ? '#4caf5030' : '#f4433630',
            border: '1px solid ' + (getRequirementStatus(req) ? '#4caf50' : '#f44336'),
            color: getRequirementStatus(req) ? '#2e7d32' : '#c62828',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }"
        >
          <i :class="getRequirementStatus(req) ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
          {{ req }}
        </div>
      </div>
    </div>

    <!-- Barre de progression pour badges progressifs -->
    <div v-if="badge.timing === 'progressive' && progressionData" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.1);">
      <div style="font-size: 0.75em; color: #666; margin-bottom: 6px; font-weight: 600;">
        <i class="fas fa-chart-line" style="margin-right: 4px;"></i>Progression:
      </div>
      <v-progress-linear
        :model-value="progressionData.percentage"
        :color="badge.color"
        height="8"
        rounded
      ></v-progress-linear>
      <div style="font-size: 0.7em; color: #999; margin-top: 4px; text-align: center;">
        {{ progressionData.description }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BadgeCard',
  props: {
    badge: {
      type: Object,
      required: true
    },
    badgeStatus: {
      type: Object,
      default: null
    },
    allBadgesStatus: {
      type: Object,
      default: () => ({})
    },
    progressionData: {
      type: Object,
      default: null
    }
  },
  methods: {
    getBorderColor() {
      if (this.badgeStatus && this.badgeStatus.isActive) {
        return this.badge.color;
      }
      if (this.badgeStatus && this.badgeStatus.everObtained) {
        return this.badge.color + '80'; // Semi-transparent
      }
      return this.badge.color + '40'; // Très transparent
    },

    getCardOpacity() {
      if (this.badgeStatus && this.badgeStatus.isActive) {
        return 1;
      }
      if (this.badgeStatus && this.badgeStatus.everObtained) {
        return 0.85;
      }
      return 0.6;
    },

    getRequirementStatus(requirementName) {
      // Vérifier si le badge prérequis est actif (obtenu sur les 3 dernières éditions)
      return this.allBadgesStatus[requirementName]?.isActive || false;
    }
  }
};
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(250, 112, 154, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(250, 112, 154, 0);
  }
}
</style>
