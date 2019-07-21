<template>
    <div class="home" v-cloak>
        <v-container fluid grid-list-xl>
            <v-layout row wrap>
                <v-flex stretch>
                    <v-card style="min-width: 500px;">
                        <v-card-title style="border-bottom: 1px solid rgba(0,0,0, 0.1)"> <h1>Agenda</h1>
                            <div style="position: absolute; right: 15px">
                                <v-btn fab small color="accent"
                                    @click="$refs.calendar.prev()">
                                    <v-icon>fas fa-angle-left</v-icon>
                                </v-btn>
                                <v-btn fab small color="accent"
                                    @click="$refs.calendar.next()">
                                    <v-icon>fas fa-angle-right</v-icon>
                                </v-btn>
                                <v-menu offset-y :close-on-content-click="false">
                                    <v-btn fab small
                                        color="accent"
                                        slot="activator">
                                        <v-icon>fas fa-th-list</v-icon>
                                    </v-btn>
                                    <v-list>
                                        <v-list-tile
                                            v-for="(filter, index) in filters"
                                            :key="index">
                                            <v-list-tile-action>
                                                <v-checkbox v-model="filter.selected"></v-checkbox>
                                            </v-list-tile-action>
                                            <v-list-tile-title>{{ filter.text }}</v-list-tile-title>
                                        </v-list-tile>
                                    </v-list>
                                </v-menu>
                            </div>

                        </v-card-title>
                        <v-sheet style="height:426px;">
                            <v-calendar
                                ref="calendar"
                                :type="type"
                                :now="today"
                                v-model="date"
                                color="primary">
                                <template
                                    slot="day"
                                    slot-scope="{ date }">
                                    <template v-for="event in eventsMap[date]">
                                    <v-menu
                                        :key="event.title"
                                        v-model="event.open"
                                        full-width
                                        offset-x>
                                        <div
                                            v-if="!event.time"
                                            slot="activator"
                                            v-ripple
                                            class="my-event"
                                            v-html="event.title">
                                        </div>
                                        <v-card
                                            color="grey lighten-4"
                                            min-width="350px"
                                            flat>
                                            <v-toolbar
                                                color="primary"
                                                dark>
                                                <v-toolbar-title v-html="event.title"></v-toolbar-title>
                                                <v-spacer></v-spacer>
                                                <v-btn icon>
                                                    <v-icon>fas fa-edit</v-icon>
                                                </v-btn>
                                            </v-toolbar>
                                            <v-card-title primary-title>
                                                <span v-html="event.details"></span>
                                            </v-card-title>
                                            <v-card-actions>
                                                <v-btn flat color="secondary">Fermer</v-btn>
                                            </v-card-actions>
                                        </v-card>
                                    </v-menu>
                                    </template>
                                </template>
                            </v-calendar>
                        </v-sheet>
                    </v-card>
                </v-flex>

                <v-flex shrink>
                    <div class="immt" v-if="immt">
                        <div>
                            <div>
                                <img :src="immt.src"/>
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
                            <h1>Passa G
                            <v-btn flat
                                style="position: absolute; right: 15px; top: 15px;"
                                @click.stop="">
                                <v-icon left>far fa-clock</v-icon>historique
                            </v-btn>

                            </h1>
                        </v-card-title>

                        <v-list class="passage">
                        <template v-for="(item, i1) in passage">
                            <v-list-tile
                                :key="item.title"
                                ripple>

                                <div style="position: absolute; right: 15px; color: #aaa;" v-if="item.date">{{ item.date }}</div>
                                <div style="width: 50px;">{{ item.time }}</div>
                                <template v-for="(user, i2) in item.passage">
                                    <v-tooltip :key="i2" bottom>
                                        <template v-slot:activator="{ on }">
                                            <img :key="i2" :src="user.avatar" :alt="user.username" v-on="on" height="40px" />
                                        </template>
                                        <span>{{ user.username }}</span>
                                    </v-tooltip>


                                </template>

                            </v-list-tile>
                            <v-divider
                                v-if="i1 + 1 < passage.length"
                                :key="i1"></v-divider>
                        </template>
                        </v-list>
                    </v-card>
                </v-flex>

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

Vue.use(VueSilentbox);

