<template>
    <div class="home" v-cloak>
        <v-container fluid grid-list-xl>
            <v-layout row wrap>
                <v-flex stretch>
                    <Calendar></Calendar>
                </v-flex>

                <v-flex shrink>
                    <div class="immt" v-if="immt">
                        <div>
                            <div>
                                <img :src="immt.src" @click="zoomOnImmt"/>
                            </div>
                        </div>
                        <p>{{ immt.title }}</p>
                    </div>
                </v-flex>
            </v-layout>
            <v-layout row wrap>

                <v-flex>
                    <v-card>
                        <v-card-title>
                            <h2>Passa G
                            <v-btn text
                                style="position: absolute; right: 15px; top: 15px;"
                                @click.stop="displayPassagHistoryDialog()">
                                <v-icon left>far fa-clock</v-icon>historique
                            </v-btn>

                            </h2>
                        </v-card-title>

                        <v-list class="passage overflow-auto">
                        <template v-for="item in passage">
                            <v-list-item
                                :key="item.title"
                                ripple>

                                <div class="date">{{ item.time }}</div>
                                <template v-for="(user, i2) in item.passage">
                                    <v-tooltip :key="i2" bottom>
                                        <template v-slot:activator="{ on }">
                                            <img
                                                :key="i2"
                                                :src="user.avatar"
                                                :alt="user.username"
                                                v-on="on"
                                                height="40px"
                                                onError="this.src='/img/avatars/000.png';"
                                                />
                                        </template>
                                        <span>{{ user.username }}</span>
                                    </v-tooltip>
                                </template>

                            </v-list-item>
                        </template>
                        </v-list>
                    </v-card>
                </v-flex>

            </v-layout>
            <v-layout row wrap>
                <div id="coke" data-src="/img/cube.jpg" data-depth-src="/img/cube-depth.jpg"></div>
            </v-layout>
        </v-container>


    <v-dialog v-model="passagHistoryDialogDisplayed" width="800px">
        <v-card>
            <v-card-title class="grey lighten-4 py-4 title">
            Statistiques de passa G
            </v-card-title>
            <v-container grid-list-sm class="pa-4">
                <highcharts :options="historyData"></highcharts>
            </v-container>
            <v-card-actions>
            <v-btn text color="primary">Supprimer toutes les notifications</v-btn>
            <v-spacer></v-spacer>
            <v-btn text @click="passagHistoryDialogDisplayed=false">Fermer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>


    </div>
</template>


<script>
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../store';
import axios from 'axios';
//import VueSilentbox from 'vue-silentbox';
import { parseAxiosResponse } from '../middleware/CommonHelper';
import { padNumber } from '../middleware/CommonHelper';
import Calendar from '../components/Calendar';
import {Chart} from 'highcharts-vue';

//Vue.use(VueSilentbox);

export default {
    components: {
        Calendar,
        highcharts: Chart
    },
    store,
    data: () => ({
        menu: false,
        immt: null,
        passagHistoryDialogDisplayed: false,
        historyData: {
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
    mounted() {
        this.getWelcomData();
    },
    watch: {
        menu (val) {
            val && this.$nextTick(() => (this.$refs.picker.activePicker = 'YEAR'));
        }
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
                                .map(e => ({ username: `${e.username}`, avatar: `/img/avatars/${padNumber(e.userId, 3)}.png` })),
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
                    this.historyData.series[0].data = data.map(e => e.count);
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
            console.log('zoomOnImmt');
            store.commit('photosGalleryDisplay');
        }
    },
    computed: {
        // Méthode pour la calendrier
        title () {
            const { start, end } = this
            if (!start || !end) {
            return ''
            }

            const startMonth = this.monthFormatter(start)
            const endMonth = this.monthFormatter(end)
            const suffixMonth = startMonth === endMonth ? '' : endMonth

            const startYear = start.year
            const endYear = end.year
            const suffixYear = startYear === endYear ? '' : endYear

            const startDay = start.day + this.nth(start.day)
            const endDay = end.day + this.nth(end.day)

            switch (this.type) {
            case 'month':
                return `${startMonth} ${startYear}`
            case 'week':
            case '4day':
                return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`
            case 'day':
                return `${startMonth} ${startDay} ${startYear}`
            }
            return ''
        },
        monthFormatter () {
            return this.$refs.calendar.getFormatter({
            timeZone: 'UTC', month: 'long',
            })
        },

    }
};
</script>



<style lang="scss" scoped>
@import '../themes/global.scss';

.immt {
    div {
        max-width: 700px;
        min-width: 500px;
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
                max-width: 700px;
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
    display: flex;
    div {
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        min-width: 50px;
        padding: 0;
        vertical-align: top;

        .date {
            display: relative;
            width: 100%;
            height: 20px;
            line-height: 20px;
            text-align: center;
        }

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
