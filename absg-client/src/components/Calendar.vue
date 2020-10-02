<template>
<div>
    <v-card style="min-width: 460px;">
        <v-card-title >
            <v-menu
                ref="dateMenu"
                v-model="selectDateMenu"
                :close-on-content-click="false"
                :return-value.sync="date"
                transition="scale-transition"
                offset-y
                min-width="290px"
                v-if="$vuetify.breakpoint.lgAndUp"
            >
                <template v-slot:activator="{ on }">
                    <v-btn text class="h2"
                        v-on="on">
                        {{ title }}
                    </v-btn>
                </template>
                <v-date-picker
                    no-title scrollable
                    v-model="selectedDate"
                    type="month"
                    @input="changeDate()">
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="selectDateMenu = false">Annuler</v-btn>
                    <v-btn text color="primary" @click="$refs.dateMenu.save(date)">OK</v-btn>
                </v-date-picker>
            </v-menu>

            <div style="position: absolute; right: 15px">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn icon small style="margin-right: 15px"
                            v-on="on"
                            @click="setToday()">
                            <v-icon>far fa-dot-circle</v-icon>
                        </v-btn>
                    </template>
                    <span>Revenir à la date du jour</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn icon small style="margin-right: 15px"
                            v-on="on"
                            @click="prev()">
                            <v-icon>fas fa-angle-left</v-icon>
                        </v-btn>
                    </template>
                    <span>Mois précédent</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn icon small style="margin-right: 15px"
                            v-on="on"
                            @click="next()">
                            <v-icon>fas fa-angle-right</v-icon>
                        </v-btn>
                    </template>
                    <span>Mois suivant</span>
                </v-tooltip>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn icon small v-bind="attrs"
                            v-on="on"
                            @click="editEvent()">
                            <v-icon>fas fa-plus</v-icon>
                        </v-btn>
                    </template>
                    <span>Ajouter un événement</span>
                </v-tooltip>
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
                type="month"
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
                <v-card color="grey lighten-4" min-width="350px" flat>
                    <v-toolbar :color="selectedEvent.color">
                    <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-tooltip bottom v-if="selectedEvent.editable">
                            <template v-slot:activator="{ on }">
                                <v-btn icon small v-bind="attrs"
                                    v-on="on"
                                    @click="editEvent(selectedEvent)">
                                    <v-icon>fas fa-pen</v-icon>
                                </v-btn>
                            </template>
                            <span>Editer l'événement</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn icon small v-bind="attrs"
                                    v-on="on"
                                    @click="selectedOpen = false">
                                    <v-icon>fas fa-times</v-icon>
                                </v-btn>
                            </template>
                            <span>Fermer</span>
                        </v-tooltip>
                    </v-toolbar>
                    <v-card-text>
                    <span v-html="selectedEvent.details"></span>
                    </v-card-text>
                </v-card>
            </v-menu>
        </v-sheet>
    </v-card>

    <v-dialog v-model="eventEditor.displayed" width="800px">
        <v-card>
            <v-card-title class="grey lighten-4">
                <v-icon>fas fa-calendar-alt</v-icon> &nbsp; Ajouter un nouvel événement
            </v-card-title>
            <v-container>
                <v-row>
                    <v-col>
                        <v-text-field
                            prepend-icon="fas fa-user"
                            label="Titre"
                            v-model="eventEditor.name">
                        </v-text-field>
                    </v-col>
                    <v-col>
                        <v-select
                            :items="eventTypes"
                            v-model="eventEditor.type"
                            label="Catégorie d'événement"
                            item-text="label"
                            item-value="id"
                        ></v-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-menu
                            v-model="eventEditor.startDateMenu"
                            :close-on-content-click="true"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on }">
                                <v-text-field
                                    :rules="eventEditor.dateRule"
                                    v-model="eventEditor.startDate"
                                    label="Début de l'événement"
                                    prepend-icon="far fa-calendar-alt"
                                    clearable
                                    validate-on-blur
                                    v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker v-model="eventEditor.startDate" @input="eventEditor.startDateMenu = false"></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col>
                        <v-menu
                            v-model="eventEditor.endDateMenu"
                            :close-on-content-click="true"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on }">
                                <v-text-field
                                    :rules="eventEditor.dateRule"
                                    v-model="eventEditor.endDate"
                                    label="Date de fin de l'événement"
                                    prepend-icon="far fa-calendar-alt"
                                    clearable
                                    validate-on-blur
                                    v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker v-model="eventEditor.endDate" @input="eventEditor.endDateMenu = false"></v-date-picker>
                        </v-menu>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <TextEditor v-model="eventEditor.details"></TextEditor>
                    </v-col>
                </v-row>
            </v-container>
            <v-card-actions>
            <v-btn text color="primary" @click="confirmDeletion = true"><i class="fas fa-trash-alt"></i> Supprimer</v-btn>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="eventEditor.displayed = false">Annuler</v-btn>
            <v-btn color="accent" @click="saveEvent()">Enregistrer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDeletion" persistent width="500px">
        <v-card>
            <v-card-title class="grey lighten-4">
                Supprimer l'événement
            </v-card-title>

            <v-container>
                Êtes-vous sûr de vouloir supprimer l'événement : {{ eventEditor.name }} ?
            </v-container>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text color="primary" @click="confirmDeletion = false">Annuler</v-btn>
                <v-btn color="accent" @click="deleteEvent()">Supprimer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</div>
</template>

