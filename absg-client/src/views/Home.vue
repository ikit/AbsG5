<template>
  <div
    v-cloak
    class="home"
  >
    <v-container
      fluid
      grid-list-xl
    >
      <v-row>
        <v-col>
          <v-card style="width:500px; margin: auto">
            <v-card-title>
              <h2>
                Prochains événements
                <router-link to="/agenda/events" tag="button" 
                  style="position: absolute; right: 20px; top: 25px;">
                  <v-icon>
                    fas fa-pen
                  </v-icon>
                </router-link>
              </h2>
            </v-card-title>

            <v-data-table
              :headers="eventsHeaders"
              :items="events"
              items-per-page="10"
              loading-text="Récupération des notifications..."
              hide-default-footer
              class="notifications"
            >
              <template #[`item.what`]="{ item }">
                <div style="display: flex;">
                  <v-icon style="flex">far fa-calendar-alt</v-icon>
                  <span style="display: inline-block; margin-left: 15px; line-height: 25px">{{ item.name }}</span>
                </div>
              </template>
              <template #[`item.when`]="{ item }">
                <span style="text-align: right; padding-right: 25px">{{ item.dateLabel }}</span>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <v-col>
          <div
            v-if="immt"
            class="immt"
          >
            <div>
              <div>
                <img
                  :src="immt.src"
                  @click="zoomOnImmt"
                >
              </div>
            </div>
            <p>{{ immt.title }}</p>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card>
            <v-card-title>
              <h2>
                Passa G
                <v-btn
                  variant="text"
                  style="position: absolute; right: 15px; top: 15px;"
                  @click.stop="displayPassagHistoryDialog()"
                >
                  <v-icon start>
                    far fa-clock
                  </v-icon>historique
                </v-btn>
              </h2>
            </v-card-title>

            <v-list class="passage overflow-auto">
              <template v-for="item in passage" :key="item.title">
                <v-list-item
                  ripple
                >
                  <div class="date">
                    {{ item.time }}
                  </div>
                  <template v-for="(user, i2) in item.passage" :key="i2">
                    <v-tooltip
                      bottom
                    >
                      <template #activator="{ props }">
                        <img
                          :src="user.avatar"
                          :alt="user.username"
                          height="40px"
                          @error="(e) => e.target.src='/files/avatars/000.png'"
                          v-bind="props"
                        >
                      </template>
                      <span>{{ user.username }}</span>
                    </v-tooltip>
                  </template>
                </v-list-item>
              </template>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <div
          id="coke"
          data-src="/img/cube.jpg"
          data-depth-src="/img/cube-depth.jpg"
        />
      </v-row>
    </v-container>


    <v-dialog v-model="passagHistoryDialogDisplayed">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">
          Statistiques de passa G sur l'année
        </v-card-title>
        <v-container
          grid-list-sm
          class="pa-4"
        >
          <highcharts :options="historyData" />
        </v-container>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="passagHistoryDialogDisplayed=false"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>


<script>
import store from '../store';
import axios from 'axios';
//import VueSilentbox from 'vue-silentbox';
import { parseAxiosResponse } from '../middleware/CommonHelper';
import { padNumber } from '../middleware/CommonHelper';
import {Chart} from 'highcharts-vue';
import { format } from "date-fns";
import { fr } from "date-fns/locale";

//Vue.use(VueSilentbox);

