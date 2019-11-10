<template>
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
</template>



<script>
import axios from 'axios';
import { parseAxiosResponse, getPeopleAvatar } from '../../middleware/CommonHelper';

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
        totalPersons: 0,

    }),
    mounted() {
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
@import '../../themes/global.scss';

</style>
