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
      currentYear: new Date().getFullYear()
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
