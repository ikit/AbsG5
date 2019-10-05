<template>
<div>
    <img
        v-if="$vuetify.breakpoint.mdAndUp"
        src="../assets/images/immt-new.png"
        style="width: 206px; height: 120px; position: absolute; top: -20px; left: 10px;"/>
    <h1>L'agenda de la famille</h1>

    <v-tabs centered>
        <v-tab> <v-icon>fas fa-address-book</v-icon> &nbsp; Répertoire</v-tab>
        <v-tab> <v-icon>fas fa-user-circle</v-icon> &nbsp; Trombinoscope</v-tab>
        <v-tab> <v-icon>fas fa-map-marked-alt</v-icon> &nbsp; Lieux</v-tab>
        <v-tab> <v-icon>fas fa-calendar-alt</v-icon> &nbsp; Calendrier</v-tab>
        <v-tab> <v-icon>fas fa-sitemap</v-icon> &nbsp; Généalogie</v-tab>

        <v-tab-item>
            <v-card  flat  tile >
                <v-card style="margin: 14px;">
                    <v-data-table
                        :headers="personsHeaders"
                        :items="persons"
                        :loading="isLoading"
                        :footer-props="{
                            showFirstLastPage: false,
                            prevIcon: 'fas fa-chevron-left',
                            nextIcon: 'fas fa-chevron-right'
                        }"
                        class="elevation-1">
                    <template v-slot:item.firstname="{ item }">
                        <v-chip dark>{{ item.firstname }}</v-chip>
                    </template>
                    </v-data-table>
                </v-card>
            </v-card>
        </v-tab-item>
        <v-tab-item>
            <v-card  flat  tile >
                <v-card-text>coucou 2</v-card-text>
            </v-card>
        </v-tab-item>
        <v-tab-item>
            <v-card  flat  tile >
                <v-card-text>coucou 3</v-card-text>
            </v-card>
        </v-tab-item>
        <v-tab-item>
            <vo-basic :data="genealogData"></vo-basic>
        </v-tab-item>
    </v-tabs>










</div>
</template>



<script>
import axios from 'axios';
import { parseAxiosResponse, getPeopleAvatar } from '../middleware/CommonHelper';
import { VoBasic } from 'vue-orgchart';

export default  {
    components: {
        VoBasic
    },
    data: () => ({
        personEditor: {
            open: false,
            citationId: null,
            citation: null,
            author: null,
            isValid: true,
        },
        query: "",
        personsHeaders: [
            {
                text: 'Nom', value: 'lastname', align: 'left'
            },
            {
                text: 'Prénom', value: 'firstname', align: 'left'
            },
            {
                text: 'Prénoms secondaires', align: 'left', value: 'firsname2'
            },
            {
                text: 'Surnom', value: 'surname', align: 'left'
            },
            {
                text: 'Naissance', value: 'dateOfBirth', align: 'left'
            },
            {
                text: 'Emploi', value: 'job', align: 'left'
            },
            {
                text: 'Phone', value: 'phone', align: 'left'
            },
            {
                text: 'Email', value: 'email', align: 'left'
            },
            {
                text: 'Maison mère', value: 'root', align: 'left',
            },
            { text: 'Actions', value: 'name', sortable: false }
        ],
        isLoading: false,
        persons: [],
        places: [],
        totalPersons: 0,
        totalPlaces: 0,
        events: [],
        totalEvents: 0,
        genealogData: {
            name: 'JavaScript',
            children: [
                { name: 'Angular' },
                {
                    name: 'React',
                    children: [{ name: 'Preact' }]
                },
                {
                    name: 'Vue',
                    children: [{ name: 'Moon' }]
                }
            ]
        }
    }),
    mounted() {
        // Il faut initialiser la vue
        this.isLoading = true;
        axios.get(`/api/agenda/init`).then(response => {
            const data = parseAxiosResponse(response);
            this.persons = data.persons;
            this.totalPersons = data.totalPersons;
            this.isLoading = false;
        });
    },
    methods: {
        editPerson (person) {
            console.log("editPerson", person);
        },
        deletePerson (person) {
            console.log("deletePerson", person);
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../assets/global.scss';

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
    margin: 30px 0 60px 0;
}
</style>
