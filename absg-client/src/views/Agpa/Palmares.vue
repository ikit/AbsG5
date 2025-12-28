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
              <div style="font-size: 4em; font-weight: bold; color: #667eea; margin-bottom: 20px;">
                <template v-if="mySlidingRank">
                  {{ mySlidingRank }}<sup style="font-size: 0.5em;">{{ getOrdinalSuffix(mySlidingRank) }}</sup>
                </template>
                <template v-else>
                  -
                </template>
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
                <div style="margin-bottom: 12px; padding: 12px; background: #f3e5f5; border-radius: 8px; border-left: 4px solid #9c27b0;">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <i class="fas fa-star" style="color: #9c27b0; font-size: 1.3em;"></i>
                      <div style="font-size: 0.9em; font-weight: 600; color: #666;">Combo</div>
                    </div>
                    <div style="font-size: 1.5em; font-weight: bold; color: #9c27b0;">
                      {{ countBadgesByType('combo') }}
                    </div>
                  </div>
                </div>

                <!-- Badge Évolution -->
                <div style="padding: 12px; background: #e8f5e9; border-radius: 8px; border-left: 4px solid #4caf50;">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <i class="fas fa-chart-line" style="color: #4caf50; font-size: 1.3em;"></i>
                      <div style="font-size: 0.9em; font-weight: 600; color: #666;">Évolution</div>
                    </div>
                    <div style="font-size: 1.5em; font-weight: bold; color: #4caf50;">
                      {{ countBadgesByType('sliding') }}
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
          <!-- Badges Votant -->
          <div style="margin-bottom: 30px;">
            <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
              <i class="fas fa-vote-yea" style="color: #2196f3;"></i>
              Badges Votant (11)
            </h3>
            <v-row>
              <v-col
                v-for="badge in voterBadges"
                :key="badge.badge"
                cols="12"
                sm="6"
                md="4"
              >
                <div
                  :style="{
                    padding: '15px',
                    borderRadius: '8px',
                    backgroundColor: badge.color + '20',
                    border: '2px solid ' + badge.color,
                    height: '100%'
                  }"
                >
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <i :class="badge.icon" :style="{ color: badge.color, fontSize: '1.5em' }"></i>
                    <div style="font-size: 1.1em; font-weight: bold; color: #333;">{{ badge.badge }}</div>
                  </div>
                  <div style="font-size: 0.9em; color: #666; margin-bottom: 8px;">{{ badge.description }}</div>
                  <div style="font-size: 0.75em; color: #999; font-style: italic; padding: 6px 8px; background: rgba(0,0,0,0.05); border-radius: 4px;">
                    <i class="fas fa-info-circle" style="margin-right: 4px;"></i>{{ badge.condition }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Badges Photographe -->
          <div style="margin-bottom: 30px;">
            <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
              <i class="fas fa-camera" style="color: #ff9800;"></i>
              Badges Photographe (9)
            </h3>
            <v-row>
              <v-col
                v-for="badge in photographerBadges"
                :key="badge.badge"
                cols="12"
                sm="6"
                md="4"
              >
                <div
                  :style="{
                    padding: '15px',
                    borderRadius: '8px',
                    backgroundColor: badge.color + '20',
                    border: '2px solid ' + badge.color,
                    height: '100%'
                  }"
                >
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <i :class="badge.icon" :style="{ color: badge.color, fontSize: '1.5em' }"></i>
                    <div style="font-size: 1.1em; font-weight: bold; color: #333;">{{ badge.badge }}</div>
                  </div>
                  <div style="font-size: 0.9em; color: #666; margin-bottom: 8px;">{{ badge.description }}</div>
                  <div style="font-size: 0.75em; color: #999; font-style: italic; padding: 6px 8px; background: rgba(0,0,0,0.05); border-radius: 4px;">
                    <i class="fas fa-info-circle" style="margin-right: 4px;"></i>{{ badge.condition }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Badges Combo -->
          <div style="margin-bottom: 30px;">
            <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
              <i class="fas fa-star" style="color: #9c27b0;"></i>
              Badges Combo (14)
            </h3>
            <v-row>
              <v-col
                v-for="badge in comboBadges"
                :key="badge.badge"
                cols="12"
                sm="6"
                md="4"
              >
                <div
                  :style="{
                    padding: '15px',
                    borderRadius: '8px',
                    backgroundColor: badge.color + '20',
                    border: '2px solid ' + badge.color,
                    height: '100%'
                  }"
                >
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <i :class="badge.icon" :style="{ color: badge.color, fontSize: '1.5em' }"></i>
                    <div style="font-size: 1.1em; font-weight: bold; color: #333;">{{ badge.badge }}</div>
                  </div>
                  <div style="font-size: 0.9em; color: #666; margin-bottom: 8px;">{{ badge.description }}</div>
                  <div style="font-size: 0.75em; color: #999; font-style: italic; padding: 6px 8px; background: rgba(0,0,0,0.05); border-radius: 4px;">
                    <i class="fas fa-info-circle" style="margin-right: 4px;"></i>{{ badge.condition }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Badges d'Évolution -->
          <div>
            <h3 style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
              <i class="fas fa-chart-line" style="color: #4caf50;"></i>
              Badges d'Évolution (14)
            </h3>
            <div style="font-size: 0.9em; color: #666; margin-bottom: 15px; font-style: italic;">
              <i class="fas fa-calendar-alt" style="margin-right: 4px;"></i>
              Badges calculés sur les 3 dernières éditions
            </div>
            <v-row>
              <v-col
                v-for="badge in slidingBadges"
                :key="badge.badge"
                cols="12"
                sm="6"
                md="4"
              >
                <div
                  :style="{
                    padding: '15px',
                    borderRadius: '8px',
                    backgroundColor: badge.color + '20',
                    border: '2px solid ' + badge.color,
                    height: '100%'
                  }"
                >
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <i :class="badge.icon" :style="{ color: badge.color, fontSize: '1.5em' }"></i>
                    <div style="font-size: 1.1em; font-weight: bold; color: #333;">{{ badge.badge }}</div>
                  </div>
                  <div style="font-size: 0.9em; color: #666; margin-bottom: 8px;">{{ badge.description }}</div>
                  <div style="font-size: 0.75em; color: #999; font-style: italic; padding: 6px 8px; background: rgba(0,0,0,0.05); border-radius: 4px;">
                    <i class="fas fa-info-circle" style="margin-right: 4px;"></i>{{ badge.condition }}
                  </div>
                </div>
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

