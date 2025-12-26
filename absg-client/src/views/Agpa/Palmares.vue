<template>
  <div>
    <v-container>
      <v-card>
        <v-card-title>
          <v-text-field
            v-model="filter.search"
            prepend-icon="fas fa-search"
            label="Rechercher"
            single-line
            hide-details
            style="max-width:400px"
          />
        </v-card-title>
        <v-data-table
          :headers="headers"
          :items="palmares"
          :search="filter.search"
          :loading="isLoading"
          :custom-filter="searchMethod"
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
              v-if="item.bestYear.stats[7] > 0"
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
              v-if="item.bestYear.stats[6] > 0"
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
      </v-card>
    </v-container>

    <v-dialog
      v-if="palmaresDetails"
      v-model="palmaresDetails"
      width="800px"
    >
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">
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
            text
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
        filter: { search: "" }, // un filtre par recherche de mot clés multichamps
        palmares: [],
        palmaresDetails: null
    }),
    mounted () {
        this.initView();
    },
    methods: {
        initView() {
            this.isLoading = true;
            axios.get(`/api/agpa/palmares`).then(response => {
                this.palmares = parseAxiosResponse(response).map( e => ({
                    ...e,
                    ...getPeopleAvatar(e)
                }));
                this.isLoading = false;
            }).catch( err => {
                store.commit("onError", err);
            });
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
