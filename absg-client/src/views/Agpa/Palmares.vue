<template>
  <div>
    <v-container>
      <!-- Mode Debug Admin -->
      <v-card v-if="isAdmin" style="margin-bottom: 20px; border: 2px solid #ff9800;">
        <v-card-title style="background: #ff9800; color: white; padding: 10px 20px;">
          <v-icon start color="white">fas fa-user-secret</v-icon>
          Mode Debug Admin
        </v-card-title>
        <v-card-text style="padding: 15px 20px;">
          <div style="display: flex; align-items: center; gap: 15px;">
            <v-autocomplete
              v-model="debugUserId"
              :items="allUsers"
              item-title="username"
              item-value="id"
              label="Voir le palmarès d'un utilisateur"
              prepend-icon="fas fa-user"
              clearable
              density="comfortable"
              style="flex: 1;"
              @update:model-value="onDebugUserChange"
            >
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="item.raw.username"
                  :subtitle="`${item.raw.rootFamily || 'Aucune famille'} - ID: ${item.raw.id}`"
                >
                  <template #prepend>
                    <v-avatar size="32">
                      <img :src="`/files/avatars/${String(item.raw.id).padStart(3, '0')}.png`" :alt="item.raw.username">
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>
            </v-autocomplete>
            <v-chip v-if="debugUserId" color="warning" style="font-weight: bold;">
              Affichage: {{ debugUserName }}
            </v-chip>
            <v-btn
              v-if="debugUserId"
              icon="fas fa-times"
              color="error"
              size="small"
              @click="clearDebugMode"
            />
          </div>
        </v-card-text>
      </v-card>

      <!-- Première ligne: Layout 2 colonnes -->
      <v-row style="margin-bottom: 30px;">
        <!-- Colonne gauche: Mes AGPA + Mes Succès -->
        <v-col cols="12" md="6">
          <v-row>
            <!-- Section 1: Mes AGPA (Récompenses) -->
            <v-col cols="12">
              <v-card
                style="cursor: pointer; transition: transform 0.2s; height: 100%; margin-bottom: 20px;"
                @click="showPalmaresDialog = true"
                hover
              >
                <v-card-title style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                  <v-icon start color="white">fas fa-trophy</v-icon>
                  Mes AGPA
                </v-card-title>
            <v-card-text style="padding: 30px; text-align: center;">
              <!-- Total points cumulés -->
              <div style="margin-bottom: 25px;">
                <div style="font-size: 0.85em; color: #666; margin-bottom: 10px;">
                  <span v-if="slidingYearFrom && slidingYearTo">
                    {{ slidingYearFrom }} - {{ slidingYearTo }}
                  </span>
                  <span v-else>
                    3 dernières éditions
                  </span>
                </div>
                <template v-if="mySlidingAgpas > 0">
                  <div style="font-size: 3em; font-weight: bold; color: #667eea; margin-bottom: 5px;">
                    {{ mySlidingAgpas }}
                  </div>
                  <div style="font-size: 0.9em; color: #666;">
                    point{{ mySlidingAgpas > 1 ? 's' : '' }} cumulé{{ mySlidingAgpas > 1 ? 's' : '' }}
                  </div>
                </template>
                <template v-else>
                  <div style="font-size: 2.5em; margin-bottom: 10px;">
                    <i class="far fa-smile" style="color: #ffa726;"></i>
                  </div>
                  <div style="font-size: 1em; color: #666; font-style: italic;">
                    Ton heure viendra :)
                  </div>
                </template>
              </div>

              <!-- Répartition des récompenses -->
              <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin-bottom: 15px;">
                <div style="text-align: center;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                    <i class="fas fa-circle" style="color: #c68b00; font-size: 0.8em;"></i>
                    <span style="font-size: 1.6em; font-weight: bold; color: #c68b00;">{{ mySlidingAwards.gold }}</span>
                  </div>
                </div>
                <div style="text-align: center;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                    <i class="fas fa-circle" style="color: #9b9b9b; font-size: 0.8em;"></i>
                    <span style="font-size: 1.6em; font-weight: bold; color: #9b9b9b;">{{ mySlidingAwards.sylver }}</span>
                  </div>
                </div>
                <div style="text-align: center;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                    <i class="fas fa-circle" style="color: #cd7f32; font-size: 0.8em;"></i>
                    <span style="font-size: 1.6em; font-weight: bold; color: #cd7f32;">{{ mySlidingAwards.bronze }}</span>
                  </div>
                </div>
                <div style="text-align: center;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                    <i class="far fa-circle" style="color: #764ba2; font-size: 0.8em;"></i>
                    <span style="font-size: 1.6em; font-weight: bold; color: #764ba2;">{{ mySlidingAwards.nominated }}</span>
                  </div>
                </div>
              </div>

              <div style="margin-top: 20px; font-size: 0.9em; color: #999; font-style: italic;">
                Cliquez pour voir le palmarès complet
              </div>
            </v-card-text>
              </v-card>
            </v-col>

            <!-- Section 2: Mes Succès -->
            <v-col cols="12">
              <v-card
                style="cursor: pointer; transition: transform 0.2s; height: 100%;"
                @click="showBadgesDialog = true"
                hover
              >
                <v-card-title style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white;">
                  <v-icon start color="white">fas fa-award</v-icon>
                  Mes Succès
                </v-card-title>
            <v-card-text style="padding: 30px; text-align: center;">
              <!-- Total badges débloqués -->
              <div style="margin-bottom: 25px;">
                <div style="font-size: 0.85em; color: #666; margin-bottom: 10px;">
                  <span v-if="slidingYearFrom && slidingYearTo">
                    {{ slidingYearFrom }} - {{ slidingYearTo }}
                  </span>
                  <span v-else>
                    3 dernières éditions
                  </span>
                </div>
                <div style="font-size: 3em; font-weight: bold; color: #fa709a; margin-bottom: 5px;">
                  {{ mySlidingBadges.length }}
                </div>
                <div style="font-size: 0.9em; color: #666;">
                  Badge{{ mySlidingBadges.length > 1 ? 's' : '' }} débloqué{{ mySlidingBadges.length > 1 ? 's' : '' }}
                </div>
              </div>

              <!-- Répartition par type -->
              <div style="margin-bottom: 15px;">
                <!-- Badge Votant -->
                <div style="margin-bottom: 10px; padding: 10px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <i class="fas fa-vote-yea" style="color: #2196f3; font-size: 1.2em;"></i>
                      <div style="font-size: 0.85em; font-weight: 600; color: #666;">Votant</div>
                    </div>
                    <div style="font-size: 1.3em; font-weight: bold; color: #2196f3;">
                      {{ countBadgesByType('voter') }}
                    </div>
                  </div>
                </div>

                <!-- Badge Photographe -->
                <div style="margin-bottom: 10px; padding: 10px; background: #fff3e0; border-radius: 8px; border-left: 4px solid #ff9800;">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <i class="fas fa-camera" style="color: #ff9800; font-size: 1.2em;"></i>
                      <div style="font-size: 0.85em; font-weight: 600; color: #666;">Photographe</div>
                    </div>
                    <div style="font-size: 1.3em; font-weight: bold; color: #ff9800;">
                      {{ countBadgesByType('photographer') }}
                    </div>
                  </div>
                </div>

                <!-- Badge Combo -->
                <div style="padding: 10px; background: #f3e5f5; border-radius: 8px; border-left: 4px solid #9c27b0;">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <i class="fas fa-puzzle-piece" style="color: #9c27b0; font-size: 1.2em;"></i>
                      <div style="font-size: 0.85em; font-weight: 600; color: #666;">Combo</div>
                    </div>
                    <div style="font-size: 1.3em; font-weight: bold; color: #9c27b0;">
                      {{ countBadgesByType('combo') }}
                    </div>
                  </div>
                </div>
              </div>

              <div style="margin-top: 20px; font-size: 0.9em; color: #999; font-style: italic;">
                Cliquez pour découvrir tous les achievements
              </div>
            </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>

        <!-- Colonne droite: Statistiques Complètes -->
        <v-col cols="12" md="6">
          <v-card style="height: 100%;">
            <v-card-title style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
              <v-icon start color="white">fas fa-chart-line</v-icon>
              Mes Statistiques
            </v-card-title>
            <v-card-text style="padding: 20px;">
              <!-- Stats générales en grille -->
              <v-row style="margin-bottom: 20px;">
                <!-- Meilleure catégorie -->
                <v-col cols="6">
                  <div style="padding: 12px; background: #fff3e0; border-radius: 8px; border-left: 4px solid #ff9800; height: 100%;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                      <i class="fas fa-crown" style="color: #ff9800; font-size: 1.2em;"></i>
                      <div style="font-size: 0.8em; font-weight: 600; color: #666;">Catégorie favorite</div>
                    </div>
                    <div style="font-size: 1.1em; font-weight: bold; color: #333; margin-bottom: 4px;">Animaux</div>
                    <div style="font-size: 0.75em; color: #666;">
                      3 <i class="fas fa-circle" style="color: #c68b00; font-size: 0.7em;"></i> ·
                      2 <i class="fas fa-circle" style="color: #9b9b9b; font-size: 0.7em;"></i> ·
                      1 <i class="fas fa-circle" style="color: #cd7f32; font-size: 0.7em;"></i>
                    </div>
                  </div>
                </v-col>

                <!-- Meilleure année -->
                <v-col cols="6">
                  <div style="padding: 12px; background: #e8f5e9; border-radius: 8px; border-left: 4px solid #4caf50; height: 100%;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                      <i class="fas fa-calendar-star" style="color: #4caf50; font-size: 1.2em;"></i>
                      <div style="font-size: 0.8em; font-weight: 600; color: #666;">Meilleure année</div>
                    </div>
                    <div style="font-size: 1.1em; font-weight: bold; color: #333; margin-bottom: 4px;">2023</div>
                    <div style="font-size: 0.75em; color: #666;">
                      5 récompenses · 42 points
                    </div>
                  </div>
                </v-col>

                <!-- Éditions participées -->
                <v-col cols="6">
                  <div style="padding: 12px; background: #fce4ec; border-radius: 8px; border-left: 4px solid #e91e63; height: 100%;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                      <i class="fas fa-calendar-check" style="color: #e91e63; font-size: 1.2em;"></i>
                      <div style="font-size: 0.8em; font-weight: 600; color: #666;">Éditions</div>
                    </div>
                    <div style="font-size: 1.1em; font-weight: bold; color: #333; margin-bottom: 4px;">18</div>
                    <div style="font-size: 0.75em; color: #666;">
                      Participation totale
                    </div>
                  </div>
                </v-col>

                <!-- Photos soumises -->
                <v-col cols="6">
                  <div style="padding: 12px; background: #e1f5fe; border-radius: 8px; border-left: 4px solid #03a9f4; height: 100%;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                      <i class="fas fa-images" style="color: #03a9f4; font-size: 1.2em;"></i>
                      <div style="font-size: 0.8em; font-weight: 600; color: #666;">Photos soumises</div>
                    </div>
                    <div style="font-size: 1.1em; font-weight: bold; color: #333; margin-bottom: 4px;">156</div>
                    <div style="font-size: 0.75em; color: #666;">
                      Au total
                    </div>
                  </div>
                </v-col>
              </v-row>

              <!-- Séparateur -->
              <v-divider style="margin: 20px 0;" />

              <!-- Stats familiales -->
              <div style="margin-bottom: 20px;">
                <div style="font-size: 0.85em; color: #666; margin-bottom: 12px; font-weight: 600;">
                  <i class="fas fa-users" style="margin-right: 5px;"></i>
                  Ma famille
                </div>

                <div style="padding: 12px; background: #f3e5f5; border-radius: 8px; border-left: 4px solid #9c27b0;">
                  <div style="font-size: 0.8em; color: #666; margin-bottom: 5px;">Classement famille Gueudelot</div>
                  <div style="font-size: 1.1em; font-weight: bold; color: #9c27b0;">3ème position</div>
                </div>
              </div>

              <!-- Séparateur -->
              <v-divider style="margin: 20px 0;" />

              <!-- Fun Facts -->
              <div>
                <div style="font-size: 0.85em; color: #666; margin-bottom: 12px; font-weight: 600;">
                  <i class="fas fa-lightbulb" style="margin-right: 5px;"></i>
                  Fun Facts
                </div>

                <!-- Fact 1 -->
                <div style="padding: 10px; background: #fff9e6; border-radius: 8px; margin-bottom: 10px;">
                  <div style="display: flex; align-items: flex-start; gap: 8px;">
                    <i class="fas fa-vote-yea" style="color: #ffc107; font-size: 1.1em; margin-top: 2px;"></i>
                    <div style="flex: 1;">
                      <div style="font-size: 0.8em; color: #666; line-height: 1.4;">
                        Vous avez voté pour <strong>127 photos</strong> différentes lors de l'édition 2024
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Fact 2 -->
                <div style="padding: 10px; background: #f3e5f5; border-radius: 8px; margin-bottom: 10px;">
                  <div style="display: flex; align-items: flex-start; gap: 8px;">
                    <i class="fas fa-fire" style="color: #9c27b0; font-size: 1.1em; margin-top: 2px;"></i>
                    <div style="flex: 1;">
                      <div style="font-size: 0.8em; color: #666; line-height: 1.4;">
                        Votre série la plus longue: <strong>12 éditions</strong> consécutives
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Fact 3 -->
                <div style="padding: 10px; background: #e3f2fd; border-radius: 8px; margin-bottom: 10px;">
                  <div style="display: flex; align-items: flex-start; gap: 8px;">
                    <i class="fas fa-trophy" style="color: #2196f3; font-size: 1.1em; margin-top: 2px;"></i>
                    <div style="flex: 1;">
                      <div style="font-size: 0.8em; color: #666; line-height: 1.4;">
                        Premier podium en <strong>2015</strong> dans la catégorie "Nature"
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Fact 4 -->
                <div style="padding: 10px; background: #e8f5e9; border-radius: 8px;">
                  <div style="display: flex; align-items: flex-start; gap: 8px;">
                    <i class="fas fa-heart" style="color: #e91e63; font-size: 1.1em; margin-top: 2px;"></i>
                    <div style="flex: 1;">
                      <div style="font-size: 0.8em; color: #666; line-height: 1.4;">
                        Photographe préféré: <strong>Jean-Michel</strong> (23 votes donnés)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Dialog Palmarès Unifié -->
    <PalmaresDialog
      v-model="showPalmaresDialog"
      :sliding-palmares="slidingPalmares"
      :global-palmares="palmares"
      :sliding-year-from="slidingYearFrom"
      :sliding-year-to="slidingYearTo"
      :loading="isLoading"
    />

    <!-- Dialog Détails Palmarès Utilisateur -->
    <v-dialog
      v-if="palmaresDetails"
      v-model="palmaresDetails"
      width="800px"
    >
      <v-card>
        <v-card-title class="bg-grey-lighten-4 py-4 title">
          Palmarès de {{ palmaresDetails.username }}
        </v-card-title>
        <v-container
          grid-list-sm
          class="pa-4"
        >
          <v-table>
            <thead>
              <tr>
                <th class="text-left" />
                <th class="text-left">
                  Nomination
                </th>
                <th class="text-left">
                  Bronze
                </th>
                <th class="text-left">
                  Argent
                </th>
                <th class="text-left">
                  Or
                </th>
                <th class="text-left">
                  Diamant
                </th>
                <th class="text-left">
                  AGPA total
                </th>
                <th class="text-left">
                  Points
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="i in palmaresDetails.statsByCategories"
                :key="i.id"
              >
                <td>{{ i.title }}</td>
                <td>{{ i.stats[0] }}</td>
                <td>{{ i.stats[1] }}</td>
                <td>{{ i.stats[2] }}</td>
                <td>{{ i.stats[3] }}</td>
                <td>{{ i.stats[4] }}</td>
                <td>{{ i.stats[5] }}</td>
                <td>{{ i.stats[6] }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-container>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            @click="closeDialog()"
          >
            fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Liste des Badges -->
    <v-dialog
      v-model="showBadgesDialog"
      max-width="1200px"
      scrollable
    >
      <v-card>
        <v-card-title style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; position: sticky; top: 0; z-index: 10;">
          <v-icon start color="white">fas fa-award</v-icon>
          Tous les badges disponibles
        </v-card-title>

        <v-card-text style="padding: 20px;">
          <!-- Légende -->
          <div style="margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
            <div style="font-size: 0.9em; color: #666; margin-bottom: 10px; font-weight: 600;">Légende:</div>
            <div style="display: flex; flex-wrap: wrap; gap: 15px; font-size: 0.85em;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 20px; height: 20px; borderRadius: 50%; background: #4caf50; display: flex; alignItems: center; justifyContent: center; color: white; fontSize: 0.7em;">
                  <i class="fas fa-check"></i>
                </div>
                <span>Obtenu au moins une fois</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 20px; height: 20px; borderRadius: 50%; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); display: flex; alignItems: center; justifyContent: center; color: white; fontSize: 0.7em;">
                  <i class="fas fa-fire"></i>
                </div>
                <span>Actif (obtenu ces 3 dernières éditions)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 20px; height: 20px; borderRadius: 50%; background: #2196f3; display: flex; alignItems: center; justifyContent: center; color: white; fontSize: 0.6em; fontWeight: bold;">
                  3Y
                </div>
                <span>Badge progressif (sur 3 ans)</span>
              </div>
            </div>
          </div>

          <!-- Badges Votant -->
          <div style="margin-bottom: 30px;">
            <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
              <i class="fas fa-vote-yea" style="color: #2196f3;"></i>
              Badges Votant ({{ voterBadges.length }})
            </h3>
            <v-row>
              <v-col
                v-for="badge in voterBadges"
                :key="badge.badge"
                cols="12"
                sm="6"
                md="4"
              >
                <BadgeCard
                  :badge="badge"
                  :badge-status="badgesHistory[badge.badge]"
                  :all-badges-status="badgesHistory"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Badges Photographe -->
          <div style="margin-bottom: 30px;">
            <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
              <i class="fas fa-camera" style="color: #ff9800;"></i>
              Badges Photographe ({{ photographerBadges.length }})
            </h3>
            <v-row>
              <v-col
                v-for="badge in photographerBadges"
                :key="badge.badge"
                cols="12"
                sm="6"
                md="4"
              >
                <BadgeCard
                  :badge="badge"
                  :badge-status="badgesHistory[badge.badge]"
                  :all-badges-status="badgesHistory"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Badges Combo -->
          <div>
            <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
              <i class="fas fa-puzzle-piece" style="color: #9c27b0;"></i>
              Badges Combo ({{ comboBadges.length }})
            </h3>
            <div style="font-size: 0.9em; color: #666; margin-bottom: 15px; font-style: italic;">
              <i class="fas fa-info-circle" style="margin-right: 4px;"></i>
              Les badges combo nécessitent des prérequis (badges votant ou photographe)
            </div>
            <v-row>
              <v-col
                v-for="badge in comboBadges"
                :key="badge.badge"
                cols="12"
                sm="6"
                md="4"
              >
                <BadgeCard
                  :badge="badge"
                  :badge-status="badgesHistory[badge.badge]"
                  :all-badges-status="badgesHistory"
                  :progression-data="getProgressionData(badge)"
                />
              </v-col>
            </v-row>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            @click="showBadgesDialog = false"
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
import { mapState } from '../../stores/helpers';
import { parseAxiosResponse, getPeopleAvatar } from '../../middleware/CommonHelper';
import BadgeCard from '../../components/BadgeCard.vue';
import PalmaresDialog from '../../components/PalmaresDialog.vue';
import { getBadgesByType } from '../../middleware/badgesMetadata';

