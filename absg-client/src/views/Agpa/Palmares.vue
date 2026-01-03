<template>
  <div>
    <v-container>
      <!-- Mode Debug Admin -->
      <v-card v-if="showDebugPanel" style="margin-bottom: 20px; border: 2px solid #ff9800;">
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

      <!-- Première ligne: Mes AGPA et Mes Succès côte à côte -->
      <v-row style="margin-bottom: 20px;">
        <!-- Mes AGPA -->
        <v-col cols="12" md="6">
          <v-card
            style="cursor: pointer; transition: transform 0.2s; height: 100%;"
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
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        variant="text"
                        size="small"
                        style="text-transform: none; font-size: 0.85em;"
                      >
                        <span v-if="slidingYearFrom && slidingYearTo">
                          {{ slidingYearFrom }} - {{ slidingYearTo }}
                        </span>
                        <span v-else>
                          3 dernières éditions
                        </span>
                        <v-icon end size="small">fas fa-chevron-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item
                        v-for="period in availableSlidingPeriods"
                        :key="`${period.from}-${period.to}`"
                        :active="slidingYearFrom === period.from && slidingYearTo === period.to"
                        @click="changeSlidingPeriod(period.from, period.to)"
                      >
                        <v-list-item-title>{{ period.from }} - {{ period.to }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
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

        <!-- Mes Succès -->
        <v-col cols="12" md="6">
          <v-card
            style="cursor: pointer; transition: transform 0.2s; height: 100%;"
            @click="showFamilyGalleryDialog = true"
            hover
          >
            <v-card-title style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white;">
              <v-icon start color="white">fas fa-award</v-icon>
              Mes Succès
            </v-card-title>
            <v-card-text style="padding: 30px; text-align: center;">
              <!-- Total badges actifs -->
              <div style="margin-bottom: 25px;">
                <div style="font-size: 0.85em; color: #666; margin-bottom: 10px;">
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        variant="text"
                        size="small"
                        style="text-transform: none; font-size: 0.85em;"
                      >
                        <span v-if="slidingYearFrom && slidingYearTo">
                          {{ slidingYearFrom }} - {{ slidingYearTo }}
                        </span>
                        <span v-else>
                          3 dernières éditions
                        </span>
                        <v-icon end size="small">fas fa-chevron-down</v-icon>
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item
                        v-for="period in availableSlidingPeriods"
                        :key="`${period.from}-${period.to}`"
                        :active="slidingYearFrom === period.from && slidingYearTo === period.to"
                        @click="changeSlidingPeriod(period.from, period.to)"
                      >
                        <v-list-item-title>{{ period.from }} - {{ period.to }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
                <div style="font-size: 3em; font-weight: bold; color: #fa709a; margin-bottom: 5px;">
                  {{ totalActiveBadges }}
                </div>
                <div style="font-size: 0.9em; color: #666;">
                  Badge{{ totalActiveBadges > 1 ? 's' : '' }} actif{{ totalActiveBadges > 1 ? 's' : '' }}
                </div>
              </div>

              <!-- Top 3 badges les plus rares -->
              <div v-if="topRarestBadges.length > 0" style="margin-bottom: 15px;">
                <div
                  v-for="(badgeData, index) in topRarestBadges"
                  :key="badgeData.badge.badge"
                  style="margin-bottom: 10px; padding: 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s;"
                  :style="{
                    background: `linear-gradient(135deg, ${badgeData.badge.color}22 0%, ${badgeData.badge.color}11 100%)`,
                    border: `2px solid ${badgeData.badge.color}`
                  }"
                  @click.stop="showBadgesDialog = true"
                  @mouseenter="$event.currentTarget.style.transform = 'scale(1.02)'"
                  @mouseleave="$event.currentTarget.style.transform = 'scale(1)'"
                >
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <!-- Icône du badge -->
                    <div
                      style="
                        min-width: 50px;
                        height: 50px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 50%;
                        background: white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                      "
                    >
                      <i
                        :class="badgeData.badge.icon"
                        style="font-size: 1.5em;"
                        :style="{ color: badgeData.badge.color }"
                      ></i>
                    </div>

                    <!-- Infos du badge -->
                    <div style="flex: 1; text-align: left;">
                      <div style="font-weight: 600; font-size: 0.95em; color: #333; margin-bottom: 2px;">
                        {{ badgeData.badge.badge }}
                      </div>
                      <div style="font-size: 0.75em; color: #666;">
                        {{ badgeData.badge.description }}
                      </div>
                    </div>

                    <!-- Badge type chip -->
                    <v-chip
                      size="x-small"
                      :color="getBadgeTypeColor(badgeData.badge.type)"
                      variant="flat"
                      style="min-width: 70px;"
                    >
                      {{ getBadgeTypeLabel(badgeData.badge.type) }}
                    </v-chip>
                  </div>
                </div>
              </div>

              <!-- Si moins de 3 badges -->
              <div v-else style="padding: 30px; color: #999; font-style: italic;">
                <i class="fas fa-trophy" style="font-size: 2em; opacity: 0.3; margin-bottom: 10px;"></i>
                <div>Obtenez des badges en participant aux AGPA !</div>
              </div>

              <div style="margin-top: 20px; font-size: 0.9em; color: #999; font-style: italic;">
                Cliquez pour voir la galerie par famille
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Deuxième ligne: Mes Statistiques sur toute la largeur -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
              <v-icon start color="white">fas fa-chart-line</v-icon>
              Mes Statistiques
            </v-card-title>
            <v-card-text style="padding: 20px;">
              <!-- Stats générales en grille -->
              <v-row style="margin-bottom: 20px;">
                <!-- Meilleure catégorie -->
                <v-col cols="12" sm="6" md="3">
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
                <v-col cols="12" sm="6" md="3">
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
                <v-col cols="12" sm="6" md="3">
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
                <v-col cols="12" sm="6" md="3">
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

                <v-row>
                  <!-- Fact 1 -->
                  <v-col cols="12" sm="6">
                    <div style="padding: 10px; background: #fff9e6; border-radius: 8px; height: 100%;">
                      <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <i class="fas fa-vote-yea" style="color: #ffc107; font-size: 1.1em; margin-top: 2px;"></i>
                        <div style="flex: 1;">
                          <div style="font-size: 0.8em; color: #666; line-height: 1.4;">
                            Vous avez voté pour <strong>127 photos</strong> différentes lors de l'édition 2024
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-col>

                  <!-- Fact 2 -->
                  <v-col cols="12" sm="6">
                    <div style="padding: 10px; background: #f3e5f5; border-radius: 8px; height: 100%;">
                      <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <i class="fas fa-fire" style="color: #9c27b0; font-size: 1.1em; margin-top: 2px;"></i>
                        <div style="flex: 1;">
                          <div style="font-size: 0.8em; color: #666; line-height: 1.4;">
                            Votre série la plus longue: <strong>12 éditions</strong> consécutives
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-col>

                  <!-- Fact 3 -->
                  <v-col cols="12" sm="6">
                    <div style="padding: 10px; background: #e3f2fd; border-radius: 8px; height: 100%;">
                      <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <i class="fas fa-trophy" style="color: #2196f3; font-size: 1.1em; margin-top: 2px;"></i>
                        <div style="flex: 1;">
                          <div style="font-size: 0.8em; color: #666; line-height: 1.4;">
                            Premier podium en <strong>2015</strong> dans la catégorie "Nature"
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-col>

                  <!-- Fact 4 -->
                  <v-col cols="12" sm="6">
                    <div style="padding: 10px; background: #e8f5e9; border-radius: 8px; height: 100%;">
                      <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <i class="fas fa-heart" style="color: #e91e63; font-size: 1.1em; margin-top: 2px;"></i>
                        <div style="flex: 1;">
                          <div style="font-size: 0.8em; color: #666; line-height: 1.4;">
                            Photographe préféré: <strong>Jean-Michel</strong> (23 votes donnés)
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-col>
                </v-row>
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
          <!-- Filtres -->
          <div style="margin-bottom: 25px;">
            <v-chip-group
              v-model="badgeFilter"
              mandatory
              selected-class="text-primary"
              color="primary"
            >
              <v-chip value="all" variant="outlined">
                <v-icon start size="small">fas fa-globe</v-icon>
                Tous ({{ allBadgesCount }})
              </v-chip>
              <v-chip value="obtained" variant="outlined">
                <v-icon start size="small">fas fa-check-circle</v-icon>
                Obtenus ({{ obtainedBadgesCount }})
              </v-chip>
              <v-chip value="active" variant="outlined">
                <v-icon start size="small">fas fa-fire</v-icon>
                Actifs 3 ans ({{ activeBadgesCount }})
              </v-chip>
              <v-chip value="almostCombo" variant="outlined">
                <v-icon start size="small">fas fa-hourglass-half</v-icon>
                Combos en cours ({{ almostComboBadgesCount }})
              </v-chip>
              <v-chip value="neverObtained" variant="outlined">
                <v-icon start size="small">fas fa-lock</v-icon>
                Jamais obtenus ({{ neverObtainedBadgesCount }})
              </v-chip>
            </v-chip-group>
          </div>

          <!-- Badges Votant -->
          <div v-if="filteredVoterBadges.length > 0" style="margin-bottom: 30px;">
            <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
              <i class="fas fa-vote-yea" style="color: #2196f3;"></i>
              Badges Votant ({{ filteredVoterBadges.length }})
            </h3>
            <v-row>
              <v-col
                v-for="badge in filteredVoterBadges"
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
          <div v-if="filteredPhotographerBadges.length > 0" style="margin-bottom: 30px;">
            <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
              <i class="fas fa-camera" style="color: #ff9800;"></i>
              Badges Photographe ({{ filteredPhotographerBadges.length }})
            </h3>
            <v-row>
              <v-col
                v-for="badge in filteredPhotographerBadges"
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
          <div v-if="filteredComboBadges.length > 0">
            <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
              <i class="fas fa-puzzle-piece" style="color: #9c27b0;"></i>
              Badges Combo ({{ filteredComboBadges.length }})
            </h3>
            <div style="font-size: 0.9em; color: #666; margin-bottom: 15px; font-style: italic;">
              <i class="fas fa-info-circle" style="margin-right: 4px;"></i>
              Les badges combo nécessitent des prérequis (badges votant ou photographe)
            </div>
            <v-row>
              <v-col
                v-for="badge in filteredComboBadges"
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

          <!-- Message si aucun badge ne correspond au filtre -->
          <div
            v-if="filteredVoterBadges.length === 0 && filteredPhotographerBadges.length === 0 && filteredComboBadges.length === 0"
            style="text-align: center; padding: 50px; color: #999;"
          >
            <v-icon size="64" color="grey-lighten-2">fas fa-filter</v-icon>
            <div style="margin-top: 20px; font-size: 1.1em;">
              Aucun badge ne correspond à ce filtre
            </div>
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

    <!-- Dialog Galerie par Famille -->
    <v-dialog
      v-model="showFamilyGalleryDialog"
      max-width="1200px"
      scrollable
    >
      <v-card>
        <v-card-title style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; position: sticky; top: 0; z-index: 10;">
          <v-icon start color="white">fas fa-users</v-icon>
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
          <div v-if="loadingFamilyMembers" style="text-align: center; padding: 50px;">
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
          <div v-else-if="!loadingFamilyMembers && familyMembers.length === 0" style="text-align: center; padding: 50px;">
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

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            @click="showFamilyGalleryDialog = false"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog modale pour afficher tous les badges d'un membre -->
    <v-dialog
      v-model="memberDetailsDialog"
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
            @click="memberDetailsDialog = false"
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
        badgeFilter: 'all', // Filter for badges dialog: all, obtained, active, almostCombo, neverObtained
        // Galerie par famille
        showFamilyGalleryDialog: false,
        selectedFamily: 'gueudelot',
        familyMembers: [],
        loadingFamilyMembers: false,
        memberDetailsDialog: false,
        selectedMember: null,
        // Mode debug admin
        debugModeEnabled: false,
        debugUserId: null,
        debugUserName: '',
        allUsers: [],
    }),
    computed: {
        ...mapState(['user', 'agpaMeta']),
        isAdmin() {
            return this.user?.roles?.includes('admin') || false;
        },
        showDebugPanel() {
            return this.isAdmin && this.debugModeEnabled;
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

        // Top 3 badges les plus rares obtenus par l'utilisateur
        topRarestBadges() {
            if (!this.badgesHistory || Object.keys(this.badgesHistory).length === 0) {
                return [];
            }

            // Récupérer tous les badges actifs avec leurs métadonnées
            const activeBadges = [];
            const allBadges = [...this.voterBadges, ...this.photographerBadges, ...this.comboBadges];

            for (const badge of allBadges) {
                const badgeStatus = this.badgesHistory[badge.badge];
                if (badgeStatus && badgeStatus.isActive) {
                    activeBadges.push({
                        badge: badge,
                        status: badgeStatus
                    });
                }
            }

            // Trier par priorité: combo > progressive > rare badges
            // Priorité 1: Badges combo (les plus difficiles)
            // Priorité 2: Badges progressifs (nécessitent plusieurs années)
            // Priorité 3: Badges directs dans cet ordre de rareté
            const rarityOrder = {
                // Combo badges (très rares)
                'L\'Incompris': 1,
                'Le Couple Parfait': 2,
                'Le Perfectionniste': 3,
                'La Force Tranquille': 4,
                'L\'Expert Oublié': 5,
                'Le Solitaire': 6,
                'Le Modeste': 7,
                'Le Phénomène Discret': 8,
                'Le Philanthrope Méconnu': 9,
                'Le Généreux Invisible': 10,
                'L\'Iconoclaste': 11,
                'Le Prodige': 12,
                'Le Diplomate Étoilé': 13,
                'La Légende': 14,

                // Progressive badges (rares car nécessitent du temps)
                'L\'Habitué': 50,
                'Le Fidèle': 51,
                'Le Vétéran': 52,
                'Le Polyvalent': 53,
                'L\'Éclectique': 54,
                'L\'Artiste Complet': 55,
                'Le Productif': 56,
                'Le Prolifique': 57,
                'L\'Auteur': 58,
                'Le Créateur': 59,
                'L\'Influent': 60,
                'Le Collectionneur': 61,
                'Le Grand Collectionneur': 62,
                'Le Maître Collectionneur': 63,

                // Photographer badges (moyennement rares)
                'Le Phénomène': 100,
                'La Star': 101,
                'Le Chéri(e) de Mon Cœur': 102,
                'Le Chouchou de Famille': 103,
                'Le Transfuge': 104,
                'Le Protégé': 105,
                'La Coqueluche des Dames': 106,
                'L\'Équilibré': 107,
                'L\'Inconnu': 108,

                // Voter badges (plus communs)
                'L\'Admirateur': 150,
                'L\'Amoureux Transi': 151,
                'Le Parent Fier': 152,
                'Le Sniper': 153,
                'Féministe Convaincu': 154,
                'Le Philanthrope': 155,
                'L\'Anticonformiste': 156,
                'Le Diplomate': 157,
                'Le Radin': 158,
                'Le Mécène': 159,
                'Le Modéré': 160
            };

            activeBadges.sort((a, b) => {
                const rarityA = rarityOrder[a.badge.badge] || 999;
                const rarityB = rarityOrder[b.badge.badge] || 999;
                return rarityA - rarityB;
            });

            // Retourner les 3 premiers
            return activeBadges.slice(0, 3);
        },

        // Nombre total de badges actifs (obtenus sur les 3 dernières éditions)
        totalActiveBadges() {
            if (!this.badgesHistory || Object.keys(this.badgesHistory).length === 0) {
                return 0;
            }

            // Compter tous les badges actifs (isActive = true)
            let count = 0;
            for (const badgeName in this.badgesHistory) {
                const badgeStatus = this.badgesHistory[badgeName];
                if (badgeStatus && badgeStatus.isActive) {
                    count++;
                }
            }

            return count;
        },

        // Badge filter counts
        allBadgesCount() {
            return this.voterBadges.length + this.photographerBadges.length + this.comboBadges.length;
        },

        obtainedBadgesCount() {
            if (!this.badgesHistory || Object.keys(this.badgesHistory).length === 0) {
                return 0;
            }
            let count = 0;
            for (const badgeName in this.badgesHistory) {
                const badgeStatus = this.badgesHistory[badgeName];
                if (badgeStatus && badgeStatus.everObtained) {
                    count++;
                }
            }
            return count;
        },

        activeBadgesCount() {
            return this.totalActiveBadges; // Reuse existing computed property
        },

        almostComboBadgesCount() {
            if (!this.badgesHistory || Object.keys(this.badgesHistory).length === 0) {
                return 0;
            }

            let count = 0;
            for (const comboBadge of this.comboBadges) {
                const badgeStatus = this.badgesHistory[comboBadge.badge];

                // Skip if combo badge is already obtained
                if (badgeStatus && badgeStatus.isActive) {
                    continue;
                }

                // Check if combo has prerequisites defined
                if (!comboBadge.requires || comboBadge.requires.length === 0) {
                    continue;
                }

                // Check if user has at least one ACTIVE required badge (but not all)
                let activeCount = 0;
                for (const requiredBadge of comboBadge.requires) {
                    const requiredStatus = this.badgesHistory[requiredBadge];
                    if (requiredStatus && requiredStatus.isActive) {
                        activeCount++;
                    }
                }

                // "Almost complete" = has at least 1 active prerequisite but not all of them
                if (activeCount > 0 && activeCount < comboBadge.requires.length) {
                    count++;
                }
            }
            return count;
        },

        neverObtainedBadgesCount() {
            if (!this.badgesHistory || Object.keys(this.badgesHistory).length === 0) {
                return this.allBadgesCount;
            }

            let count = 0;
            const allBadges = [...this.voterBadges, ...this.photographerBadges, ...this.comboBadges];

            for (const badge of allBadges) {
                const badgeStatus = this.badgesHistory[badge.badge];
                if (!badgeStatus || !badgeStatus.everObtained) {
                    count++;
                }
            }
            return count;
        },

        // Filtered badge lists based on selected filter
        filteredVoterBadges() {
            return this.filterBadgesByType(this.voterBadges);
        },

        filteredPhotographerBadges() {
            return this.filterBadgesByType(this.photographerBadges);
        },

        filteredComboBadges() {
            return this.filterBadgesByType(this.comboBadges);
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
        },

        // Available sliding periods (3-year windows)
        availableSlidingPeriods() {
            const periods = [];

            // Use AGPA metadata for min/max years, fallback to reasonable defaults
            const minYear = this.agpaMeta?.minYear || 2006;
            const maxYear = this.agpaMeta?.maxYear || new Date().getFullYear();

            // Generate all possible 3-year sliding windows
            // Start from the most recent period and go backwards
            for (let yearTo = maxYear; yearTo >= minYear + 2; yearTo--) {
                periods.push({
                    from: yearTo - 2,
                    to: yearTo
                });
            }

            return periods;
        }
    },
    watch: {
        selectedFamily() {
            if (this.showFamilyGalleryDialog) {
                this.loadFamilyMembers();
            }
        },
        showFamilyGalleryDialog(newVal) {
            if (newVal) {
                this.loadFamilyMembers();
            }
        }
    },
    mounted () {
        this.initView();
        this.loadAllUsers(); // Charger la liste des utilisateurs pour le mode debug admin
        this.checkDebugMode();
        this.setupKeyboardShortcut();
    },
    beforeUnmount() {
        this.removeKeyboardShortcut();
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

        async changeSlidingPeriod(yearFrom, yearTo) {
            // Update the selected period
            this.slidingYearFrom = yearFrom;
            this.slidingYearTo = yearTo;

            // Reload sliding palmares with the selected period
            try {
                const response = await axios.get(`/api/agpa/palmares/sliding?yearFrom=${yearFrom}&yearTo=${yearTo}`);
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
                } else {
                    this.slidingPalmares = [];
                }

                // Recalculer les stats et badges pour la nouvelle période
                this.calculateMySlidingStats();
                await this.calculateMySlidingBadges();
            } catch (err) {
                console.error('Erreur lors du chargement de la période glissante:', err);
                this.slidingPalmares = [];
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
        checkDebugMode() {
            if (!this.isAdmin) return;

            // Vérifier si le query parameter debug=true est présent
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('debug') === 'true') {
                this.debugModeEnabled = true;
            }
        },

        setupKeyboardShortcut() {
            if (!this.isAdmin) return;

            this.handleKeyDown = (event) => {
                // Ctrl+Shift+D
                if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                    event.preventDefault();
                    this.debugModeEnabled = !this.debugModeEnabled;

                    // Afficher un message de confirmation
                    if (this.debugModeEnabled) {
                        console.log('[Debug Mode] Activé');
                    } else {
                        console.log('[Debug Mode] Désactivé');
                        // Réinitialiser le mode debug si désactivé
                        if (this.debugUserId) {
                            this.clearDebugMode();
                        }
                    }
                }
            };

            window.addEventListener('keydown', this.handleKeyDown);
        },

        removeKeyboardShortcut() {
            if (this.handleKeyDown) {
                window.removeEventListener('keydown', this.handleKeyDown);
            }
        },

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
                const slidingResponse = await axios.get('/api/agpa/palmares/sliding');
                const slidingData = parseAxiosResponse(slidingResponse);
                if (slidingData) {
                    this.slidingPalmares = slidingData.palmares || [];
                    this.slidingYearFrom = slidingData.yearFrom;
                    this.slidingYearTo = slidingData.yearTo;
                    this.updateMySlidingStats(userId);
                }
            } catch (error) {
                console.error('Erreur lors du chargement du palmarès:', error);
            }

            // Charger l'historique des badges (en dehors du try principal pour ne pas bloquer)
            await this.loadBadgeHistoryForUser(userId);
            await this.loadMySlidingBadgesForUser(userId);

            this.isLoading = false;
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
        },

        // Méthodes pour la galerie par famille
        async loadFamilyMembers() {
            this.loadingFamilyMembers = true;
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
                this.loadingFamilyMembers = false;
            }
        },

        showMemberDetails(member) {
            this.selectedMember = member;
            this.memberDetailsDialog = true;
        },

        onAvatarError(event) {
            // Fallback to default avatar if image not found
            event.target.src = '/files/avatars/default.png';
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
        },

        // Filter badges based on selected filter
        filterBadgesByType(badgesList) {
            if (!badgesList || badgesList.length === 0) {
                return [];
            }

            if (this.badgeFilter === 'all') {
                return badgesList;
            }

            return badgesList.filter(badge => {
                const badgeStatus = this.badgesHistory[badge.badge];

                switch (this.badgeFilter) {
                    case 'obtained':
                        // Badges obtenus au moins une fois
                        return badgeStatus && badgeStatus.everObtained;

                    case 'active':
                        // Badges actifs (obtenus sur les 3 dernières éditions)
                        return badgeStatus && badgeStatus.isActive;

                    case 'almostCombo':
                        // Only for combo badges: user has some (but not all) ACTIVE prerequisites
                        if (badge.type !== 'combo') {
                            return false;
                        }
                        if (badgeStatus && badgeStatus.isActive) {
                            return false; // Already obtained
                        }

                        // Check if combo has prerequisites defined
                        if (!badge.requires || badge.requires.length === 0) {
                            return false;
                        }

                        // Count how many ACTIVE required badges the user has
                        let activeCount = 0;
                        for (const requiredBadge of badge.requires) {
                            const requiredStatus = this.badgesHistory[requiredBadge];
                            if (requiredStatus && requiredStatus.isActive) {
                                activeCount++;
                            }
                        }

                        // Return true if user has at least 1 active prerequisite but not all of them
                        return activeCount > 0 && activeCount < badge.requires.length;

                    case 'neverObtained':
                        // Badges jamais obtenus
                        return !badgeStatus || !badgeStatus.everObtained;

                    default:
                        return true;
                }
            });
        }
    }
};
</script>


<style lang="scss" scoped>
@use '../../themes/global.scss' as *;

.member-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.member-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}
</style>
