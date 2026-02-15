<template>
  <div>
    <v-container>
      <v-card>
        <v-card-title class="badges-gallery__header">
          <v-icon start color="white" size="large">fas fa-award</v-icon>
          Galerie des Badges par Famille
        </v-card-title>

        <v-card-text class="badges-gallery__content">
          <!-- Selecteur de famille -->
          <div class="badges-gallery__family-selector">
            <v-btn-toggle
              v-model="selectedFamily"
              mandatory
              color="primary"
              variant="outlined"
              divided
            >
              <v-btn value="gueudelot" size="large">
                <v-icon start>fas fa-users</v-icon>
                Gueudelot
              </v-btn>
              <v-btn value="guyomard" size="large">
                <v-icon start>fas fa-users</v-icon>
                Guyomard
              </v-btn>
              <v-btn value="guibert" size="large">
                <v-icon start>fas fa-users</v-icon>
                Guibert
              </v-btn>
            </v-btn-toggle>
          </div>

          <!-- Message de chargement -->
          <div v-if="loading" class="badges-gallery__empty-state">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            />
            <div class="badges-gallery__empty-text">
              Chargement des membres de la famille...
            </div>
          </div>

          <!-- Message si pas de membres -->
          <div v-else-if="!loading && familyMembers.length === 0" class="badges-gallery__empty-state">
            <v-icon size="64" color="grey">fas fa-user-slash</v-icon>
            <div class="badges-gallery__empty-text badges-gallery__empty-text--large">
              Aucun membre actif trouve pour cette famille
            </div>
            <div class="badges-gallery__empty-text badges-gallery__empty-text--muted">
              (Actif = ayant participe aux AGPA ces 3 dernieres annees)
            </div>
          </div>

          <!-- Galerie des membres -->
          <v-row v-else>
            <v-col
              v-for="member in familyMembers"
              :key="member.userId"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card
                class="member-card"
                hover
                elevation="2"
                @click="showMemberDetails(member)"
              >
                <!-- Avatar -->
                <div class="member-card__avatar-wrap">
                  <v-avatar
                    size="120"
                    class="member-card__avatar"
                  >
                    <img
                      :src="`/files/avatars/${String(member.userId).padStart(3, '0')}.png`"
                      :alt="member.username"
                      @error="onAvatarError"
                    >
                  </v-avatar>
                </div>

                <!-- Nom d'utilisateur -->
                <v-card-title class="member-card__name">
                  {{ member.username }}
                </v-card-title>

                <!-- Badge principal (le plus rare) -->
                <v-card-text v-if="member.mainBadge" class="member-card__badge-section">
                  <div class="member-card__main-badge">
                    <div class="member-card__badge-icon-wrap">
                      <i
                        :class="member.mainBadge.icon"
                        class="member-card__badge-icon"
                        :style="{ color: member.mainBadge.color || '#ffffff' }"
                      ></i>
                    </div>
                    <div class="member-card__badge-name">
                      {{ member.mainBadge.badge }}
                    </div>
                    <div class="member-card__badge-desc">
                      {{ member.mainBadge.description }}
                    </div>
                    <div class="member-card__badge-year">
                      Edition {{ member.mainBadge.year }}
                    </div>
                  </div>
                </v-card-text>

                <!-- Si pas de badge -->
                <v-card-text v-else class="member-card__badge-section">
                  <div class="member-card__no-badge">
                    <i class="fas fa-medal member-card__no-badge-icon"></i>
                    <div class="member-card__no-badge-text">
                      Aucun badge obtenu
                    </div>
                  </div>
                </v-card-text>

                <!-- Nombre total de badges obtenus -->
                <v-card-actions class="member-card__actions">
                  <v-chip
                    v-if="member.totalBadges > 0"
                    color="primary"
                    variant="tonal"
                    size="small"
                  >
                    <v-icon start size="small">fas fa-award</v-icon>
                    {{ member.totalBadges }} badge{{ member.totalBadges > 1 ? 's' : '' }}
                  </v-chip>
                  <v-chip
                    v-else
                    color="grey"
                    variant="tonal"
                    size="small"
                  >
                    <v-icon start size="small">fas fa-medal</v-icon>
                    En attente
                  </v-chip>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Dialog modale pour afficher tous les badges d'un membre -->
    <v-dialog
      v-model="detailsDialog"
      max-width="800"
      scrollable
    >
      <v-card v-if="selectedMember">
        <!-- En-tete avec avatar et nom -->
        <v-card-title class="badges-dialog__header">
          <div class="badges-dialog__header-content">
            <v-avatar size="80" class="badges-dialog__avatar">
              <img
                :src="`/files/avatars/${String(selectedMember.userId).padStart(3, '0')}.png`"
                :alt="selectedMember.username"
                @error="onAvatarError"
              >
            </v-avatar>
            <div>
              <div class="badges-dialog__name">
                {{ selectedMember.username }}
              </div>
              <div class="badges-dialog__count">
                <v-icon start color="white" size="small">fas fa-award</v-icon>
                {{ selectedMember.totalBadges }} badge{{ selectedMember.totalBadges > 1 ? 's' : '' }} obtenu{{ selectedMember.totalBadges > 1 ? 's' : '' }}
              </div>
            </div>
          </div>
        </v-card-title>

        <!-- Corps avec la liste des badges -->
        <v-card-text class="badges-dialog__body">
          <div v-if="selectedMember.allBadges && selectedMember.allBadges.length > 0">
            <div
              v-for="(badge, index) in selectedMember.allBadges"
              :key="`${badge.badge}_${badge.year}_${badge.type}`"
              class="badges-dialog__badge-item"
            >
              <v-card
                :style="{
                  border: `2px solid ${badge.color || '#ccc'}`,
                  background: `linear-gradient(135deg, ${badge.color || '#ccc'}22 0%, ${badge.color || '#ccc'}11 100%)`
                }"
                elevation="1"
              >
                <v-card-text class="badges-dialog__badge-content">
                  <div class="badges-dialog__badge-row">
                    <!-- Icone du badge -->
                    <div class="badges-dialog__badge-circle">
                      <i
                        :class="badge.icon"
                        class="badges-dialog__badge-icon"
                        :style="{ color: badge.color || 'rgba(var(--v-theme-on-surface), 0.6)' }"
                      ></i>
                    </div>

                    <!-- Infos du badge -->
                    <div class="badges-dialog__badge-info">
                      <div class="badges-dialog__badge-name">
                        {{ badge.badge }}
                      </div>
                      <div class="badges-dialog__badge-desc">
                        {{ badge.description }}
                      </div>
                      <div class="badges-dialog__badge-chips">
                        <v-chip
                          size="small"
                          :color="getBadgeTypeColor(badge.type)"
                          variant="flat"
                        >
                          <v-icon start size="x-small">{{ getBadgeTypeIcon(badge.type) }}</v-icon>
                          {{ getBadgeTypeLabel(badge.type) }}
                        </v-chip>
                        <v-chip size="small" color="grey" variant="tonal">
                          <v-icon start size="x-small">fas fa-calendar</v-icon>
                          {{ badge.year }}
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>

          <!-- Message si aucun badge -->
          <div v-else class="badges-dialog__empty">
            <v-icon size="64" color="grey-lighten-2">fas fa-medal</v-icon>
            <div class="badges-dialog__empty-text">
              Aucun badge obtenu sur les 3 dernieres annees
            </div>
          </div>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions class="badges-dialog__actions">
          <v-btn
            color="primary"
            variant="text"
            @click="detailsDialog = false"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'BadgesGallery',
  data() {
    return {
      selectedFamily: 'gueudelot',
      familyMembers: [],
      loading: false,
      currentYear: new Date().getFullYear(),
      detailsDialog: false,
      selectedMember: null
    };
  },
  watch: {
    selectedFamily() {
      this.loadFamilyMembers();
    }
  },
  mounted() {
    this.loadFamilyMembers();
  },
  methods: {
    async loadFamilyMembers() {
      this.loading = true;
      try {
        const response = await axios.get(`/api/agpa/family-badges/${this.selectedFamily}`);
        if (response.data.success) {
          this.familyMembers = response.data.members || [];
        } else {
          console.error('Erreur lors du chargement des membres:', response.data);
          this.familyMembers = [];
        }
      } catch (error) {
        console.error('Erreur lors du chargement des membres de la famille:', error);
        this.familyMembers = [];
      } finally {
        this.loading = false;
      }
    },
    onAvatarError(event) {
      // Fallback to default avatar if image not found
      event.target.src = '/files/avatars/default.png';
    },
    showMemberDetails(member) {
      this.selectedMember = member;
      this.detailsDialog = true;
    },
    getBadgeTypeLabel(type) {
      const labels = {
        voter: 'Votant',
        photographer: 'Photographe',
        combo: 'Combo'
      };
      return labels[type] || type;
    },
    getBadgeTypeColor(type) {
      const colors = {
        voter: 'blue',
        photographer: 'green',
        combo: 'purple'
      };
      return colors[type] || 'grey';
    },
    getBadgeTypeIcon(type) {
      const icons = {
        voter: 'fas fa-vote-yea',
        photographer: 'fas fa-camera',
        combo: 'fas fa-star'
      };
      return icons[type] || 'fas fa-medal';
    }
  }
};
</script>

