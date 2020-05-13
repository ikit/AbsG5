<template>
<div>
    <v-container fluid  grid-list-md style="padding:0">
        <v-data-iterator
            :items="messages"
            hide-default-footer>

            <template v-slot:header>
                <div v-bind:class="{ stickyHeader: $vuetify.breakpoint.lgAndUp, stickyHeaderSmall: !$vuetify.breakpoint.lgAndUp }">
                    <v-row style="padding: 15px" align="center" justify="center">

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    text
                                    v-on="on"
                                    :disabled="isLoading || (currentYear == 2004 && currentMonth == 0)"
                                    @click="go(2004, 0)">
                                    Janvier 2004
                                </v-btn>
                            </template>
                            <span>Premier message</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    icon small
                                    v-on="on"
                                    @click="goByMonths(-12)"
                                    :disabled="isLoading || currentYear < 2015">
                                    <v-icon>fas fa-angle-double-left</v-icon>
                                </v-btn>
                            </template>
                            <span>Revenir un an en arrière</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    icon small
                                    v-on="on"
                                    @click="goByMonths(-1)"
                                    :disabled="isLoading || currentYear < 2004 || (currentYear == 2004 && currentMonth == 0)">
                                    <v-icon>fa-chevron-left</v-icon>
                                </v-btn>
                            </template>
                            <span>Revenir un mois en arrière</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    text
                                    v-on="on"
                                    width="200px"
                                    :disabled="isLoading">
                                    {{ monthLabels[currentMonth] }} {{ currentYear }}
                                </v-btn>
                            </template>
                            <span>Modifier directement la date en cours</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    icon small
                                    v-on="on"
                                    @click="goByMonths(1)"
                                    :disabled="isLoading || currentYear > todayYear || (currentYear == todayYear && currentMonth == todayMonth)">
                                    <v-icon>fa-chevron-right</v-icon>
                                </v-btn>
                            </template>
                            <span>Aller au mois suivant</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    icon small
                                    v-on="on"
                                    @click="goByMonths(12)"
                                    :disabled="isLoading || currentYear >= todayYear || (currentYear == todayYear -1 && currentMonth > todayMonth)">
                                    <v-icon>fas fa-angle-double-right</v-icon>
                                </v-btn>
                            </template>
                            <span>Aller à l'année suivante</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    text
                                    v-on="on"
                                    @click="go(todayYear, todayMonth, true)"
                                    :disabled="isLoading">
                                    Aujourd'hui
                                </v-btn>
                            </template>
                            <span>Dernier message</span>
                        </v-tooltip>
                    </v-row>
                </div>
            </template>


            <template v-slot:default="props">
                <v-timeline align-top dense style="background: none; margin: auto; max-width: 700px; width: 100%;">
                    <v-timeline-item fill-dot color="#fff" v-for="msg in messages" :key="msg.id">
                        <template v-slot:icon>
                            <div>
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <img :src="msg.poster.avatar" v-on="on" style="width: 50px;" />
                                    </template>
                                    <span>{{ msg.poster.username }} {{ msg.dateLabel }}</span>
                                </v-tooltip>

                                <div class="msgDetails" v-bind:style="{ display: $vuetify.breakpoint.lgAndUp ? 'block' : 'none' }">
                                    <span class="name">{{ msg.poster.username }}</span>
                                    <span class="date">{{ msg.dateLabel }}</span>
                                </div>
                            </div>

                        </template>

                        <v-card style="padding: 0 15px">
                            <v-list-item-content>
                                <div class="citation" v-html="msg.text"></div>
                            </v-list-item-content>
                        </v-card>
                    </v-timeline-item>
                </v-timeline>
            </template>
        </v-data-iterator>
        <a name="last"></a>
    </v-container>
</div>
</template>

<script>
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import '@ckeditor/ckeditor5-build-classic/build/translations/fr';
import VueCkeditor from 'vue-ckeditor5';
import VueSplitter from "@rmp135/vue-splitter"


import axios from 'axios';
import { parseAxiosResponse } from '../../middleware/CommonHelper';
import { addMonths, addYears } from 'date-fns';


export default {
    components: {
        'vue-ckeditor': VueCkeditor.component,
        VueSplitter
    },
    data: () => ({
        monthLabels: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
        todayYear: 0,
        todayMonth: 0,
        currentYear: 0,
        currentMonth: 0,
        messages: []
    }),
    mounted() {
        const today = new Date();
        this.todayYear = today.getFullYear();
        this.todayMonth = today.getMonth();

        // On récupère les paramètres de filtrage/pagination en query paramter
        console.log("---", this.$route.query.y, this.$route.query.m)
        this.currentYear = Number.parseInt(this.$route.query.y); // ? this.$route.query.y : this.todayYear;
        this.currentMonth = Number.parseInt(this.$route.query.m); // ? this.$route.query.m : this.todayMonth;
        this.currentYear = Number.isSafeInteger(this.currentYear) ? this.currentYear :  this.todayYear;
        this.currentMonth = Number.isSafeInteger(this.currentMonth) && this.currentMonth >= 0 && this.currentMonth <= 11 ? this.currentMonth : this.todayMonth;
        console.log("---", this.currentYear, this.currentMonth)
        this.go(this.currentYear, this.currentMonth);



    },
    methods: {
        // Récupère les messages de la période demandé et les affiches
        go(year, month) {

            this.currentYear = year;
            this.currentMonth = month;
            axios.get(`/api/forum/tbz/${year}/${month}`).then(response => {
                const data = parseAxiosResponse(response);
                console.log("GET ", year, month, data)
                this.messages = data;
            });
        },

        // Additionne (ou soustrait) le nombre de mois demandé et affiche les messages
        goByMonths(months) {
            const date = addMonths(new Date(this.currentYear, this.currentMonth), months);
            this.go(date.getFullYear(), date.getMonth());
        },
    }
};
</script>

<style lang="scss" scoped>
@import '../../themes/global.scss';

.msgDetails {
    position: absolute;
    text-align: right;
    top: 0;
    right: 80px;
    width: 200px;
    font-size: 0.9em;
    font-family: "Comfortaa", sans-serif;

    span {
        display: block;
    }
    .name {
        font-weight: bold;
    }
    .date {
        opacity: 0.5;
    }
}


</style>
