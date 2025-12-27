<template>
  <div>
    <v-container>
      <!-- Section 1: Palmarès Global et Glissant -->
      <div :style="{
        display: 'grid',
        gridTemplateColumns: $vuetify.display.mobile ? '1fr' : '1fr 1fr',
        gap: '20px',
        marginBottom: '30px'
      }">
        <!-- Palmarès Global -->
        <v-card
          style="cursor: pointer; transition: transform 0.2s;"
          @click="showGlobalPalmaresDialog = true"
          hover
        >
          <v-card-title style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <v-icon start color="white">fas fa-trophy</v-icon>
            Palmarès Global
          </v-card-title>
          <v-card-text style="padding: 30px; text-align: center;">
            <div style="font-size: 4em; font-weight: bold; color: #667eea;">
              {{ myGlobalRank || '-' }}
            </div>
            <div style="font-size: 1.2em; color: #666; margin-bottom: 20px;">
              Ma position actuelle
            </div>
            <div style="font-size: 2em; font-weight: bold; color: #764ba2;">
              {{ myGlobalAgpas || 0 }}
            </div>
            <div style="font-size: 1em; color: #666;">
              AGPA depuis le début
            </div>

            <!-- Badges Global -->
            <div v-if="myGlobalBadges" style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <div style="font-size: 0.9em; color: #666; margin-bottom: 10px;">
                Badges collectés: {{ myGlobalBadges.totalCount }}/{{ myGlobalBadges.totalPossible }}
              </div>
              <div v-if="myGlobalBadges.lastBadge" style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 10px;">
                <i :class="myGlobalBadges.lastBadge.icon" :style="{ color: myGlobalBadges.lastBadge.color, fontSize: '1.5em' }"></i>
                <div style="text-align: left;">
                  <div style="font-weight: bold; font-size: 0.9em;">{{ myGlobalBadges.lastBadge.badge }}</div>
                  <div style="font-size: 0.75em; color: #999; font-style: italic;">{{ myGlobalBadges.lastBadge.description }}</div>
                </div>
              </div>
            </div>

            <div style="margin-top: 20px; font-size: 0.9em; color: #999; font-style: italic;">
              Cliquez pour voir le tableau complet
            </div>
          </v-card-text>
        </v-card>

        <!-- Palmarès Glissant (3 dernières éditions) -->
        <v-card
          style="cursor: pointer; transition: transform 0.2s;"
          @click="showSlidingPalmaresDialog = true"
          hover
        >
          <v-card-title style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
            <v-icon start color="white">fas fa-chart-line</v-icon>
            <span v-if="slidingYearFrom && slidingYearTo">
              Palmarès Glissant ({{ slidingYearFrom }} - {{ slidingYearTo }})
            </span>
            <span v-else>
              Palmarès Glissant (3 dernières éditions)
            </span>
          </v-card-title>
          <v-card-text style="padding: 30px; text-align: center;">
            <div style="font-size: 4em; font-weight: bold; color: #f093fb;">
              {{ mySlidingRank || '-' }}
            </div>
            <div style="font-size: 1.2em; color: #666; margin-bottom: 20px;">
              Ma position glissante
            </div>
            <div style="font-size: 2em; font-weight: bold; color: #f5576c;">
              {{ mySlidingAgpas || 0 }}
            </div>
            <div style="font-size: 1em; color: #666;">
              <span v-if="slidingYearFrom && slidingYearTo">
                AGPA de {{ slidingYearFrom }} à {{ slidingYearTo }}
              </span>
              <span v-else>
                AGPA sur les 3 dernières éditions
              </span>
            </div>

            <!-- Badges Glissants (3 dernières éditions) -->
            <div v-if="mySlidingBadges && mySlidingBadges.length > 0" style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <div style="font-size: 0.9em; color: #666; margin-bottom: 10px;">
                Badges des 3 dernières éditions
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 10px;">
                <v-tooltip
                  v-for="(badge, index) in mySlidingBadges"
                  :key="index"
                  location="bottom"
                >
                  <template #activator="{ props }">
                    <div
                      v-bind="props"
                      :style="{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        backgroundColor: badge.color + '20',
                        border: '1px solid ' + badge.color
                      }"
                    >
                      <i :class="badge.icon" :style="{ color: badge.color, fontSize: '1em' }"></i>
                      <span style="font-size: 0.75em; font-weight: 500; color: #333;">{{ badge.badge }}</span>
                      <span style="font-size: 0.65em; color: #999;">({{ badge.year }})</span>
                    </div>
                  </template>
                  <span>{{ badge.description }}</span>
                </v-tooltip>
              </div>
            </div>

            <div style="margin-top: 20px; font-size: 0.9em; color: #999; font-style: italic;">
              Cliquez pour voir le tableau complet
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Section 2: Analyse des Votes -->
      <v-card style="margin-bottom: 30px;">
        <v-card-title style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
          <v-icon start color="white">fas fa-chart-pie</v-icon>
          Analyse des Votes
        </v-card-title>
        <v-card-text style="padding: 20px;">
          <p style="text-align: center; color: #999; font-style: italic; padding: 40px;">
            Section en cours de développement - Analyse détaillée de vos votes donnés et reçus
          </p>
        </v-card-text>
      </v-card>

      <!-- Section 3: Mon Palmarès -->
      <v-card style="margin-bottom: 30px;">
        <v-card-title style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white;">
          <v-icon start color="white">fas fa-medal</v-icon>
          Mon Palmarès Personnel
        </v-card-title>
        <v-card-text style="padding: 20px;">
          <p style="text-align: center; color: #999; font-style: italic; padding: 40px;">
            Section en cours de développement - Votre historique complet par catégorie et par année
          </p>
        </v-card-text>
      </v-card>

      <!-- Section 4: Fun Facts -->
      <v-card style="margin-bottom: 30px;">
        <v-card-title style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333;">
          <v-icon start color="#333">fas fa-smile-beam</v-icon>
          Fun Facts
        </v-card-title>
        <v-card-text style="padding: 20px;">
          <p style="text-align: center; color: #999; font-style: italic; padding: 40px;">
            Section en cours de développement - Anecdotes et statistiques amusantes
          </p>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Dialog Palmarès Global -->
    <v-dialog
      v-model="showGlobalPalmaresDialog"
      max-width="1200px"
      scrollable
    >
      <v-card>
        <v-card-title style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; position: sticky; top: 0; z-index: 10;">
          <v-icon start color="white">fas fa-trophy</v-icon>
          Palmarès Global Complet
        </v-card-title>
        <v-card-text style="padding: 20px;">
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
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            @click="showGlobalPalmaresDialog = false"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Palmarès Glissant -->
    <v-dialog
      v-model="showSlidingPalmaresDialog"
      max-width="1200px"
      scrollable
    >
      <v-card>
        <v-card-title style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; position: sticky; top: 0; z-index: 10;">
          <v-icon start color="white">fas fa-chart-line</v-icon>
          <span v-if="slidingYearFrom && slidingYearTo">
            Palmarès Glissant {{ slidingYearFrom }} - {{ slidingYearTo }}
          </span>
          <span v-else>
            Palmarès Glissant - 3 Dernières Éditions
          </span>
        </v-card-title>
        <v-card-text style="padding: 20px;">
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
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            @click="showSlidingPalmaresDialog = false"
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
        showGlobalPalmaresDialog: false,
        showSlidingPalmaresDialog: false,
        myGlobalRank: null,
        myGlobalAgpas: null,
        mySlidingRank: null,
        mySlidingAgpas: null,
        slidingYearFrom: null,
        slidingYearTo: null,
        myGlobalBadges: null,
        mySlidingBadges: [],
        voteProfiles: {}
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
                this.palmares = parseAxiosResponse(response).map( e => ({
                    ...e,
                    ...getPeopleAvatar(e)
                }));

                // Calculer ma position et mes AGPA dans le palmarès global
                this.calculateMyGlobalStats();

                this.isLoading = false;
            } catch (err) {
                console.error(err);
                this.isLoading = false;
            }

            // Charger le palmarès glissant (3 dernières éditions)
            try {
                const response = await axios.get(`/api/agpa/palmares/sliding`);
                const data = parseAxiosResponse(response);

                // Extraire le tableau palmares et les années
                if (data.palmares) {
                    this.slidingPalmares = data.palmares.map( e => ({
                        ...e,
                        ...getPeopleAvatar(e)
                    }));
                    this.slidingYearFrom = data.yearFrom;
                    this.slidingYearTo = data.yearTo;
                } else {
                    // Format ancien (fallback)
                    this.slidingPalmares = data.map( e => ({
                        ...e,
                        ...getPeopleAvatar(e)
                    }));
                }

                // Calculer ma position et mes AGPA dans le palmarès glissant
                this.calculateMySlidingStats();
            } catch (err) {
                console.error('Palmarès glissant non disponible:', err);
                // Pour l'instant, utiliser le palmarès global comme fallback
                this.slidingPalmares = this.palmares;
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
            }
        },

        calculateMySlidingStats() {
            if (!this.user || !this.slidingPalmares) return;

            const myEntry = this.slidingPalmares.find(p => p.username === this.user.username);
            if (myEntry) {
                this.mySlidingRank = this.slidingPalmares.indexOf(myEntry) + 1;
                this.mySlidingAgpas = myEntry.totalPoints || 0;
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

            // Total possible: 10 voter + 8 photographer + 13 combo = 31 badges
            const totalPossible = 31;

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
        }
    }
};
</script>


<style lang="scss" scoped>
@use '../../themes/global.scss' as *;
</style>