<style lang="scss" scoped>
@use '../../themes/agpa-tokens' as *;

// ============================================
// Gallery header & layout
// ============================================
.badges-gallery__header {
  background: $gradient-badges;
  color: white;
  padding: 20px;
}

.badges-gallery__content {
  padding: 30px;
}

.badges-gallery__family-selector {
  margin-bottom: 30px;
  text-align: center;
}

// ============================================
// Empty state
// ============================================
.badges-gallery__empty-state {
  text-align: center;
  padding: 50px;
}

.badges-gallery__empty-text {
  margin-top: 20px;
  color: rgba(var(--v-theme-on-surface), 0.6);

  &--large {
    font-size: 1.1em;
  }

  &--muted {
    margin-top: 10px;
    color: rgba(var(--v-theme-on-surface), 0.45);
    font-size: 0.9em;
  }
}

// ============================================
// Member card
// ============================================
.member-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
  }
}

.member-card__avatar-wrap {
  text-align: center;
  padding: 20px 20px 10px 20px;
}

.member-card__avatar {
  border: 4px solid rgba(var(--v-theme-on-surface), 0.08);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.member-card__name {
  text-align: center;
  padding: 10px 15px;
  font-size: 1.1em;
}

.member-card__badge-section {
  text-align: center;
  padding: 15px;
}

.member-card__main-badge {
  padding: 15px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, $award-nominated 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}

.member-card__badge-icon-wrap {
  margin-bottom: 8px;
}

.member-card__badge-icon {
  font-size: 2em;
}

.member-card__badge-name {
  font-weight: 600;
  font-size: 0.95em;
  margin-bottom: 4px;
}

.member-card__badge-desc {
  font-size: 0.75em;
  opacity: 0.9;
}

.member-card__badge-year {
  font-size: 0.7em;
  opacity: 0.7;
  margin-top: 6px;
}

.member-card__no-badge {
  padding: 15px;
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.05);
  color: rgba(var(--v-theme-on-surface), 0.45);
}