export default {
    name: 'Palmares',
    components: {
        BadgeCard,
        PalmaresDialog
    },
    data: () => ({
        isLoading: false,
        headers: [
            { text: 'Photographe', value: 'photographe' },
            { text: 'Score', value: 'score' },
            { text: 'Participation', value: 'participation' },
            { text: 'Récompenses', value: 'awards' },
            { text: 'Meilleure année', value: 'bestYear' },
            { text: 'Meilleure catégorie', value: 'bestCat' },
            { text: '', value: 'actions' },
        ],
        filter: {
            search: "",
            searchSliding: "",
            familyFilter: null,
            familyFilterSliding: null
        },
        palmares: [],
        slidingPalmares: [],
        palmaresDetails: null,
        showPalmaresDialog: false,
        palmaresTab: 'sliding',
        myGlobalRank: null,
        myGlobalAgpas: null,
        myGlobalAwards: { gold: 0, sylver: 0, bronze: 0, nominated: 0 },
        mySlidingRank: null,
        mySlidingAgpas: null,
        mySlidingAwards: { gold: 0, sylver: 0, bronze: 0, nominated: 0 },
        myRankChange: null,
        slidingYearFrom: null,
        slidingYearTo: null,
        myGlobalBadges: null,
        mySlidingBadges: [],
        voteProfiles: {},
        showBadgesDialog: false,
        badgesHistory: {}, // Will hold badge status for each badge from API
        // Mode debug admin
        debugUserId: null,
        debugUserName: '',
        allUsers: [],
    }),
    computed: {
        ...mapState(['user']),
        isAdmin() {
            return this.user?.roles?.includes('admin') || false;
        },

        // Badges arrays from metadata
        voterBadges() {
            return getBadgesByType('voter');
        },
        photographerBadges() {
            return getBadgesByType('photographer');
        },
        comboBadges() {
            return getBadgesByType('combo');
        },

        // Options pour le select de filtrage par famille
        familyOptions() {
            return [
                { title: 'Gueudelot', value: 'gueudelot' },
                { title: 'Guibert', value: 'guibert' },
                { title: 'Guyomard', value: 'guyomard' },
                { title: 'Autre', value: 'autre' }
            ];
        },

        // Palmarès global filtré par recherche et famille
        filteredPalmares() {
            let result = this.palmares;

            // Filtre par famille
            if (this.filter.familyFilter) {
                result = result.filter(p => {
                    const family = (p.rootFamily || 'autre').toLowerCase();
                    return family === this.filter.familyFilter.toLowerCase();
                });
            }

            // Filtre par recherche
            if (this.filter.search && this.filter.search.trim() !== '') {
                const search = this.filter.search.toLowerCase();
                result = result.filter(p => {
                    return (p.username || '').toLowerCase().includes(search) ||
                           (p.rootFamily || '').toLowerCase().includes(search);
                });
            }

            return result;
        },

        // Palmarès glissant filtré par recherche et famille
        filteredSlidingPalmares() {
            let result = this.slidingPalmares;

            // Filtre par famille
            if (this.filter.familyFilterSliding) {
                result = result.filter(p => {
                    const family = (p.rootFamily || 'autre').toLowerCase();
                    return family === this.filter.familyFilterSliding.toLowerCase();
                });
            }

            // Filtre par recherche
            if (this.filter.searchSliding && this.filter.searchSliding.trim() !== '') {
                const search = this.filter.searchSliding.toLowerCase();
                result = result.filter(p => {
                    return (p.username || '').toLowerCase().includes(search) ||
                           (p.rootFamily || '').toLowerCase().includes(search);
                });
            }

            return result;
        }
    },
    mounted () {
        this.initView();
        this.loadAllUsers(); // Charger la liste des utilisateurs pour le mode debug admin
    },
    methods: {
        async initView() {
            this.isLoading = true;

            // Charger le palmarès global
            try {
                const response = await axios.get(`/api/agpa/palmares`);
                const palmaresData = parseAxiosResponse(response);

                if (palmaresData && Array.isArray(palmaresData)) {
                    this.palmares = palmaresData.map( e => ({
                        ...e,
                        ...getPeopleAvatar(e)
                    }));
                } else {
                    this.palmares = [];
                }

                // Calculer ma position et mes AGPA dans le palmarès global
                this.calculateMyGlobalStats();

                this.isLoading = false;
            } catch (err) {
                console.error(err);
                this.palmares = [];
                this.isLoading = false;
            }

            // Charger le palmarès glissant (3 dernières éditions)
            try {
                const response = await axios.get(`/api/agpa/palmares/sliding`);
                const data = parseAxiosResponse(response);

                if (!data) {
                    this.slidingPalmares = [];
                } else if (Array.isArray(data)) {
                    // Format ancien (fallback) - tableau direct
                    this.slidingPalmares = data.map( e => ({
                        ...e,
                        ...getPeopleAvatar(e)
                    }));
                } else if (data?.palmares && Array.isArray(data.palmares)) {
                    // Format avec années - objet avec propriété palmares
                    this.slidingPalmares = data.palmares.map( e => ({
                        ...e,
                        ...getPeopleAvatar(e)
                    }));
                    this.slidingYearFrom = data.yearFrom;
                    this.slidingYearTo = data.yearTo;
                } else {
                    this.slidingPalmares = [];
                }

                // Calculer ma position et mes AGPA dans le palmarès glissant
                this.calculateMySlidingStats();
            } catch (err) {
                console.error('Palmarès glissant non disponible:', err);
                // Pour l'instant, utiliser le palmarès global comme fallback
                this.slidingPalmares = this.palmares || [];
                this.calculateMySlidingStats();
            }

            // Charger les badges
            await this.calculateMyGlobalBadges();
            await this.calculateMySlidingBadges();

            // Charger l'historique des badges
            await this.loadBadgeHistory();
        },

        calculateMyGlobalStats() {
            if (!this.user || !this.palmares) return;

            const myEntry = this.palmares.find(p => p.username === this.user.username);
            if (myEntry) {
                this.myGlobalRank = this.palmares.indexOf(myEntry) + 1;
                this.myGlobalAgpas = myEntry.totalPoints || 0;
                this.myGlobalAwards = {
                    gold: myEntry.awards?.gold || 0,
                    sylver: myEntry.awards?.sylver || 0,
                    bronze: myEntry.awards?.bronze || 0,
                    nominated: myEntry.awards?.nominated || 0
                };
            }
        },

        calculateMySlidingStats() {
            if (!this.user || !this.slidingPalmares) return;

            const myEntry = this.slidingPalmares.find(p => p.username === this.user.username);
            if (myEntry) {
                this.mySlidingRank = this.slidingPalmares.indexOf(myEntry) + 1;
                this.mySlidingAgpas = myEntry.totalPoints || 0;
                this.mySlidingAwards = {
                    gold: myEntry.awards?.gold || 0,
                    sylver: myEntry.awards?.sylver || 0,
                    bronze: myEntry.awards?.bronze || 0,
                    nominated: myEntry.awards?.nominated || 0
                };
                // Récupérer la variation de rang depuis l'API
                this.myRankChange = myEntry.rankChange !== undefined ? myEntry.rankChange : null;
            }
        },

        async loadVoteProfiles(year) {
            try {
                const response = await axios.get(`/api/agpa/vote-profiles/${year}`);
                const profiles = parseAxiosResponse(response);

                // Stocker les profils par année
                if (!this.voteProfiles[year]) {
                    this.voteProfiles[year] = profiles;
                }

                return profiles;
            } catch (err) {
                console.error(`Erreur chargement profils ${year}:`, err);
                return null;
            }
        },

        async calculateMyGlobalBadges() {
            if (!this.user) return;

            // Charger les profils de l'année courante ou dernière disponible
            const currentYear = new Date().getFullYear();
            let profiles = await this.loadVoteProfiles(currentYear);

            // Si pas de profils pour l'année courante, essayer l'année précédente
            if (!profiles || !profiles[this.user.id]) {
                profiles = await this.loadVoteProfiles(currentYear - 1);
            }

            if (!profiles || !profiles[this.user.id]) {
                this.myGlobalBadges = null;
                return;
            }

            const userProfiles = profiles[this.user.id];
            const allBadges = [];

            // Collecter tous les badges non-null
            if (userProfiles.voterProfile) allBadges.push(userProfiles.voterProfile);
            if (userProfiles.photographerProfile) allBadges.push(userProfiles.photographerProfile);
            if (userProfiles.comboProfile) allBadges.push(userProfiles.comboProfile);

            // Total possible: 11 voter + 9 photographer + 14 combo = 34 badges
            const totalPossible = 34;

            // Dernier badge = combo si existe, sinon photographe, sinon voter
            const lastBadge = userProfiles.comboProfile ||
                             userProfiles.photographerProfile ||
                             userProfiles.voterProfile;

            this.myGlobalBadges = {
                totalCount: allBadges.length,
                totalPossible: totalPossible,
                lastBadge: lastBadge
            };
        },

        async calculateMySlidingBadges() {
            if (!this.user) return;

            const currentYear = new Date().getFullYear();
            const years = [currentYear, currentYear - 1, currentYear - 2];
            const slidingBadges = [];

            // Charger les profils pour les 3 dernières années
            for (const year of years) {
                const profiles = await this.loadVoteProfiles(year);

                if (profiles && profiles[this.user.id]) {
                    const userProfiles = profiles[this.user.id];

                    // Priorité: combo > photographer > voter
                    const badge = userProfiles.comboProfile ||
                                 userProfiles.photographerProfile ||
                                 userProfiles.voterProfile;

                    if (badge) {
                        slidingBadges.push({
                            ...badge,
                            year: year
                        });
                    }
                }
            }

            this.mySlidingBadges = slidingBadges;
        },
        displaydetails(palmares) {
            this.palmaresDetails = palmares;
        },
        closeDialog() {
            this.palmaresDetails = null;
        },

        searchMethod(value, search, item) {
            if (value && search && item ) {
                return `${item.username} ${item.rootFamily}`.toLowerCase().indexOf(search.toLowerCase()) > -1;
            }
            return false
        },

        getOrdinalSuffix(rank) {
            if (rank === 1) {
                return 'er';
            }
            return 'ème';
        },

        async loadBadgeHistory() {
            if (!this.user) return;

            try {
                const response = await axios.get('/api/agpa/my-badges-history');
                const data = parseAxiosResponse(response);

                if (data && data.badgeHistory) {
                    this.badgesHistory = data.badgeHistory;
                }
            } catch (err) {
                console.error('Erreur chargement historique badges:', err);
                this.badgesHistory = {};
            }
        },

        getProgressionData(badge) {
            // Only progressive badges have progression data
            if (badge.timing !== 'progressive') {
                return null;
            }

            // Check if this badge exists in history
            const badgeStatus = this.badgesHistory[badge.badge];
            if (!badgeStatus) {
                return {
                    percentage: 0,
                    description: 'Aucune progression pour le moment'
                };
            }

            // For progressive badges obtained, show 100%
            if (badgeStatus.isActive) {
                return {
                    percentage: 100,
                    description: `Badge actif (obtenu ${badgeStatus.years.length} fois)`
                };
            }

            if (badgeStatus.everObtained) {
                return {
                    percentage: 50,
                    description: `Badge obtenu dans le passé (${badgeStatus.years.join(', ')})`
                };
            }

            // Not obtained yet - could add more specific progression logic here
            return {
                percentage: 0,
                description: 'Non obtenu'
            };
        },

        countBadgesByType(type) {
            if (!this.badgesHistory || Object.keys(this.badgesHistory).length === 0) {
                return 0;
            }

            // Count active badges (obtained in last 3 editions) of the given type
            let count = 0;
            const badgesToCheck = type === 'voter' ? this.voterBadges :
                                 type === 'photographer' ? this.photographerBadges :
                                 type === 'combo' ? this.comboBadges : [];

            for (const badge of badgesToCheck) {
                const badgeStatus = this.badgesHistory[badge.badge];
                if (badgeStatus && badgeStatus.isActive) {
                    count++;
                }
            }

            return count;
        },

        // Mode debug admin
        async loadAllUsers() {
            if (!this.isAdmin) return;

            try {
                const response = await axios.get('/api/users/list');
                const data = parseAxiosResponse(response);
                if (data && data.users) {
                    this.allUsers = data.users.sort((a, b) => a.username.localeCompare(b.username));
                }
            } catch (error) {
                console.error('Erreur lors du chargement des utilisateurs:', error);
            }
        },

        onDebugUserChange(userId) {
            if (userId) {
                const selectedUser = this.allUsers.find(u => u.id === userId);
                this.debugUserName = selectedUser ? selectedUser.username : '';
                // Recharger les données avec l'utilisateur sélectionné
                this.loadPalmaresData(userId);
            } else {
                this.clearDebugMode();
            }
        },

        clearDebugMode() {
            this.debugUserId = null;
            this.debugUserName = '';
            // Recharger les données de l'utilisateur connecté
            this.loadPalmaresData(this.user.id);
        },

        async loadPalmaresData(userId) {
            this.isLoading = true;

            try {
                // Charger le palmarès global
                const globalResponse = await axios.get('/api/agpa/palmares');
                const globalData = parseAxiosResponse(globalResponse);
                if (globalData) {
                    this.palmares = globalData;
                    this.updateMyGlobalStats(userId);
                }

                // Charger le palmarès glissant
                const slidingResponse = await axios.get('/api/agpa/palmares-sliding');
                const slidingData = parseAxiosResponse(slidingResponse);
                if (slidingData) {
                    this.slidingPalmares = slidingData.palmares || [];
                    this.slidingYearFrom = slidingData.yearFrom;
                    this.slidingYearTo = slidingData.yearTo;
                    this.updateMySlidingStats(userId);
                }

                // Charger l'historique des badges pour cet utilisateur
                await this.loadBadgeHistoryForUser(userId);
                await this.loadMySlidingBadgesForUser(userId);

            } catch (error) {
                console.error('Erreur lors du chargement du palmarès:', error);
            } finally {
                this.isLoading = false;
            }
        },

        updateMyGlobalStats(userId) {
            const myEntry = this.palmares.find(p => p.userId === userId);
            if (myEntry) {
                this.myGlobalRank = this.palmares.indexOf(myEntry) + 1;
                this.myGlobalAgpas = myEntry.totalPoints || 0;
                this.myGlobalAwards = {
                    gold: myEntry.awards?.gold || 0,
                    sylver: myEntry.awards?.sylver || 0,
                    bronze: myEntry.awards?.bronze || 0,
                    nominated: myEntry.awards?.nominated || 0
                };
            }
        },

        updateMySlidingStats(userId) {
            const myEntry = this.slidingPalmares.find(p => p.userId === userId);
            if (myEntry) {
                this.mySlidingRank = this.slidingPalmares.indexOf(myEntry) + 1;
                this.mySlidingAgpas = myEntry.totalPoints || 0;
                this.mySlidingAwards = {
                    gold: myEntry.awards?.gold || 0,
                    sylver: myEntry.awards?.sylver || 0,
                    bronze: myEntry.awards?.bronze || 0,
                    nominated: myEntry.awards?.nominated || 0
                };
                this.myRankChange = myEntry.rankChange !== undefined ? myEntry.rankChange : null;
            }
        },

        async loadBadgeHistoryForUser(userId) {
            try {
                const response = await axios.get(`/api/agpa/badges-history/${userId}`);
                const data = parseAxiosResponse(response);

                if (data && data.badgeHistory) {
                    this.badgesHistory = data.badgeHistory;
                }
            } catch (error) {
                console.error('Erreur lors du chargement de l\'historique des badges:', error);
            }
        },

        async loadMySlidingBadgesForUser(userId) {
            if (!this.slidingYearFrom || !this.slidingYearTo) return;

            const slidingBadges = [];
            for (let year = this.slidingYearFrom; year <= this.slidingYearTo; year++) {
                const profiles = await this.loadVoteProfiles(year);

                if (profiles && profiles[userId]) {
                    const userProfiles = profiles[userId];

                    const badge = userProfiles.comboProfile ||
                                 userProfiles.photographerProfile ||
                                 userProfiles.voterProfile;

                    if (badge) {
                        slidingBadges.push({
                            ...badge,
                            year: year
                        });
                    }
                }
            }

            this.mySlidingBadges = slidingBadges;
        }
    }
};
</script>


<style lang="scss" scoped>
@use '../../themes/global.scss' as *;
</style>
