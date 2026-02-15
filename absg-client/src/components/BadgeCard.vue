<template>
  <div
    class="badge-card"
    :style="{
      backgroundColor: badge.color + '15',
      border: '2px solid ' + getBorderColor(),
      opacity: getCardOpacity()
    }"
  >
    <!-- Indicateurs de statut en haut à droite -->
    <div class="badge-card__status-indicators">
      <!-- Badge obtenu toutes éditions confondues -->
      <v-tooltip v-if="badgeStatus && badgeStatus.everObtained" location="bottom">
        <template #activator="{ props }">
          <div v-bind="props" class="badge-card__indicator badge-card__indicator--obtained">
            <i class="fas fa-check"></i>
          </div>
        </template>
        <span>Obtenu {{ badgeStatus.years.length }} fois ({{ badgeStatus.years.join(', ') }})</span>
      </v-tooltip>

      <!-- Badge actif (obtenu sur les 3 dernières éditions) -->
      <v-tooltip v-if="badgeStatus && badgeStatus.isActive" location="bottom">
        <template #activator="{ props }">
          <div v-bind="props" class="badge-card__indicator badge-card__indicator--active">
            <i class="fas fa-fire"></i>
          </div>
        </template>
        <span>Actif (obtenu récemment)</span>
      </v-tooltip>

      <!-- Badge progressif -->
      <v-tooltip v-if="badge.timing === 'progressive'" location="bottom">
        <template #activator="{ props }">
          <div v-bind="props" class="badge-card__indicator badge-card__indicator--progressive">
            3Y
          </div>
        </template>
        <span>Badge progressif (calculé sur 3 ans)</span>
      </v-tooltip>
    </div>

    <!-- Header du badge -->
    <div class="badge-card__header">
      <i :class="badge.icon" :style="{ color: badge.color }" class="badge-card__icon"></i>
      <div class="badge-card__title">{{ badge.badge }}</div>
    </div>

    <!-- Description -->
    <div class="badge-card__description">{{ badge.description }}</div>

    <!-- Condition -->
    <div class="badge-card__condition">
      <i class="fas fa-info-circle badge-card__condition-icon"></i>{{ badge.condition }}
    </div>

    <!-- Prérequis pour les badges combo -->
    <div v-if="badge.requires && badge.requires.length > 0" class="badge-card__requirements">
      <div class="badge-card__requirements-label">
        <i class="fas fa-puzzle-piece badge-card__condition-icon"></i>Prérequis:
      </div>
      <div class="badge-card__requirements-list">
        <div
          v-for="req in badge.requires"
          :key="req"
          :class="['badge-card__requirement', getRequirementStatus(req) ? 'badge-card__requirement--met' : 'badge-card__requirement--unmet']"
        >
          <i :class="getRequirementStatus(req) ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
          {{ req }}
        </div>
      </div>
    </div>

    <!-- Barre de progression pour badges progressifs -->
    <div v-if="badge.timing === 'progressive' && progressionData" class="badge-card__progression">
      <div class="badge-card__requirements-label">
        <i class="fas fa-chart-line badge-card__condition-icon"></i>Progression:
      </div>
      <v-progress-linear
        :model-value="progressionData.percentage"
        :color="badge.color"
        height="8"
        rounded
      ></v-progress-linear>
      <div class="badge-card__progression-text">
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

<style lang="scss" scoped>
.badge-card {
  padding: 15px;
  border-radius: 8px;
  height: 100%;
  position: relative;

  &__status-indicators {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
  }

  &__indicator {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;

    &--obtained {
      background: rgb(var(--v-theme-success));
      font-size: 0.7em;
    }

    &--active {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      font-size: 0.7em;
      animation: pulse 2s infinite;
    }

    &--progressive {
      background: rgb(var(--v-theme-info));
      font-size: 0.6em;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    padding-right: 60px;
  }

  &__icon {
    font-size: 1.5em;
  }

  &__title {
    font-size: 1.1em;
    font-weight: bold;
    color: rgba(var(--v-theme-on-surface), 1);
  }

  &__description {
    font-size: 0.9em;
    color: rgba(var(--v-theme-on-surface), 0.7);
    margin-bottom: 8px;
  }

  &__condition {
    font-size: 0.75em;
    color: rgba(var(--v-theme-on-surface), 0.6);
    font-style: italic;
    padding: 6px 8px;
    background: rgba(var(--v-theme-on-surface), 0.05);
    border-radius: 4px;
    margin-bottom: 8px;
  }

  &__condition-icon {
    margin-right: 4px;
  }

  &__requirements,
  &__progression {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  }

  &__requirements-label {
    font-size: 0.75em;
    color: rgba(var(--v-theme-on-surface), 0.7);
    margin-bottom: 6px;
    font-weight: 600;
  }

  &__requirements-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__requirement {
    font-size: 0.7em;
    padding: 3px 8px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 4px;

    &--met {
      background: rgba(var(--v-theme-success), 0.15);
      border: 1px solid rgb(var(--v-theme-success));
      color: rgb(var(--v-theme-success));
    }

    &--unmet {
      background: rgba(var(--v-theme-error), 0.15);
      border: 1px solid rgb(var(--v-theme-error));
      color: rgb(var(--v-theme-error));
    }
  }

  &__progression-text {
    font-size: 0.7em;
    color: rgba(var(--v-theme-on-surface), 0.6);
    margin-top: 4px;
    text-align: center;
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(250, 112, 154, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(250, 112, 154, 0);
  }
}
</style>