.member-card__no-badge-icon {
  font-size: 2em;
  opacity: 0.3;
}

.member-card__no-badge-text {
  font-size: 0.85em;
  margin-top: 8px;
}

.member-card__actions {
  justify-content: center;
  padding: 10px;
}

// ============================================
// Details dialog
// ============================================
.badges-dialog__header {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, $award-nominated 100%);
  color: white;
  padding: 25px;
}

.badges-dialog__header-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.badges-dialog__avatar {
  border: 3px solid white;
}

.badges-dialog__name {
  font-size: 1.5em;
  font-weight: 600;
}

.badges-dialog__count {
  font-size: 0.9em;
  opacity: 0.9;
  margin-top: 5px;
}

.badges-dialog__body {
  padding: 25px;
  max-height: 500px;
}

.badges-dialog__badge-item {
  margin-bottom: 15px;
}

.badges-dialog__badge-content {
  padding: 20px;
}

.badges-dialog__badge-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.badges-dialog__badge-circle {
  min-width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.badges-dialog__badge-icon {
  font-size: 1.8em;
}

.badges-dialog__badge-info {
  flex: 1;
}

.badges-dialog__badge-name {
  font-weight: 600;
  font-size: 1.1em;
  margin-bottom: 5px;
}

.badges-dialog__badge-desc {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.9em;
  margin-bottom: 8px;
}

.badges-dialog__badge-chips {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.badges-dialog__empty {
  text-align: center;
  padding: 50px;
  color: rgba(var(--v-theme-on-surface), 0.45);
}

.badges-dialog__empty-text {
  margin-top: 20px;
  font-size: 1.1em;
}

.badges-dialog__actions {
  padding: 15px 25px;
  justify-content: flex-end;
}
</style>
