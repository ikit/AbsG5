<template>
<div>
    <img
        v-if="$vuetify.breakpoint.mdAndUp"
        src="/img/immt-new.png"
        style="width: 206px; height: 120px; position: absolute; left: 10px;"/>
    <h1>Les photos de famille</h1>

    <v-tabs centered>
        <v-tab :to="{path:'/photos/immt'}"> <v-icon>fas fa-image</v-icon> &nbsp; Immt</v-tab>
        <v-tab :to="{path:'/photos/albums'}"> <v-icon>fas fa-images</v-icon> &nbsp; Albums</v-tab>
        <v-tab :to="{path:'/photos/sorting'}"> <v-icon>fab fa-stack-overflow</v-icon> &nbsp; A tier</v-tab>
    </v-tabs>

    <router-view></router-view>

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