<script>
import axios from 'axios';
import store from '../store';
import { parseAxiosResponse } from '../middleware/CommonHelper';
import TextEditor from '../components/TextEditor.vue';

export default {
    components: {
        TextEditor
    },
    data: () => ({

        today: new Date().toISOString().substr(0, 10),
        focus: new Date().toISOString().substr(0, 10),
        todayLabel: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }),
        needToReset: false, // mis à vrai quand l'utilisateur parcours le calendrier afin de pouvoir revenir au mois en cours

        events: [],
        title: "",

        selectedDate: "",
        selectDateMenu: false,
        colors: {
            gueudelot: '#039be5', // événement Gueudelot
            guyomard: '#ff7043', // événement Guyomard
            guibert: '#4caf50', // événement Guibert
            all: '#aaa', // Toute la famille :)
            birthday: '#26a69a', // les anniversaires
            special: '#ff8f00' // les fêtes national et autres journées spéciales
        },
        eventTypes: [
            { id: "all", label: "Absolument G" },
            { id: "gueudelot", label: "Gueudelot" },
            { id: "guibert", label: "Guibert" },
            { id: "guyomard", label: "Guyomard" },
            { id: "special", label: "Spécial" },
        ],
        eventEditor: {
            displayed: false,
            id: -1,
            name: "",
            details: "",
            location: "",
            startDate: null,
            endDate: null,
            type: null,

            startDateMenu: false,
            endDateMenu: false,
            dateRule: [
                value => {
                    const pattern = /^([0-9]{4})?(-[0-9]{2}(-[0-9]{2})?)?$/
                    return !value || pattern.test(value) || 'La valeur doit être une date valide: YYYY ou bien YYYY-MM ou bien YYYY-MM-DD'
                }
            ]
        },
        confirmDeletion: false,

        selectedEvent: {},
        selectedElement: null,
        selectedOpen: false,
    }),
    mounted () {
        this.$refs.calendar.checkChange();
    },
    methods: {
        loadMonthEvents() {
            if (!this.start) return;

            this.isLoading = true;
            axios.get( `/api/event/${this.start.year}/${this.start.month-1}`).then(response => {
                const data = parseAxiosResponse(response);
                if (data) {
                    this.isLoading = false;
                    this.events = data;
                    this.events.map(e => {
                        try {
                            e.start = new Date(e.startDate).toISOString().substr(0, 10);
                            e.end = e.endDate ? new Date(e.endDate).toISOString().substr(0, 10) : null;
                        } catch (ex) {
                            console.warn(" > Failled to load calendar event", e, ex);
                        }
                    });
                }
                this.updateTitle();
                this.isLoading = false;
            });
        },
        changeDate() {
            try {
                this.start.year = this.selectedDate.split("-")[0];
                this.start.month = this.selectedDate.split("-")[1];
                this.focus = `${this.selectedDate}-01`;
                this.selectedDate = null;
                this.selectDateMenu = false;
            } catch (ex) {
                console.log(ex);
            }
        },
        viewDay ({ date }) {
            this.focus = date;
        },
        getEventColor (event) {
            return this.colors[event.type];
        },
        headerDay(d) {
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
        editEvent(event = null) {
            this.eventEditor.displayed = true;
            console.log("edit event", event)
            if (event) {
                // Preload form
                this.eventEditor.id = event.id;
                this.eventEditor.name = event.name;
                this.eventEditor.details = event.details;
                this.eventEditor.type = event.type;
                this.eventEditor.startDate = event.startDate ? new Date(event.startDate).toISOString().substr(0, 10) : "";
                this.eventEditor.endDate = event.endDate ? new Date(event.endDate).toISOString().substr(0, 10) : "";
            } else {
                // Reset form
                this.eventEditor.id = -1;
                this.eventEditor.name = "";
                this.eventEditor.details = "";
                this.eventEditor.type = null;
                this.eventEditor.startDate = null;
                this.eventEditor.endDate = null;
            }
        },
        saveEvent() {
            this.isLoading = true;
            const formData = new FormData();
            formData.append("id", this.eventEditor.id);
            formData.append("name", this.eventEditor.name);
            formData.append("details", this.eventEditor.details);
            formData.append("type", this.eventEditor.type);
            formData.append("startDate", this.eventEditor.startDate);
            formData.append("endDate", this.eventEditor.endDate || null);
            axios.post(`/api/event/save`, formData, {
                headers: {
                    "Content-Type" : "multipart/form-data",
                }
            })
            .then( response => {
                this.isLoading = false;
                this.eventEditor.displayed = false;
                this.loadMonthEvents();
            })
            .catch( err => {
                store.commit('onError', err);
            });

        },
        deleteEvent() {
                this.isLoading = true;
            axios.delete(`/api/event/${this.eventEditor.id}`)
            .then( response => {
                this.isLoading = false;
                this.eventEditor.displayed = false;
                this.confirmDeletion = false;
                this.loadMonthEvents();
            })
            .catch( err => {
                store.commit('onError', err);
            });
        },
        updateRange ({ start, end }) {
            // You could load events from an outside source (like database) now that we have the start and end dates on the calendar
            this.start = start;
            this.loadMonthEvents();
        },

        updateTitle () {
            const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            if (!this.start) {
                const d = new Date();
                this.title = `${months[d.getMonth()]} ${d.getFullYear()}`;
            }
            this.title = `${months[this.start.month - 1]} ${this.start.year}`;
            // new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
        }
    }
  }
</script>


<style lang="scss" scoped>
@import '../themes/global.scss';
.h2 {
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
