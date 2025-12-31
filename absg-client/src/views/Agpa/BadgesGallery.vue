<template>
  <div>
    <v-container>
      <v-card>
        <v-card-title style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 20px;">
          <v-icon start color="white" size="large">fas fa-award</v-icon>
          Galerie des Badges par Famille
        </v-card-title>

        <v-card-text style="padding: 30px;">
          <!-- Sélecteur de famille -->
          <div style="margin-bottom: 30px; text-align: center;">
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
          <div v-if="loading" style="text-align: center; padding: 50px;">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            />
            <div style="margin-top: 20px; color: #666;">
              Chargement des membres de la famille...
            </div>
          </div>

          <!-- Message si pas de membres -->
          <div v-else-if="!loading && familyMembers.length === 0" style="text-align: center; padding: 50px;">
            <v-icon size="64" color="grey">fas fa-user-slash</v-icon>
            <div style="margin-top: 20px; color: #666; font-size: 1.1em;">
              Aucun membre actif trouvé pour cette famille
            </div>
            <div style="margin-top: 10px; color: #999; font-size: 0.9em;">
              (Actif = ayant participé aux AGPA ces 3 dernières années)
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
                style="cursor: pointer;"
              >
                <!-- Avatar -->
                <div style="text-align: center; padding: 20px 20px 10px 20px;">
                  <v-avatar
                    size="120"
                    style="border: 4px solid #f5f5f5; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"
                  >
                    <img
                      :src="`/files/avatars/${String(member.userId).padStart(3, '0')}.png`"
                      :alt="member.username"
                      @error="onAvatarError"
                    >
                  </v-avatar>
                </div>

                <!-- Nom d'utilisateur -->
                <v-card-title style="text-align: center; padding: 10px 15px; font-size: 1.1em;">
                  {{ member.username }}
                </v-card-title>

                <!-- Badge principal (le plus rare) -->
                <v-card-text v-if="member.mainBadge" style="text-align: center; padding: 15px;">
                  <div
                    style="
                      padding: 15px;
                      border-radius: 12px;
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                    "
                  >
                    <div style="margin-bottom: 8px;">
                      <i
                        :class="member.mainBadge.icon"
                        style="font-size: 2em;"
                        :style="{ color: member.mainBadge.color || '#ffffff' }"
                      ></i>
                    </div>
                    <div style="font-weight: 600; font-size: 0.95em; margin-bottom: 4px;">
                      {{ member.mainBadge.badge }}
                    </div>
                    <div style="font-size: 0.75em; opacity: 0.9;">
                      {{ member.mainBadge.description }}
                    </div>
                    <div style="font-size: 0.7em; opacity: 0.7; margin-top: 6px;">
                      Édition {{ member.mainBadge.year }}
                    </div>
                  </div>
                </v-card-text>

                <!-- Si pas de badge -->
                <v-card-text v-else style="text-align: center; padding: 15px;">
                  <div
                    style="
                      padding: 15px;
                      border-radius: 12px;
                      background: #f5f5f5;
                      color: #999;
                    "
                  >
                    <i class="fas fa-medal" style="font-size: 2em; opacity: 0.3;"></i>
                    <div style="font-size: 0.85em; margin-top: 8px;">
                      Aucun badge obtenu
                    </div>
                  </div>
                </v-card-text>

                <!-- Nombre total de badges obtenus -->
                <v-card-actions style="justify-content: center; padding: 10px;">
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
        <!-- En-tête avec avatar et nom -->
        <v-card-title style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <v-avatar size="80" style="border: 3px solid white;">
              <img
                :src="`/files/avatars/${String(selectedMember.userId).padStart(3, '0')}.png`"
                :alt="selectedMember.username"
                @error="onAvatarError"
              >
            </v-avatar>
            <div>
              <div style="font-size: 1.5em; font-weight: 600;">
                {{ selectedMember.username }}
              </div>
              <div style="font-size: 0.9em; opacity: 0.9; margin-top: 5px;">
                <v-icon start color="white" size="small">fas fa-award</v-icon>
                {{ selectedMember.totalBadges }} badge{{ selectedMember.totalBadges > 1 ? 's' : '' }} obtenu{{ selectedMember.totalBadges > 1 ? 's' : '' }}
              </div>
            </div>
          </div>
        </v-card-title>

        <!-- Corps avec la liste des badges -->
        <v-card-text style="padding: 25px; max-height: 500px;">
          <div v-if="selectedMember.allBadges && selectedMember.allBadges.length > 0">
            <div
              v-for="(badge, index) in selectedMember.allBadges"
              :key="`${badge.badge}_${badge.year}_${badge.type}`"
              style="margin-bottom: 15px;"
            >
              <v-card
                :style="{
                  border: `2px solid ${badge.color || '#ccc'}`,
                  background: `linear-gradient(135deg, ${badge.color || '#ccc'}22 0%, ${badge.color || '#ccc'}11 100%)`
                }"
                elevation="1"
              >
                <v-card-text style="padding: 20px;">
                  <div style="display: flex; align-items: center; gap: 20px;">
                    <!-- Icône du badge -->
                    <div
                      style="
                        min-width: 60px;
                        height: 60px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        background: white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                      "
                    >
                      <i
                        :class="badge.icon"
                        style="font-size: 1.8em;"
                        :style="{ color: badge.color || '#666' }"
                      ></i>
                    </div>

                    <!-- Infos du badge -->
                    <div style="flex: 1;">
                      <div style="font-weight: 600; font-size: 1.1em; margin-bottom: 5px;">
                        {{ badge.badge }}
                      </div>
                      <div style="color: #666; font-size: 0.9em; margin-bottom: 8px;">
                        {{ badge.description }}
                      </div>
                      <div style="display: flex; align-items: center; gap: 15px; flex-wrap: wrap;">
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
          <div v-else style="text-align: center; padding: 50px; color: #999;">
            <v-icon size="64" color="grey-lighten-2">fas fa-medal</v-icon>
            <div style="margin-top: 20px; font-size: 1.1em;">
              Aucun badge obtenu sur les 3 dernières années
            </div>
          </div>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions style="padding: 15px 25px; justify-content: flex-end;">
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

<style scoped>
.member-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.member-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}
</style>