export default {
    name: 'Palmares',
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
        slidingYearFrom: null,
        slidingYearTo: null,
        myGlobalBadges: null,
        mySlidingBadges: [],
        voteProfiles: {},
        showBadgesDialog: false,
        voterBadges: [
            { badge: 'Le Patriote', icon: 'fas fa-flag', description: 'Vote principalement pour sa famille', condition: '> 70% des votes pour sa famille', color: '#3f51b5' },
            { badge: 'L\'Amoureux Transi', icon: 'fas fa-heart', description: 'Vote beaucoup pour son/sa conjoint(e)', condition: '> 50% des votes pour son conjoint', color: '#e91e63' },
            { badge: 'Le Parent Fier', icon: 'fas fa-baby', description: 'Vote beaucoup pour ses enfants', condition: '> 50% des votes pour ses enfants', color: '#ff9800' },
            { badge: 'Le Sniper', icon: 'fas fa-bullseye', description: 'J\'ai mes favoris et je m\'y tiens', condition: '> 60% des votes sur 2 personnes max', color: '#f44336' },
            { badge: 'Féministe Convaincu', icon: 'fas fa-fist-raised', description: 'Les femmes d\'abord !', condition: '≥ 70% des votes pour des femmes + > 20 pts', color: '#9c27b0' },
            { badge: 'Le Philanthrope', icon: 'fas fa-hand-holding-heart', description: 'Il y a du talent partout !', condition: '≥ 8 personnes différentes ont reçu des votes', color: '#9c27b0' },
            { badge: 'L\'Anticonformiste', icon: 'fas fa-star-of-life', description: 'L\'herbe est plus verte ailleurs', condition: '< 30% des votes pour sa famille + > 20 pts', color: '#00bcd4' },
            { badge: 'Le Diplomate', icon: 'fas fa-handshake', description: 'Un vote pour chacun, équité pour tous', condition: 'Votes équilibrés entre familles + ≥ 5 personnes', color: '#4caf50' },
            { badge: 'Le Radin', icon: 'fas fa-piggy-bank', description: 'Faut le mériter !', condition: '< 30 points distribués au total', color: '#795548' },
            { badge: 'Le Mécène', icon: 'fas fa-gift', description: 'Tout le monde est talentueux !', condition: '> 100 points distribués au total', color: '#ffd700' },
            { badge: 'Le Modéré', icon: 'fas fa-check', description: 'Ni trop, ni trop peu', condition: 'Badge par défaut (équilibré)', color: '#607d8b' }
        ],
        photographerBadges: [
            { badge: 'Le Phénomène', icon: 'fas fa-rocket', description: 'Populaire et reconnu', condition: '> 80 points reçus + ≥ 8 votants', color: '#ff6f00' },
            { badge: 'La Star', icon: 'fas fa-star', description: 'Très apprécié par beaucoup', condition: '≥ 8 votants différents', color: '#ffd700' },
            { badge: 'Le Chouchou de Famille', icon: 'fas fa-home', description: 'Très apprécié par sa famille', condition: '> 70% des votes de sa famille + > 20 pts', color: '#3f51b5' },
            { badge: 'Le Transfuge', icon: 'fas fa-exchange-alt', description: 'Apprécié hors de sa famille', condition: '< 30% des votes de sa famille + > 30 pts', color: '#00bcd4' },
            { badge: 'Le Protégé', icon: 'fas fa-crown', description: 'J\'ai mes champions', condition: '≤ 3 votants + > 30 points reçus', color: '#e91e63' },
            { badge: 'La Coqueluche des Dames', icon: 'fas fa-heart', description: 'Apprécié par les femmes', condition: '≥ 70% des votes de femmes + > 20 pts', color: '#e91e63' },
            { badge: 'L\'Équilibré', icon: 'fas fa-balance-scale', description: 'Je plais à tout le monde modérément', condition: 'Votes équilibrés entre ≥ 3 familles', color: '#4caf50' },
            { badge: 'L\'Inconnu', icon: 'fas fa-ghost', description: 'Qui suis-je ?', condition: '< 15 points reçus au total', color: '#9e9e9e' },
            { badge: 'Le Talent Émergent', icon: 'fas fa-seedling', description: 'En progression', condition: 'Badge par défaut', color: '#8bc34a' }
        ],
        comboBadges: [
            { badge: 'Le Solitaire', icon: 'fas fa-island-tropical', description: 'Discret en tout point', condition: '< 20 pts donnés + < 20 pts reçus', color: '#607d8b' },
            { badge: 'L\'Égoïste', icon: 'fas fa-user-crown', description: 'Je reçois plus que je ne donne', condition: 'Badge "Le Radin" + > 50 pts reçus', color: '#9c27b0' },
            { badge: 'Le Robin des Bois', icon: 'fas fa-bow-arrow', description: 'Généreux malgré l\'oubli', condition: '> 80 pts donnés + < 30 pts reçus', color: '#4caf50' },
            { badge: 'L\'Influenceur', icon: 'fas fa-star-shooting', description: 'Populaire et généreux', condition: 'Badge "La Star" + > 60 pts donnés', color: '#ff9800' },
            { badge: 'Le Clan', icon: 'fas fa-users', description: 'Ma famille et moi, c\'est pour la vie', condition: 'Badges "Le Patriote" + "Chouchou de Famille"', color: '#3f51b5' },
            { badge: 'Le Rebelle', icon: 'fas fa-dragon', description: 'Loin de ma famille, dans les deux sens', condition: 'Badges "L\'Anticonformiste" + "Le Transfuge"', color: '#00bcd4' },
            { badge: 'Le Fan Club', icon: 'fas fa-crown', description: 'J\'ai mes favoris et ils me le rendent', condition: 'Badges "Le Sniper" + "Le Protégé"', color: '#e91e63' },
            { badge: 'Le Politique', icon: 'fas fa-balance-scale-right', description: 'Équilibre parfait donné/reçu', condition: 'Badges "Le Diplomate" + "L\'Équilibré"', color: '#4caf50' },
            { badge: 'Le Phénomène Total', icon: 'fas fa-meteor', description: 'La légende absolue des AGPA', condition: '> 100 pts donnés + Badge "Le Phénomène"', color: '#ffd700' },
            { badge: 'Le Couple Parfait', icon: 'fas fa-heart', description: 'L\'amour est réciproque', condition: 'Badge "Amoureux Transi" + > 40% pts reçus du conjoint', color: '#e91e63' },
            { badge: 'L\'Incompris', icon: 'fas fa-sad-tear', description: 'Je donne à tous mais personne ne me voit', condition: 'Badge "Le Philanthrope" + (Badge "L\'Inconnu" ou < 15 pts reçus)', color: '#9e9e9e' },
            { badge: 'Le Revenant', icon: 'fas fa-ghost', description: 'Peu présent mais marquant', condition: '< 10 votes donnés + > 40 pts reçus', color: '#673ab7' },
            { badge: 'La Superstar', icon: 'fas fa-sparkles', description: 'Excellence en tout point', condition: '> 70 pts donnés + > 70 pts reçus + > 7 votants', color: '#ff6f00' },
            { badge: 'Girl Power', icon: 'fas fa-venus', description: 'Engagement féministe total', condition: 'Badges "Féministe Convaincu" + "Coqueluche des Dames"', color: '#9c27b0' }
        ],
        slidingBadges: [
            { badge: 'L\'Alpiniste', icon: 'fas fa-mountain', description: 'Progression continue vers le sommet', condition: 'Progression continue sur 3 ans + ≥ 1 or en dernière année', color: '#2196f3' },
            { badge: 'La Fusée', icon: 'fas fa-rocket-launch', description: 'Décollage spectaculaire', condition: 'Progression x3 minimum sur 3 ans', color: '#ff5722' },
            { badge: 'Le Régulier', icon: 'fas fa-chart-line', description: 'Performance stable et constante', condition: 'Variance < 15% avec moyenne ≥ 30 pts/an', color: '#4caf50' },
            { badge: 'Le Dinosaure', icon: 'fas fa-dragon', description: 'Les beaux jours sont derrière', condition: 'Régression continue sur 3 ans (départ ≥ 40 pts)', color: '#795548' },
            { badge: 'Le Yoyo', icon: 'fas fa-arrows-up-down', description: 'Performance en montagnes russes', condition: 'Alternance haut/bas avec écarts > 50%', color: '#ff9800' },
            { badge: 'L\'Incendie', icon: 'fas fa-fire', description: '3+ médailles d\'or sur 3 ans', condition: '≥ 3 médailles d\'or cumulées sur 3 ans', color: '#ffd700' },
            { badge: 'La Révélation', icon: 'fas fa-star-shooting', description: 'De l\'ombre à la lumière', condition: '0 pts année 1 + progression forte années 2-3', color: '#9c27b0' },
            { badge: 'Le Vétéran', icon: 'fas fa-medal', description: 'Sur le podium tous les ans', condition: 'Au moins 1 podium chaque année sur 3 ans', color: '#ff6f00' },
            { badge: 'Le Sniper Temporel', icon: 'fas fa-bullseye', description: 'Spécialiste d\'une catégorie', condition: 'Même catégorie gagnée 2-3 fois sur 3 ans', color: '#f44336' },
            { badge: 'Le Phoenix', icon: 'fas fa-phoenix-squadron', description: 'Renaît de ses cendres', condition: 'Chute > 50% puis remontée > 120% de l\'année 1', color: '#e91e63' },
            { badge: 'Le Tsunami', icon: 'fas fa-water', description: 'Arrivée fracassante', condition: '0 pts année 1 + ≥ 2 ors année 2', color: '#00bcd4' },
            { badge: 'Le Fidèle', icon: 'fas fa-handshake', description: 'Toujours présent, toujours actif', condition: '≥ 15 pts par an sur les 3 années', color: '#607d8b' },
            { badge: 'Le Podium Addict', icon: 'fas fa-trophy', description: '5+ podiums sur 3 ans', condition: '≥ 5 podiums cumulés sur 3 ans', color: '#cddc39' },
            { badge: 'L\'Éclair', icon: 'fas fa-bolt', description: 'Retour fracassant', condition: '0 pts années 1-2 + ≥ 40 pts année 3', color: '#ffeb3b' },
            // Badges de Collection
            { badge: 'Le Collectionneur', icon: 'fas fa-medal', description: 'Collection complète', condition: 'Exactement 1 Or + 1 Argent + 1 Bronze en 1 édition', color: '#9c27b0' },
            { badge: 'Le Perfectionniste', icon: 'fas fa-crown', description: 'Ors purs', condition: 'Uniquement des Ors (≥2) sans autre récompense en 1 édition', color: '#ffd700' },
            { badge: 'Le Monopole', icon: 'fas fa-chess-king', description: 'Domination totale', condition: '5+ Ors en 1 édition', color: '#ff6f00' },
            { badge: 'La Razzia', icon: 'fas fa-bullseye', description: 'Catégories dominées', condition: '4+ catégories gagnées en 1 édition', color: '#e91e63' },
            // Badges de Domination
            { badge: 'Le Triplé', icon: 'fas fa-fire', description: 'Triple or', condition: '3+ Ors en 1 édition', color: '#ff9800' },
            { badge: 'Le Doublé', icon: 'fas fa-gem', description: 'Double argent', condition: 'Exactement 2 Argents en 1 édition', color: '#c0c0c0' },
            { badge: 'Le Balayage Bronze', icon: 'fas fa-broom', description: 'Collection de bronze', condition: '4+ Bronzes en 1 édition', color: '#cd7f32' },
            { badge: 'L\'Arc-en-ciel', icon: 'fas fa-rainbow', description: 'Palette complète', condition: '≥2 de chaque type (Or + Argent + Bronze) en 1 édition', color: '#00bcd4' },
            // Badges de Progression
            { badge: 'L\'Escalade', icon: 'fas fa-mountain', description: 'Progression parfaite', condition: 'Bronze → Argent → Or dans la même catégorie sur 3 ans', color: '#795548' },
            { badge: 'Le Sans-Faute', icon: 'fas fa-check-double', description: 'Constance exemplaire', condition: 'Au moins 1 AGPA chaque année sur 3 ans', color: '#4caf50' },
            { badge: 'La Rédemption', icon: 'fas fa-redo', description: 'Retour victorieux', condition: '0 AGPA année N, puis Or année N+1 dans la même catégorie', color: '#ff5722' },
            // Badges de Patterns Spéciaux
            { badge: 'La Pyramide', icon: 'fas fa-caret-up', description: 'Pattern parfait', condition: '1 Or + 2 Argents + 3 Bronzes en 1 édition', color: '#607d8b' },
            { badge: 'La Pyramide Inversée', icon: 'fas fa-caret-down', description: 'Pattern renversant', condition: '3 Ors + 2 Argents + 1 Bronze en 1 édition', color: '#3f51b5' },
            { badge: 'Le Symétrique', icon: 'fas fa-balance-scale', description: 'Équilibre parfait', condition: 'Même nombre d\'Ors, Argents et Bronzes en 1 édition', color: '#009688' }
        ]
    }),
    computed: {
        ...mapState(['user']),

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

        countBadgesByType(type) {
            if (!this.mySlidingBadges || this.mySlidingBadges.length === 0) {
                return 0;
            }

            // Déterminer quel type de badge compter en fonction du type demandé
            if (type === 'voter') {
                return this.mySlidingBadges.filter(badge =>
                    this.voterBadges.some(vb => vb.badge === badge.badge)
                ).length;
            } else if (type === 'photographer') {
                return this.mySlidingBadges.filter(badge =>
                    this.photographerBadges.some(pb => pb.badge === badge.badge)
                ).length;
            } else if (type === 'combo') {
                return this.mySlidingBadges.filter(badge =>
                    this.comboBadges.some(cb => cb.badge === badge.badge)
                ).length;
            } else if (type === 'sliding') {
                return this.mySlidingBadges.filter(badge =>
                    this.slidingBadges.some(sb => sb.badge === badge.badge)
                ).length;
            }
            return 0;
        }
    }
};
</script>


<style lang="scss" scoped>
@use '../../themes/global.scss' as *;
</style>
