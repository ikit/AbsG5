<template>
    <v-card style="min-width: 500px;">
        <v-card-title style="border-bottom: 1px solid rgba(0,0,0, 0.1)"> <h2>{{ title }}</h2>
            <div style="position: absolute; right: 15px">
                <v-btn fab small color="accent" style="margin-right: 15px"
                    @click="setToday()">
                    <v-icon>far fa-dot-circle</v-icon>
                </v-btn>
                <v-btn fab small color="accent" style="margin-right: 15px"
                    @click="prev()">
                    <v-icon>fas fa-angle-left</v-icon>
                </v-btn>
                <v-btn fab small color="accent" style="margin-right: 15px"
                    @click="next()">
                    <v-icon>fas fa-angle-right</v-icon>
                </v-btn>
                <v-menu offset-y :close-on-content-click="false">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn fab small color="accent" v-bind="attrs" v-on="on">
                            <v-icon>fas fa-th-list</v-icon>
                        </v-btn>
                    </template>

                    <v-list>
                        <v-list-item-group>
                        <v-list-item v-for="(filter, index) in filters" :key="index">
                            <template >
                                <v-list-item-action>
                                <v-checkbox v-model="filter.selected"
                                    ></v-checkbox>
                                </v-list-item-action>

                                <v-list-item-content>
                                <v-list-item-title>{{ filter.text }}</v-list-item-title>
                                </v-list-item-content>
                            </template>
                        </v-list-item>
                        </v-list-item-group>
                    </v-list>
                </v-menu>
            </div>

        </v-card-title>
        <v-sheet>
            <v-calendar
                style="min-height:426px;"
                ref="calendar"
                v-model="focus"
                color="primary"
                :weekdays="[1, 2, 3, 4, 5, 6, 0]"
                :header-date-format="headerDay"
                :events="events"
                :event-color="getEventColor"
                :event-margin-bottom="3"
                :now="today"
                :type="type"
                @click:event="showEvent"
                @click:more="viewDay"
                @click:date="viewDay"
                @change="updateRange"
                >
            </v-calendar>
            <v-menu
                v-model="selectedOpen"
                :close-on-content-click="false"
                :activator="selectedElement"
                offset-x
                >
                <v-card
                    color="grey lighten-4"
                    min-width="350px"
                    flat
                >
                    <v-toolbar
                    :color="selectedEvent.color"
                    dark
                    >
                    <v-btn icon>
                        <v-icon v-if="selectedEvent.type == 'birthday'">fas fa-birthday-cake</v-icon>
                        <v-icon v-else>fas fa-edit</v-icon>
                    </v-btn>
                    <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon>
                        <v-icon>fas fa-ellipsis-v</v-icon>
                    </v-btn>
                    </v-toolbar>
                    <v-card-text>
                    <span v-html="selectedEvent.details"></span>
                    </v-card-text>
                    <v-card-actions>
                    <v-btn
                        text
                        color="secondary"
                        @click="selectedOpen = false"
                    >
                        Fermer
                    </v-btn>
                    </v-card-actions>
                </v-card>
            </v-menu>
        </v-sheet>
    </v-card>
</template>

<script>
import axios from 'axios';
import { parseAxiosResponse } from '../middleware/CommonHelper';

export default {

    data: () => ({

        today: new Date().toISOString().substr(0, 10),
        focus: new Date().toISOString().substr(0, 10),
        todayLabel: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }),
        type: 'month',
        needToReset: false, // mis à vrai quand l'utilisateur parcours le calendrier afin de pouvoir revenir au mois en cours
        typeToLabel: {
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour'
        },
        filters: [
            { text: 'Naissances', value: 'birth', selected: true },
            { text: 'Fêtes nationales', value: 'firstname', selected: true },
            { text: 'Gueudelot', value: 'firsname2', selected: true },
            { text: 'Guibert', value: 'age', selected: true },
            { text: 'Guyomard', value: 'home', selected: true },
        ],
        events: [],
        colors: {
            gueudelot: '#00f', // événement Gueudelot
            guyomard: '#f00', // événement Guyomard
            guibert: '#0f0', // événement Guibert
            all: '#aaa', // Toute la famille :)
            birthday: '#fa0', // les anniversaires
            special: '#0aa' // les fêtes national et autres journées spéciales
        },


        start: null,
        selectedEvent: {},
        selectedElement: null,
        selectedOpen: false,
    }),
    mounted () {
        this.$refs.calendar.checkChange();
    },
    computed: {
        title () {
            const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            if (!this.start) {
                const d = new Date();
                return `${months[d.getMonth()]} ${d.getFullYear()}`;
            }
            return `${months[this.start.month - 1]} ${this.start.year}`;
            // new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
        }
    },
    methods: {
        loadMonthEvents() {
            if (!this.start) return
            axios.get( `/api/event/${this.start.year}/${this.start.month-1}`).then(response => {
                const data = parseAxiosResponse(response);
                if (data) {
                    this.isLoading = false;
                    this.events = data;
                    this.events.map(e => {
                        e.start = new Date(e.start).toISOString().substr(0, 10);
                        e.end = new Date(e.end).toISOString().substr(0, 10);
                    });
                }
            });
        },
        viewDay ({ date }) {
            this.focus = date;
        },
        getEventColor (event) {
            return this.colors[event.type];
        },
        headerDay(d) {
            console.log(d);
            return ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'][d.weekday];
        },
        setToday () {
            this.focus = this.today
        },
        prev () {
            this.$refs.calendar.prev();
        },
        next () {
            this.$refs.calendar.next();
        },
        showEvent ({ nativeEvent, event }) {
            const open = () => {
                this.selectedEvent = event
                this.selectedElement = nativeEvent.target
                setTimeout(() => this.selectedOpen = true, 10)
            }

            if (this.selectedOpen) {
                this.selectedOpen = false
                setTimeout(open, 10)
            } else {
                open()
            }

            nativeEvent.stopPropagation()
        },
        updateRange ({ start, end }) {
            // You could load events from an outside source (like database) now that we have the start and end dates on the calendar
            this.start = start;
            this.loadMonthEvents();
        },
    }
  }
</script>


<style lang="scss" scoped>
@import '../themes/global.scss';
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
</style>
