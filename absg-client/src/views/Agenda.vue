<template>
<div>
    <img
        v-if="$vuetify.breakpoint.mdAndUp"
        src="/img/immt-new.png"
        style="width: 206px; height: 120px; position: absolute; left: 10px;"/>
    <h1>L'agenda de la famille</h1>

    <v-tabs centered>
        <v-tab> <v-icon>fas fa-address-book</v-icon> &nbsp; Répertoire</v-tab>
        <v-tab> <v-icon>fas fa-map-marked-alt</v-icon> &nbsp; Lieux</v-tab>
        <v-tab> <v-icon>fas fa-calendar-alt</v-icon> &nbsp; Calendrier</v-tab>
        <v-tab> <v-icon>fas fa-user-circle</v-icon> &nbsp; Trombinoscope</v-tab>
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
                <v-card-text>annuaire des lieux G</v-card-text>
            </v-card>
        </v-tab-item>
        <v-tab-item>
            <v-card  flat  tile >
                <v-card-text>Calendrier partagé</v-card-text>
            </v-card>
        </v-tab-item>
        <v-tab-item>
            <v-card  flat  tile >
                <v-card-text>Trombinoscope</v-card-text>
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
            name: 'LETOT Raymond',
            children: [
                {
                    name: 'GUEUDELOT Annie',
                    children: [
                        { name: 'Sébastien' },
                        { name: 'Emmanuel' },
                        { name: 'Olivier' }]
                },
                {
                    name: 'GUYOMARD Jocelyne',
                    children: [
                        { name: 'Julien' },
                        { name: 'Fanny' },
                        { name: 'Frédéric' },
                        { name: 'Marion' }]
                },
                {
                    name: 'GUIBERT Sylviane',
                    children: [{ name: 'Thomas' }]
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
@import '../themes/global.scss';

</style>
