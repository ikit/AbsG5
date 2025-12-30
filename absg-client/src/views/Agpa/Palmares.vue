<template>
  <div>
    <v-container>
      <!-- Première ligne: Palmarès, Mon Palmarès Personnel, Fun Facts -->
      <v-row style="margin-bottom: 30px;">
        <!-- Section 1: Palmarès -->
        <v-col cols="12" md="4">
          <v-card
            style="cursor: pointer; transition: transform 0.2s; height: 100%;"
            @click="showPalmaresDialog = true"
            hover
          >
            <v-card-title style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
              <v-icon start color="white">fas fa-trophy</v-icon>
              <span v-if="slidingYearFrom && slidingYearTo">
                Palmarès ({{ slidingYearFrom }} - {{ slidingYearTo }})
              </span>
              <span v-else>
                Palmarès (3 dernières éditions)
              </span>
            </v-card-title>
            <v-card-text style="padding: 30px; text-align: center;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 20px;">
                <div style="font-size: 4em; font-weight: bold; color: #667eea;">
                  <template v-if="mySlidingRank">
                    {{ mySlidingRank }}<sup style="font-size: 0.5em;">{{ getOrdinalSuffix(mySlidingRank) }}</sup>
                  </template>
                  <template v-else>
                    -
                  </template>
                </div>

                <!-- Indicateur de variation de mon rang -->
                <div v-if="myRankChange !== null && myRankChange !== undefined" style="display: flex; flex-direction: column; align-items: center;">
                  <!-- Montée au classement (rankChange négatif) -->
                  <div v-if="myRankChange < 0" style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: #e8f5e9; border-radius: 16px;">
                    <i class="fas fa-arrow-up" style="color: #4caf50; font-size: 1.5em;"></i>
                    <div style="display: flex; flex-direction: column; align-items: flex-start;">
                      <span style="color: #4caf50; font-weight: bold; font-size: 1.3em;">+{{ Math.abs(myRankChange) }}</span>
                      <span style="color: #4caf50; font-size: 0.7em;">place{{ Math.abs(myRankChange) > 1 ? 's' : '' }}</span>
                    </div>
                  </div>

                  <!-- Descente au classement (rankChange positif) -->
                  <div v-else-if="myRankChange > 0" style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: #ffebee; border-radius: 16px;">
                    <i class="fas fa-arrow-down" style="color: #f44336; font-size: 1.5em;"></i>
                    <div style="display: flex; flex-direction: column; align-items: flex-start;">
                      <span style="color: #f44336; font-weight: bold; font-size: 1.3em;">-{{ myRankChange }}</span>
                      <span style="color: #f44336; font-size: 0.7em;">place{{ myRankChange > 1 ? 's' : '' }}</span>
                    </div>
                  </div>

                  <!-- Aucun changement (rankChange === 0) -->
                  <div v-else style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: #f5f5f5; border-radius: 16px;">
                    <i class="fas fa-minus" style="color: #9e9e9e; font-size: 1.2em;"></i>
                    <span style="color: #9e9e9e; font-size: 0.8em;">Stable</span>
                  </div>
                </div>
              </div>

              <!-- Breakdown des récompenses AGPA -->
              <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin-bottom: 10px;">
                <div style="text-align: center;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                    <i class="fas fa-circle" style="color: #c68b00; font-size: 0.8em;"></i>
                    <span style="font-size: 1.8em; font-weight: bold; color: #c68b00;">{{ mySlidingAwards.gold }}</span>
                  </div>
                </div>
                <div style="text-align: center;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                    <i class="fas fa-circle" style="color: #9b9b9b; font-size: 0.8em;"></i>
                    <span style="font-size: 1.8em; font-weight: bold; color: #9b9b9b;">{{ mySlidingAwards.sylver }}</span>
                  </div>
                </div>
                <div style="text-align: center;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                    <i class="fas fa-circle" style="color: #cd7f32; font-size: 0.8em;"></i>
                    <span style="font-size: 1.8em; font-weight: bold; color: #cd7f32;">{{ mySlidingAwards.bronze }}</span>
                  </div>
                </div>
                <div style="text-align: center;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                    <i class="far fa-circle" style="color: #764ba2; font-size: 0.8em;"></i>
                    <span style="font-size: 1.8em; font-weight: bold; color: #764ba2;">{{ mySlidingAwards.nominated }}</span>
                  </div>
                </div>
              </div>
              <div style="font-size: 0.9em; color: #666;">
                <span v-if="slidingYearFrom && slidingYearTo">
                  AGPA de {{ slidingYearFrom }} à {{ slidingYearTo }}
                </span>
                <span v-else>
                  AGPA sur les 3 dernières éditions
                </span>
              </div>

              <div style="margin-top: 20px; font-size: 0.9em; color: #999; font-style: italic;">
                Cliquez pour voir le tableau complet
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Section 2: Mes Badges -->
        <v-col cols="12" md="4">
          <v-card
            style="cursor: pointer; transition: transform 0.2s; height: 100%;"
            @click="showBadgesDialog = true"
            hover
          >
            <v-card-title style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white;">
              <v-icon start color="white">fas fa-award</v-icon>
              Mes Badges
            </v-card-title>
            <v-card-text style="padding: 30px; text-align: center;">
              <!-- Compteurs de badges par type -->
              <div style="margin-bottom: 25px;">
                <div style="font-size: 0.9em; color: #666; margin-bottom: 15px;">
                  <span v-if="slidingYearFrom && slidingYearTo">
                    Badges obtenus ({{ slidingYearFrom }} - {{ slidingYearTo }})
                  </span>
                  <span v-else>
                    Badges obtenus (3 dernières éditions)
                  </span>
                </div>

                <!-- Badge Votant -->
                <div style="margin-bottom: 12px; padding: 12px; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3;">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <i class="fas fa-vote-yea" style="color: #2196f3; font-size: 1.3em;"></i>
                      <div style="font-size: 0.9em; font-weight: 600; color: #666;">Votant</div>
                    </div>
                    <div style="font-size: 1.5em; font-weight: bold; color: #2196f3;">
                      {{ countBadgesByType('voter') }}
                    </div>
                  </div>
                </div>

                <!-- Badge Photographe -->
                <div style="margin-bottom: 12px; padding: 12px; background: #fff3e0; border-radius: 8px; border-left: 4px solid #ff9800;">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <i class="fas fa-camera" style="color: #ff9800; font-size: 1.3em;"></i>
                      <div style="font-size: 0.9em; font-weight: 600; color: #666;">Photographe</div>
                    </div>
                    <div style="font-size: 1.5em; font-weight: bold; color: #ff9800;">
                      {{ countBadgesByType('photographer') }}
                    </div>
                  </div>
                </div>

                <!-- Badge Combo -->
                <div style="padding: 12px; background: #f3e5f5; border-radius: 8px; border-left: 4px solid #9c27b0;">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <i class="fas fa-puzzle-piece" style="color: #9c27b0; font-size: 1.3em;"></i>
                      <div style="font-size: 0.9em; font-weight: 600; color: #666;">Combo</div>
                    </div>
                    <div style="font-size: 1.5em; font-weight: bold; color: #9c27b0;">
                      {{ countBadgesByType('combo') }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Total -->
              <div style="padding: 15px; background: linear-gradient(135deg, #fa709a20 0%, #fee14020 100%); border-radius: 8px; margin-bottom: 15px;">
                <div style="font-size: 0.85em; color: #666; margin-bottom: 5px;">Total des badges</div>
                <div style="font-size: 2.5em; font-weight: bold; color: #fa709a;">
                  {{ mySlidingBadges.length }}
                </div>
              </div>

              <div style="font-size: 0.9em; color: #999; font-style: italic;">
                Cliquez pour voir tous les badges disponibles
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Section: Statistiques Générales (pleine largeur) -->
      <v-card style="margin-bottom: 30px;">
        <v-card-title style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
          <v-icon start color="white">fas fa-chart-line</v-icon>
          Statistiques Générales
        </v-card-title>
        <v-card-text style="padding: 20px;">
          <v-row>
            <!-- Meilleure catégorie -->
            <v-col cols="12" md="3">
              <div style="padding: 15px; background: #fff3e0; border-radius: 8px; border-left: 4px solid #ff9800; height: 100%;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                  <i class="fas fa-crown" style="color: #ff9800; font-size: 1.5em;"></i>
                  <div style="font-size: 0.9em; font-weight: 600; color: #666;">Catégorie favorite</div>
                </div>
                <div style="font-size: 1.3em; font-weight: bold; color: #333; margin-bottom: 5px;">Animaux</div>
                <div style="font-size: 0.85em; color: #666;">
                  3 <i class="fas fa-circle" style="color: #c68b00; font-size: 0.7em;"></i> ·
                  2 <i class="fas fa-circle" style="color: #9b9b9b; font-size: 0.7em;"></i> ·
                  1 <i class="fas fa-circle" style="color: #cd7f32; font-size: 0.7em;"></i>
                </div>
              </div>
            </v-col>

            <!-- Meilleure année -->
            <v-col cols="12" md="3">
              <div style="padding: 15px; background: #e8f5e9; border-radius: 8px; border-left: 4px solid #4caf50; height: 100%;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                  <i class="fas fa-calendar-star" style="color: #4caf50; font-size: 1.5em;"></i>
                  <div style="font-size: 0.9em; font-weight: 600; color: #666;">Meilleure année</div>
                </div>
                <div style="font-size: 1.3em; font-weight: bold; color: #333; margin-bottom: 5px;">2023</div>
                <div style="font-size: 0.85em; color: #666;">
                  5 récompenses · 42 points
                </div>
              </div>
            </v-col>

            <!-- Éditions participées -->
            <v-col cols="12" md="3">
              <div style="padding: 15px; background: #fce4ec; border-radius: 8px; border-left: 4px solid #e91e63; height: 100%;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                  <i class="fas fa-calendar-check" style="color: #e91e63; font-size: 1.5em;"></i>
                  <div style="font-size: 0.9em; font-weight: 600; color: #666;">Éditions</div>
                </div>
                <div style="font-size: 1.3em; font-weight: bold; color: #333; margin-bottom: 5px;">18</div>
                <div style="font-size: 0.85em; color: #666;">
                  Participation totale
                </div>
              </div>
            </v-col>

            <!-- Photos soumises -->
            <v-col cols="12" md="3">
              <div style="padding: 15px; background: #e1f5fe; border-radius: 8px; border-left: 4px solid #03a9f4; height: 100%;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                  <i class="fas fa-images" style="color: #03a9f4; font-size: 1.5em;"></i>
                  <div style="font-size: 0.9em; font-weight: 600; color: #666;">Photos soumises</div>
                </div>
                <div style="font-size: 1.3em; font-weight: bold; color: #333; margin-bottom: 5px;">156</div>
                <div style="font-size: 0.85em; color: #666;">
                  Au total
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Fun Facts -->
          <v-row style="margin-top: 20px;">
            <v-col cols="12" md="3">
              <div style="padding: 12px; background: #fff9e6; border-radius: 8px;">
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                  <i class="fas fa-lightbulb" style="color: #ffc107; font-size: 1.3em; margin-top: 2px;"></i>
                  <div style="flex: 1;">
                    <div style="font-size: 0.85em; color: #666; line-height: 1.4;">
                      Vous avez voté pour <strong>127 photos</strong> différentes lors de l'édition 2024
                    </div>
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="3">
              <div style="padding: 12px; background: #f3e5f5; border-radius: 8px;">
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                  <i class="fas fa-fire" style="color: #9c27b0; font-size: 1.3em; margin-top: 2px;"></i>
                  <div style="flex: 1;">
                    <div style="font-size: 0.85em; color: #666; line-height: 1.4;">
                      Votre série la plus longue: <strong>12 éditions</strong> consécutives
                    </div>
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="3">
              <div style="padding: 12px; background: #e3f2fd; border-radius: 8px;">
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                  <i class="fas fa-trophy" style="color: #2196f3; font-size: 1.3em; margin-top: 2px;"></i>
                  <div style="flex: 1;">
                    <div style="font-size: 0.85em; color: #666; line-height: 1.4;">
                      Premier podium en <strong>2015</strong> dans la catégorie "Nature"
                    </div>
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="3">
              <div style="padding: 12px; background: #e8f5e9; border-radius: 8px;">
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                  <i class="fas fa-heart" style="color: #e91e63; font-size: 1.3em; margin-top: 2px;"></i>
                  <div style="flex: 1;">
                    <div style="font-size: 0.85em; color: #666; line-height: 1.4;">
                      Photographe préféré: <strong>Jean-Michel</strong> (23 votes donnés)
                    </div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Dialog Palmarès Unifié -->
    <v-dialog
      v-model="showPalmaresDialog"
      max-width="1200px"
      scrollable
    >
      <v-card>
        <v-card-title style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; position: sticky; top: 0; z-index: 10;">
          <v-icon start color="white">fas fa-trophy</v-icon>
          Palmarès Complet
        </v-card-title>

        <!-- Tabs pour basculer entre Glissant et Global -->
        <v-tabs
          v-model="palmaresTab"
          color="white"
        >
          <v-tab value="sliding">
            <v-icon start>fas fa-chart-line</v-icon>
            <span v-if="slidingYearFrom && slidingYearTo">
              {{ slidingYearFrom }} - {{ slidingYearTo }}
            </span>
            <span v-else>
              3 dernières éditions
            </span>
          </v-tab>
          <v-tab value="global">
            <v-icon start>fas fa-history</v-icon>
            Depuis le début
          </v-tab>
        </v-tabs>

        <v-card-text style="padding: 20px;">
          <v-window v-model="palmaresTab">
            <!-- Tab Palmarès Glissant -->
            <v-window-item value="sliding">
              <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                <v-text-field
                  v-model="filter.searchSliding"
                  prepend-icon="fas fa-search"
                  label="Rechercher"
                  single-line
                  hide-details
                  style="flex: 1; min-width: 250px;"
                />
                <v-select
                  v-model="filter.familyFilterSliding"
                  :items="familyOptions"
                  label="Filtrer par famille"
                  clearable
                  hide-details
                  style="flex: 0 0 200px; min-width: 200px;"
                />
              </div>
              <v-data-table
                :headers="headers"
                :items="filteredSlidingPalmares"
                :loading="isLoading"
                loading-text="Récupération des données..."
                no-data-text="Aucun palmarès disponible."
                no-results-text="Aucune personne trouvée."
                disable-sort
              >
              <template #[`item.photographe`]="{ item }">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img
                    :src="item.url"
                    style="height: 40px;"
                  >
                  <span style="font-size: 1.2em">{{ item.username }}</span>

                  <!-- Indicateur de variation de rang -->
                  <div v-if="item.rankChange !== null && item.rankChange !== undefined" style="display: flex; align-items: center;">
                    <!-- Montée au classement (rankChange négatif) -->
                    <v-tooltip v-if="item.rankChange < 0" location="top">
                      <template #activator="{ props }">
                        <div v-bind="props" style="display: flex; align-items: center; gap: 4px; padding: 4px 8px; background: #e8f5e9; border-radius: 12px;">
                          <i class="fas fa-arrow-up" style="color: #4caf50; font-size: 0.9em;"></i>
                          <span style="color: #4caf50; font-weight: bold; font-size: 0.85em;">{{ Math.abs(item.rankChange) }}</span>
                        </div>
                      </template>
                      <span>Montée de {{ Math.abs(item.rankChange) }} place{{ Math.abs(item.rankChange) > 1 ? 's' : '' }}</span>
                    </v-tooltip>

                    <!-- Descente au classement (rankChange positif) -->
                    <v-tooltip v-else-if="item.rankChange > 0" location="top">
                      <template #activator="{ props }">
                        <div v-bind="props" style="display: flex; align-items: center; gap: 4px; padding: 4px 8px; background: #ffebee; border-radius: 12px;">
                          <i class="fas fa-arrow-down" style="color: #f44336; font-size: 0.9em;"></i>
                          <span style="color: #f44336; font-weight: bold; font-size: 0.85em;">{{ item.rankChange }}</span>
                        </div>
                      </template>
                      <span>Descente de {{ item.rankChange }} place{{ item.rankChange > 1 ? 's' : '' }}</span>
                    </v-tooltip>

                    <!-- Aucun changement (rankChange === 0) -->
                    <v-tooltip v-else location="top">
                      <template #activator="{ props }">
                        <div v-bind="props" style="display: flex; align-items: center; padding: 4px 8px; background: #f5f5f5; border-radius: 12px;">
                          <i class="fas fa-minus" style="color: #9e9e9e; font-size: 0.9em;"></i>
                        </div>
                      </template>
                      <span>Position stable</span>
                    </v-tooltip>
                  </div>

                  <!-- Badge "Nouveau" pour les participants sans historique -->
                  <v-tooltip v-else-if="item.rankChange === null" location="top">
                    <template #activator="{ props }">
                      <div v-bind="props" style="padding: 4px 8px; background: #fff3e0; border-radius: 12px;">
                        <i class="fas fa-star" style="color: #ff9800; font-size: 0.9em;"></i>
                      </div>
                    </template>
                    <span>Nouveau dans le classement</span>
                  </v-tooltip>
                </div>
              </template>

              <template #[`item.awards`]="{ item }">
                <template v-if="item.awards.diamond">
                  <i
                    class="fas fa-circle"
                    style="color: #c3f1ff"
                  /> {{ item.awards.diamond }}
                </template>
                <template v-if="item.awards.gold">
                  <i
                    class="fas fa-circle"
                    style="color: #c68b00"
                  /> {{ item.awards.gold }}
                </template>
                <template v-if="item.awards.sylver">
                  <i
                    class="fas fa-circle"
                    style="color: #9b9b9b"
                  /> {{ item.awards.sylver }}
                </template>
                <template v-if="item.awards.bronze">
                  <i
                    class="fas fa-circle"
                    style="color: #964c31"
                  /> {{ item.awards.bronze }}
                </template>
                <template v-if="item.awards.nominated">
                  <i class="far fa-circle" /> {{ item.awards.nominated }}
                </template>
                <template v-if="item.awards.honor">
                  <i class="far fa-smile" /> {{ item.awards.honor }}
                </template>
              </template>

              <template #[`item.score`]="{ item }">
                <span style="font-weight: bold">{{ item.totalPoints }} </span> <template v-if="item.totalPoints > 1">
                  pts
                </template><template v-else>
                  pt
                </template>
              </template>

              <template #[`item.participation`]="{ item }">
                <span style="font-weight: bold">{{ item.participation.total }}</span> fois
                <template v-if="item.participation.first != item.participation.last">
                  <span style="font-style: italic; opacity: 0.5">(de {{ item.participation.first }} à {{ item.participation.last }})</span>
                </template>
                <template v-else>
                  <span style="font-style: italic; opacity: 0.5">(en {{ item.participation.first }})</span>
                </template>
              </template>

              <template #[`item.bestYear`]="{ item }">
                <v-tooltip
                  v-if="item.bestYear && item.bestYear.stats && item.bestYear.stats[7] > 0"
                  right
                >
                  <template #activator="{ props }">
                    <span v-bind="props">{{ item.bestYear.year }}
                      <span style="opacity: 0.5">({{ item.bestYear.stats[6] }} awards - {{ item.bestYear.stats[7] }} pts)</span>
                    </span>
                  </template>

                  <template v-if="item.bestYear.stats[5]">
                    <i
                      class="fas fa-circle"
                      style="color: #c3f1ff"
                    /> {{ item.bestYear.stats[5] }}
                  </template>
                  <template v-if="item.bestYear.stats[4]">
                    <i
                      class="fas fa-circle"
                      style="color: #c68b00"
                    /> {{ item.bestYear.stats[4] }}
                  </template>
                  <template v-if="item.bestYear.stats[3]">
                    <i
                      class="fas fa-circle"
                      style="color: #9b9b9b"
                    /> {{ item.bestYear.stats[3] }}
                  </template>
                  <template v-if="item.bestYear.stats[2]">
                    <i
                      class="fas fa-circle"
                      style="color: #964c31"
                    /> {{ item.bestYear.stats[2] }}
                  </template>
                  <template v-if="item.bestYear.stats[0]">
                    <i class="far fa-smile" /> {{ item.bestYear.stats[0] }}
                  </template>
                </v-tooltip>
              </template>

              <template #[`item.bestCat`]="{ item }">
                <v-tooltip
                  v-if="item.bestCat && item.bestCat.stats && item.bestCat.stats[6] > 0"
                  right
                >
                  <template #activator="{ props }">
                    <span v-bind="props">{{ item.bestCat.title }}
                      <span style="opacity: 0.5">({{ item.bestCat.stats[5] }} awards - {{ item.bestCat.stats[6] }} pts)</span>
                    </span>
                  </template>

                  <template v-if="item.bestCat.stats[4]">
                    <i
                      class="fas fa-circle"
                      style="color: #c3f1ff"
                    /> {{ item.bestCat.stats[4] }}
                  </template>
                  <template v-if="item.bestCat.stats[3]">
                    <i
                      class="fas fa-circle"
                      style="color: #c68b00"
                    /> {{ item.bestCat.stats[3] }}
                  </template>
                  <template v-if="item.bestCat.stats[2]">
                    <i
                      class="fas fa-circle"
                      style="color: #9b9b9b"
                    /> {{ item.bestCat.stats[2] }}
                  </template>
                  <template v-if="item.bestCat.stats[1]">
                    <i
                      class="fas fa-circle"
                      style="color: #964c31"
                    /> {{ item.bestCat.stats[1] }}
                  </template>
                  <template v-if="item.bestCat.stats[0]">
                    <i class="far fa-circle" /> {{ item.bestCat.stats[0] }}
                  </template>
                </v-tooltip>
              </template>

              <template #[`item.actions`]="{ item }">
                <v-icon
                  small
                  class="mr-2"
                  @click="displaydetails(item)"
                >
                  fa-search
                </v-icon>
              </template>
            </v-data-table>
            </v-window-item>

            <!-- Tab Palmarès Global -->
            <v-window-item value="global">
              <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                <v-text-field
                  v-model="filter.search"
                  prepend-icon="fas fa-search"
                  label="Rechercher"
                  single-line
                  hide-details
                  style="flex: 1; min-width: 250px;"
                />
                <v-select
                  v-model="filter.familyFilter"
                  :items="familyOptions"
                  label="Filtrer par famille"
                  clearable
                  hide-details
                  style="flex: 0 0 200px; min-width: 200px;"
                />
              </div>
          <v-data-table
            :headers="headers"
            :items="filteredPalmares"
            :loading="isLoading"
            loading-text="Récupération des données..."
            no-data-text="Aucun palmarès disponible."
            no-results-text="Aucune personne trouvée."
            disable-sort
          >
          <template #[`item.photographe`]="{ item }">
            <img
              :src="item.url"
              style="height: 40px; margin-right: 15px; vertical-align: middle"
            >
            <span style="font-size: 1.2em">{{ item.username }}</span>
          </template>

          <template #[`item.awards`]="{ item }">
            <template v-if="item.awards.diamond">
              <i
                class="fas fa-circle"
                style="color: #c3f1ff"
              /> {{ item.awards.diamond }}
            </template>
            <template v-if="item.awards.gold">
              <i
                class="fas fa-circle"
                style="color: #c68b00"
              /> {{ item.awards.gold }}
            </template>
            <template v-if="item.awards.sylver">
              <i
                class="fas fa-circle"
                style="color: #9b9b9b"
              /> {{ item.awards.sylver }}
            </template>
            <template v-if="item.awards.bronze">
              <i
                class="fas fa-circle"
                style="color: #964c31"
              /> {{ item.awards.bronze }}
            </template>
            <template v-if="item.awards.nominated">
              <i class="far fa-circle" /> {{ item.awards.nominated }}
            </template>
            <template v-if="item.awards.honor">
              <i class="far fa-smile" /> {{ item.awards.honor }}
            </template>
          </template>

          <template #[`item.score`]="{ item }">
            <span style="font-weight: bold">{{ item.totalPoints }} </span> <template v-if="item.totalPoints > 1">
              pts
            </template><template v-else>
              pt
            </template>
          </template>

          <template #[`item.participation`]="{ item }">
            <span style="font-weight: bold">{{ item.participation.total }}</span> fois
            <template v-if="item.participation.first != item.participation.last">
              <span style="font-style: italic; opacity: 0.5">(de {{ item.participation.first }} à {{ item.participation.last }})</span>
            </template>
            <template v-else>
              <span style="font-style: italic; opacity: 0.5">(en {{ item.participation.first }})</span>
            </template>
          </template>

          <template #[`item.bestYear`]="{ item }">
            <v-tooltip
              v-if="item.bestYear && item.bestYear.stats && item.bestYear.stats[7] > 0"
              right
            >
              <template #activator="{ props }">
                <span v-bind="props">{{ item.bestYear.year }}
                  <span style="opacity: 0.5">({{ item.bestYear.stats[6] }} awards - {{ item.bestYear.stats[7] }} pts)</span>
                </span>
              </template>

              <template v-if="item.bestYear.stats[5]">
                <i
                  class="fas fa-circle"
                  style="color: #c3f1ff"
                /> {{ item.bestYear.stats[5] }}
              </template>
              <template v-if="item.bestYear.stats[4]">
                <i
                  class="fas fa-circle"
                  style="color: #c68b00"
                /> {{ item.bestYear.stats[4] }}
              </template>
              <template v-if="item.bestYear.stats[3]">
                <i
                  class="fas fa-circle"
                  style="color: #9b9b9b"
                /> {{ item.bestYear.stats[3] }}
              </template>
              <template v-if="item.bestYear.stats[2]">
                <i
                  class="fas fa-circle"
                  style="color: #964c31"
                /> {{ item.bestYear.stats[2] }}
              </template>
              <template v-if="item.bestYear.stats[0]">
                <i class="far fa-smile" /> {{ item.bestYear.stats[0] }}
              </template>
            </v-tooltip>
          </template>

          <template #[`item.bestCat`]="{ item }">
            <v-tooltip
              v-if="item.bestCat && item.bestCat.stats && item.bestCat.stats[6] > 0"
              right
            >
              <template #activator="{ props }">
                <span v-bind="props">{{ item.bestCat.title }}
                  <span style="opacity: 0.5">({{ item.bestCat.stats[5] }} awards - {{ item.bestCat.stats[6] }} pts)</span>
                </span>
              </template>

              <template v-if="item.bestCat.stats[4]">
                <i
                  class="fas fa-circle"
                  style="color: #c3f1ff"
                /> {{ item.bestCat.stats[4] }}
              </template>
              <template v-if="item.bestCat.stats[3]">
                <i
                  class="fas fa-circle"
                  style="color: #c68b00"
                /> {{ item.bestCat.stats[3] }}
              </template>
              <template v-if="item.bestCat.stats[2]">
                <i
                  class="fas fa-circle"
                  style="color: #9b9b9b"
                /> {{ item.bestCat.stats[2] }}
              </template>
              <template v-if="item.bestCat.stats[1]">
                <i
                  class="fas fa-circle"
                  style="color: #964c31"
                /> {{ item.bestCat.stats[1] }}
              </template>
              <template v-if="item.bestCat.stats[0]">
                <i class="far fa-circle" /> {{ item.bestCat.stats[0] }}
              </template>
            </v-tooltip>
          </template>



          <template #[`item.actions`]="{ item }">
            <v-icon
              small
              class="mr-2"
              @click="displaydetails(item)"
            >
              fa-search
            </v-icon>
          </template>
            </v-data-table>
            </v-window-item>
          </v-window>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            @click="showPalmaresDialog = false"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { getBadgesByType } from '../../middleware/badgesMetadata';

export default {
    name: 'Palmares',
    components: {
        BadgeCard
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
    }),
    computed: {
        ...mapState(['user']),

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
        }
    }
};
</script>


<style lang="scss" scoped>
@use '../../themes/global.scss' as *;
</style>
