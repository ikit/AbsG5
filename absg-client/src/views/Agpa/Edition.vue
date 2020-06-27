<template>
<v-container>
    <!-- Ecran d'attente entre 2 éditions (février-septembre) -->
    <v-card v-if="currentMonth > 0 && currentMonth < 9" style="margin: auto; margin-top: 50px; width: 600px; position: relative; padding: 40px 10px 10px 10px;">
        <img src="/img/agpa/cupesMaxi/c1.png" height="100px" style="position: absolute; top: -50px; left: calc(50% - 56px)"/>
        <p style="text-align: center; font-size: 2em; font-weight: bold; font-family: 'Tangerine', serif; color: #c0b44f; line-height: 1em;">
            L'édition <span style="font-size: 2em; font-weight: normal; padding-right: 3px;"> {{ currentYear }}</span> des A.G.P.A. n'a pas encore démarrée.
        </p>
        <v-timeline >
            <v-timeline-item small v-for="item in phases" :key="item.id" right>
                <template v-slot:opposite>
                    <span> {{ item.start }}</span>
                </template>
                {{ item.label }}
            </v-timeline-item>
        </v-timeline>
        <v-card v-if="current && current.categories[8] && current.categories[8].title" style="margin: 15px; text-align: center; padding: 15px">
            <p style="opacity: 0.5; ">Thème de l'année</p>
            <p style="font-weight: bold; font-size: 1.1em; margin-bottom: 0">{{ current.categories[8].title }}</p>
            <p style="font-style: italic">{{ current.categories[8].description }}</p>
        </v-card>
        <v-card v-else style="margin: 15px; font-weight: bold; color: #ff8f00; padding: 15px">
            <v-icon color="warning" style="width: 50px">fas fa-exclamation-triangle</v-icon>
            Aucun thème pour la catégorie spéciale n'a été décidé
        </v-card>
        <v-card style="margin: 15px; padding: 15px">
            <v-icon style="width: 50px">fas fa-info</v-icon>
            N'hésitez pas à discuter de l'organisation sur <router-link :to="{ path: '/forum/' }" tag="a">le forum</router-link>.
        </v-card>
    </v-card>

    <!-- Affichage de l'édition en cours -->
    <section v-else>
        <div v-if="isLoading" style="width: 50px; margin: 50px auto;">
            <v-progress-circular
                :size="50"
                color="primary"
                indeterminate>
            </v-progress-circular>
        </div>
        <div v-if="!isLoading && !current">Une erreur est survenue :( ...<br/>{{ error }}</div>
        <Phase1 v-if="current && current.phase == 1" :current="current"></Phase1>
        <Phase2 v-if="current && current.phase == 2" :current="current"></Phase2>
        <Phase3 v-if="current && current.phase == 3" :current="current"></Phase3>
        <Phase4 v-if="current && current.phase == 4" :current="current"></Phase4>
        <Phase5 v-if="current && current.phase == 5" :current="current"></Phase5>
    </section>
</v-container>
</template>


<script>
import axios from 'axios';
import { mapState } from 'vuex';
import { getModuleInfo, getPeopleAvatar, parseAxiosResponse } from '../../middleware/CommonHelper';
import { format } from 'date-fns';
import { fr } from "date-fns/locale";
import Phase1 from './Phase1';
import Phase2 from './Phase2';
import Phase3 from './Phase3';
import Phase4 from './Phase4';
import Phase5 from './Phase5';

export default {
    components: {
        Phase1,
        Phase2,
        Phase3,
        Phase4,
        Phase5,
    },
    data: () => ({
        isLoading: true,
        agpaMeta: null,
        currentMonth: null,
        currentYear: null,
        error: null,
        phases: [
            { number: 1, label: "Enregistrement des photos", start: format(new Date(2020, 9, 1), "do MMM 'à' HH'h'mm", {locale: fr}) },
            { number: 2, label: "Validation des photos", start: format(new Date(2020, 11, 19), "dd MMM 'à' HH'h'mm", {locale: fr}) },
            { number: 3, label: "Votes", start: format(new Date(2020, 11, 20), "dd MMM 'à' HH'h'mm", {locale: fr}) },
            { number: 4, label: "Dépouillement", start: format(new Date(2020, 11, 24, 15), "dd MMM 'à' HH'h'mm", {locale: fr}) },
            { number: 5, label: "Cérémonie des AGPA", start: format(new Date(2020, 11, 24, 20, 30), "dd MMM 'à' HH'h'mm", {locale: fr}) },
        ],
    }),
    computed: {
        ...mapState([
            'agpaMeta',
        ]),
    },
    mounted () {
        axios.get('/api/agpa').then(response => {
            this.currentMonth = new Date().getMonth();
            this.currentYear = new Date().getFullYear();
            this.current = parseAxiosResponse(response);
            this.isLoading = false;
        });

    },
    methods: {

        getCategoryPhoto (cat) {
            let url = '';
            if (cat.id > 0) {
                const photo = this.current.photos[cat.photos[0]];
                url = `/files/agpa/${this.current.editionYear}/mini/${photo.filename}`;

            } else {
                url = '/img/avatars/016.png';
            }
            return url;
        },

        resetDialog (open = false) {
            this.citationEditor.open = open;
            this.citationEditor.citationId = null;
            this.citationEditor.citation = null;
            this.citationEditor.author = null;
        },
        saveCitation: function () {
            this.citations.push({
                authorAvatar: '/img/avatars/016.png',
                authorId: 16,
                authorName: this.citationEditor.author,
                citation: this.citationEditor.citation,
            });
            this.resetDialog();
        }
    },
};
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';

#content {
    text-align: center;
}
h2 {
    font-family: 'Tangerine', serif;
    color: orange;
    font-size: 3em;
}
</style>

