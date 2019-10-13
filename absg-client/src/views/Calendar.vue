<template>
<div class="home" style="margin-top: 58px;">
    <h1>Le calendrier de la famille</h1>
    <v-card style="margin: 14px">
        <img src="../assets/images/citation-new.png" style="width: 206px; height: 120px; position: absolute; top:-85px; left: 20px;"/>
        <v-form>
            <v-container>
                <v-layout>
                    <v-flex shrink>
                        <v-menu
                            ref="menu"
                            v-model="menu"
                            :close-on-content-click="false"
                            :nudge-right="40"
                            lazy
                            transition="scale-transition"
                            offset-y>
                            <template v-slot:activator="{ on }">
                                <v-text-field
                                    v-model="date"
                                    label="Date"
                                    prepend-icon="far fa-calendar-alt"
                                    readonly
                                    v-on="on">
                                </v-text-field>
                            </template>
                            <v-date-picker
                                ref="picker"
                                v-model="date"
                                max="2100-12-31"
                                min="1800-01-01"
                                @change="save">
                            </v-date-picker>
                        </v-menu>
                    </v-flex>
                    <v-flex shrink>
                        <v-select
                            v-model="type"
                            :items="typeOptions"
                            label="Affichage">
                        </v-select>
                    </v-flex>
                    <v-flex stretch>
                    </v-flex>

                    <v-flex shrink>
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
                                <v-list-item
                                    v-for="(filter, index) in filters"
                                    :key="index">
                                    <v-list-item-action>
                                        <v-checkbox v-model="filter.selected"></v-checkbox>
                                    </v-list-item-action>
                                    <v-list-item-title>{{ filter.text }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>

                        <v-menu offset-y :close-on-content-click="false" style="background-color: white;">
                            <v-btn fab small
                                color="accent"
                                slot="activator">
                                <v-icon>fas fa-search</v-icon>
                            </v-btn>
                            <div style="background-color: white; padding: 10px; min-width: 400px;">
                                <v-text-field
                                    v-model="query"
                                    label="Rechercher un événement"
                                    required>
                                </v-text-field>
                            </div>
                        </v-menu>
                        <v-btn fab small color="accent">
                            <v-icon>fas fa-plus</v-icon>
                        </v-btn>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-form>
    </v-card>
    <v-card style="margin: 15px">
        <v-sheet style="height: 500px" >
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
                                <v-btn text color="secondary">Fermer</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-menu>
                    </template>
                </template>
            </v-calendar>
        </v-sheet>
    </v-card>
</div>
</template>


<script>
export default {
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
        ]
    }),
    watch: {
        menu (val) {
            val && this.$nextTick(() => (this.$refs.picker.activePicker = 'YEAR'));
        }
    },
    computed: {
        // convert the list of events into a map of lists keyed by date
        eventsMap () {
            const map = {};
            this.events.forEach(e => (map[e.date] = map[e.date] || []).push(e));
            return map;
        }
    },
    methods: {
        open (event) {
            alert(event.title);
        },
        save (date) {
            this.$refs.menu.save(date);
        }
    }
};
</script>



<style lang="scss" scoped>
@import '../themes/global.scss';

h1 {
    display: block;
    font-size: 2em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    text-align: center;
    color: $primary;
    text-shadow: 0 -1px #000;
    text-shadow: 0 1px #aaa;
    font-size: 40px;
    font-family: "Comfortaa", sans-serif;
    margin: 20px 0 60px 0;
}
.my-event {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: 2px;
    background-color: #1867c0;
    color: #ffffff;
    border: 1px solid #1867c0;
    width: 100%;
    font-size: 12px;
    padding: 3px;
    cursor: pointer;
    margin-bottom: 1px;
}
</style>
