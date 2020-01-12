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
                                @click.stop="">
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
                                            <img :key="i2" :src="user.avatar" :alt="user.username" v-on="on" height="40px" />
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


    </div>
</template>


<script>
import Vue from 'vue';
import Vuex from 'vuex';
import store from '../store';
import axios from 'axios';
import VueSilentbox from 'vue-silentbox';
import { parseAxiosResponse } from '../middleware/CommonHelper';
import { padNumber } from '../middleware/CommonHelper';
import * as image3D from '3d-image';
import Calendar from '../components/Calendar';

Vue.use(VueSilentbox);

export default {
    components: {
        Calendar
    },
    store,
    data: () => ({
        menu: false,

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
        var coke = document.getElementById("coke");
        console.log(image3D)
        //image3D.process(coke);
    },
    watch: {
        menu (val) {
            val && this.$nextTick(() => (this.$refs.picker.activePicker = 'YEAR'));
        }
    },
    methods: {
        getWelcomData() {
            axios.get(`/api/users/welcom`).then(response => {
                const data = parseAxiosResponse(response);
                if (data) {
                    this.isLoading = false;
                    store.commit('updateCitation', data.citation);
                    store.commit('updateImmt', data.immt);

                    // On crée la listes des logs de passaG (les 24 dernières heures)
                    this.passage = []
                    const now = new Date();
                    for (let hDelta = 0; hDelta<24; hDelta++) {
                        let h = ((now.getHours() - hDelta) + 24) % 24;  // On simule le modulo
                        this.passage.unshift({
                            time: `${h}h`,
                            passage: data.passag
                                .filter(e => new Date(e.datetime).getHours() === h)
                                .map(e => ({ username: `${e.username}`, avatar: `./img/avatars/${padNumber(e.userId, 3)}.png` })),
                        })

                    }
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
        // Méthode pour le store
        immt () {
          return this.$store.state.immt;
        },


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
        width: 50px;
        vertical-align: top;

        .date {
            width: 50px;
            width: 40px;
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