export default {
    components: {
        highcharts: Chart
    },
    store,
    data: () => ({
        menu: false,
        immt: null,
        eventsHeaders: [
          { text: "Quoi", value: "what" },
          { text: "Quand", value: "when", align: "right" },
        ],
        events: [],
        passagHistoryDialogDisplayed: false,
        historyData: {
            title: "",
            chart: {
                type: 'spline'
            },
            xAxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            yAxis: { title: { text: 'Visiteur unique' } },
            tooltip: {
                crosshairs: true,
                shared: true
            },
            plotOptions: {
                spline: {
                    marker: {
                        radius: 4,
                        lineColor: '#666666',
                        lineWidth: 1
                    }
                }
            },
            series: [{
                name: 'visiteurs uniques',
                data: []
            }]
        },
        selected: [2],
        passage: [],
        methods: {
            toggle: function (index) {
                const i = this.selected.indexOf(index);
                if (i > -1) {
                    this.selected.splice(i, 1);
                } else {
                    this.selected.push(index);
                }
            }
        }
    }),

    watch: {
        menu (val) {
            val && this.$nextTick(() => (this.$refs.picker.activePicker = 'YEAR'));
        },
    },
    mounted() {
        // On récupère les infos de base
        this.getWelcomData();
    },
    methods: {
        getWelcomData() {
            axios.get(`/api/homepage`).then(response => {
                const data = parseAxiosResponse(response);
                if (data) {
                    this.isLoading = false;

                    // Les événements à venir
                    this.events = data.events.map(e => ({
                      ...e,
                      dateLabel: e.endDate 
                        ? `du ${format(new Date(e.startDate), "dd MMM", {locale: fr})} au ${format(new Date(e.endDate), "dd MMM", {locale: fr})}`
                        : format(new Date(e.startDate), "dd MMM", {locale: fr})
                    }));

                    // La photo du moment
                    if (data.immt) {
                        let day = `${data.immt.day}`;
                        data.immt.src = `/files/immt/${data.immt.year}_${day.padStart(3,'0')}.jpg`;
                        this.immt = data.immt;

                        store.commit('photosGalleryReset', [{
                            url: this.immt.src,
                            title: this.immt.title
                        }]);
                        store.commit('photosGallerySetIndex', 0);
                    }

                    // On crée la listes des logs de passaG (les 24 dernières heures)
                    this.passage = []
                    const now = new Date();
                    for (let hDelta = 0; hDelta<24; hDelta++) {
                        let h = ((now.getHours() - hDelta) + 24) % 24;  // On simule le modulo
                        this.passage.unshift({
                            time: `${h}h`,
                            passage: data.passag
                                .filter(e => new Date(e.datetime).getHours() === h)
                                .map(e => ({ username: `${e.username}`, avatar: `/files/avatars/${padNumber(e.userId, 3)}.png` })),
                        })

                    }
                }
            });
        },
        displayPassagHistoryDialog() {
            this.passagHistoryDialogDisplayed = true;
            axios.get(`/api/passag`).then(response => {
                const data = parseAxiosResponse(response);
                if (data) {
                    this.isLoading = false;
                    this.historyData.series[0].data = data.map(e => +e.count);
                    this.historyData.xAxis.categories = data.map(e => e.date);
                    this.passagHistoryDialogDisplayed = true;
                }
            });
        },
        open (event) {
            alert(event.title);
        },
        save (date) {
            this.$refs.menu.save(date);
        },
        zoomOnImmt(event) {
            store.commit('photosGalleryDisplay');
        }
    }
};
</script>



<style lang="scss" scoped>
@import '../themes/global.scss';

.immt {
    div {
        max-width: 700px;
        min-width: 460px;
        height: 450px;
        margin: auto;
        display: table;

        div {
            max-width: 700px;
            height: 450px;
            display: table-cell;
            text-align: center;
            vertical-align: middle;

            img {
                max-width: min(90vw, 700px);
                max-height: 450px;
                background: white;
                padding: 1px;
                box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
                cursor: pointer;
            }
        }
    }
    p {
        text-align: center;
        margin-top: 15px;
        opacity: 0.5;
    }
}


h2 {
    text-transform: capitalize;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    text-align: center;
    color: $primary;
    text-shadow: 0 -1px #000;
    text-shadow: 0 1px #aaa;
    font-size: 1.5em;
    font-family: "Comfortaa", sans-serif;
    font-weight: bold;
    margin: 10px 0;
}


.passage {
    margin: 0 15px;
    display: flex;
    div {
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        min-width: 50px;
        padding: 0;
        vertical-align: top;
        justify-content: center;
        margin-top: 20px;

        .date {
            position: absolute;
            margin: 0;
            top: -20px;
            height: 20px;
            line-height: 20px;
            opacity: 0.5;
        }
    }
    div:nth-child(2n) {
        background: rgba(100,100,100, 0.1);;
    }
}

.citation {
    text-align: center;
    font-size: 1.5em;
    margin-bottom: 40px;
    height: 50px;
    font-style: italic;
    display: flex;
    justify-content: center;
    align-items: center;
}

</style>
