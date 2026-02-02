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
        <v-col :cols="12">
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
                  :style="{
                    position: 'absolute',
                    right: '15px',
                    top: '15px',
                    fontSize: $vuetify.display.xs ? '0.8em' : '1em'
                  }"
                  :size="$vuetify.display.xs ? 'small' : 'default'"
                  @click.stop="displayPassagHistoryDialog()"
                >
                  <v-icon start>
                    far fa-clock
                  </v-icon>
                  <span v-if="!$vuetify.display.xs">historique</span>
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
                          :height="$vuetify.display.xs ? '30px' : '40px'"
                          @error="handleAvatarError"
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
        <v-card-title class="bg-grey-lighten-4 py-4 title">
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
import store from '../stores/helpers';
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
        },
        handleAvatarError(event) {
            // Prevent infinite loop by checking if we already tried the fallback
            if (event.target.src.includes('000.png')) {
                // Already on fallback, use a transparent pixel to stop the loop
                event.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                event.target.style.display = 'none'; // Hide broken image
            } else {
                // First error, try fallback avatar
                event.target.src = '/files/avatars/000.png';
            }
        }
    }
};
</script>



<style lang="scss" scoped>
@use '../themes/global.scss' as *;

.immt {
    div {
        max-width: 700px;
        min-width: 100%;
        height: auto;
        min-height: 250px;
        margin: auto;
        display: table;

        div {
            max-width: 700px;
            width: 100%;
            height: auto;
            min-height: 250px;
            display: table-cell;
            text-align: center;
            vertical-align: middle;

            img {
                max-width: min(95vw, 700px);
                max-height: 450px;
                width: auto;
                height: auto;
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
        font-size: 0.9em;
        padding: 0 10px;
    }
}


h2 {
    text-transform: capitalize;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    text-align: center;
    color: rgb(var(--v-theme-primary));
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