export default {
    store,
    data: () => ({
        menu: false,
        today: new Date().toISOString().substr(0, 10),
        date: new Date().toISOString().substr(0, 10),
        type: 'month',
        typeOptions: [
            { text: 'Journée', value: 'day' },
            { text: 'Semaine', value: 'week' },
            { text: 'Mois', value: 'month' }
        ],
        events: [
            {
                title: 'Vacation',
                details: 'Going to the beach!',
                date: '2019-03-10',
                open: false,
          time: '09:00',
          duration: 45
            },
            {
                title: 'Vacation',
                details: 'Going to the beach!',
                date: '2018-12-31',
                open: false
            },
            {
                title: 'Vacation',
                details: 'Going to the beach!',
                date: '2019-01-01',
                open: false
            },
            {
                title: 'Meeting',
                details: 'Spending time on how we do not have enough time',
                date: '2019-01-07',
                open: false
            },
            {
                title: '30th Birthday',
                details: 'Celebrate responsibly',
                date: '2019-01-03',
                open: false
            },
            {
                title: 'New Year',
                details: 'Eat chocolate until you pass out',
                date: '2019-01-01',
                open: false
            },
            {
                title: 'Conference',
                details: 'Mute myself the whole time and wonder why I am on this call',
                date: '2019-01-21',
                open: false
            },
            {
                title: 'Hackathon',
                details: 'Code like there is no tommorrow',
                date: '2019-02-01',
                open: false
            }
        ],
        filters: [
            { text: 'Naissances', value: 'birth', selected: true },
            { text: 'Fêtes nationales', value: 'firstname', selected: true },
            { text: 'Gueudelot', value: 'firsname2', selected: true },
            { text: 'Guibert', value: 'age', selected: true },
            { text: 'Guyomard', value: 'home', selected: true },
        ],
        selected: [2],
        passage: [
        {
            date: null,
            time: '1h',
            passage: [
                { username: 'Bébé Ma\'anne', avatar: `./img/avatars/009.png` },
            ],
        },
        {
            date: '12/03/2019',
            time: '0h',
            passage: [
                { username: 'Sev', avatar: `./img/avatars/010.png` },
                { username: 'Olive', avatar: `./img/avatars/002.png` },
                { username: 'Fannette', avatar: `./img/avatars/018.png` },
                { username: 'Manouel', avatar: `./img/avatars/004.png` },
            ],
        },
        {
            date: null,
            time: '23h',
            passage: [
                { username: 'Fannette', avatar: `./img/avatars/018.png` },
                { username: 'Olive', avatar: `./img/avatars/002.png` },
            ],
        },
        {
            date: null,
            time: '22h',
            passage: [
                { username: 'Bébé Ma\'anne', avatar: `./img/avatars/009.png` },
                { username: 'Sev', avatar: `./img/avatars/010.png` },
                { username: 'Olive', avatar: `./img/avatars/002.png` },
                { username: 'Flo', avatar: `./img/avatars/005.png` },
            ],
        },
        {
            date: null,
            time: '21h',
            passage: [
                { username: 'Annie', avatar: `./img/avatars/012.png` },
            ],
        },
        {
            date: null,
            time: '20h',
            passage: [],
        },
        {
            date: null,
            time: '19h',
            passage: [
                { username: 'Annie', avatar: `./img/avatars/012.png` },
                { username: 'Olive', avatar: `./img/avatars/002.png` },
            ],
        },
        {
            date: null,
            time: '18h',
            passage: [],
        },
        {
            date: null,
            time: '17h',
            passage: [],
        },
        {
            date: null,
            time: '16h',
            passage: [],
        }],
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
            axios.get(`/api/users/welcom`).then(response => {
                const data = parseAxiosResponse(response);
                if (data) {
                    console.log(data);
                    this.isLoading = false;
                    store.commit('updateUser', data.user);
                    store.commit('updateCitation', data.citation);
                    store.commit('updateImmt', data.immt);
                }
            });
        },
        open (event) {
            alert(event.title);
        },
        save (date) {
            this.$refs.menu.save(date);
        }
    },
    computed: {
        // convert the list of events into a map of lists keyed by date
        eventsMap () {
            const map = {};
            this.events.forEach(e => (map[e.date] = map[e.date] || []).push(e));
            return map;
        },
        immt () {
          return this.$store.state.immt;
        }
    }
};
</script>



<style lang="scss" scoped>
@import '../assets/global.scss';

.immt {
    div {
        max-width: 700px;
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
            }
        }
    }
    p {
        text-align: center;
        margin-top: 15px;
        opacity: 0.5;
    }
}


h1 {
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
    height: 495px;
    overflow: hidden;
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

.statBox {
    height: 100px;

    .statIcon {
        position: absolute;
        top: 20px;
        left: 20px;

        .v-icon {
            font-size: 4em;
        }
    }

    .statValue {
        position: absolute;
        top: 0;
        left: 100px;
        right: 15px;
        bottom: 0;

        .details {
            color: #aaa;
            font-size: 0.9em;
        }
    }
}

</style>
