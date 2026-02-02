<template>
  <div
    v-cloak
    class="home"
  >
    <v-container
      fluid
      grid-list-xl
    >
      <!-- Widgets row -->
      <v-row>
        <!-- Événements à venir -->
        <v-col
          cols="12"
          md="4"
        >
          <UpcomingEventsWidget :events="upcomingEvents" />
        </v-col>

        <!-- Citation du jour -->
        <v-col
          cols="12"
          md="4"
        >
          <CitationWidget :citation="citation" />
        </v-col>

        <!-- Culture G - Ce jour dans l'histoire -->
        <v-col
          cols="12"
          md="4"
        >
          <OnThisDayWidget :events="onThisDay" />
        </v-col>
      </v-row>

      <!-- Jeux quotidiens -->
      <v-row class="mt-4">
        <!-- Sudoku du jour -->
        <v-col
          cols="12"
          md="6"
        >
          <SudokuWidget :puzzle="sudoku" />
        </v-col>

        <!-- Mot mystère Wikipedia -->
        <v-col
          cols="12"
          md="6"
        >
          <WikiMysteryWidget :game="wikiMystery" @renew="renewWikiMystery" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>


<script>
import axios from 'axios';
import { parseAxiosResponse } from '../middleware/CommonHelper';
import UpcomingEventsWidget from '../components/widgets/UpcomingEventsWidget.vue';
import CitationWidget from '../components/widgets/CitationWidget.vue';
import OnThisDayWidget from '../components/widgets/OnThisDayWidget.vue';
import SudokuWidget from '../components/widgets/SudokuWidget.vue';
import WikiMysteryWidget from '../components/widgets/WikiMysteryWidget.vue';

export default {
    components: {
        UpcomingEventsWidget,
        CitationWidget,
        OnThisDayWidget,
        SudokuWidget,
        WikiMysteryWidget
    },
    data: () => ({
        upcomingEvents: [],
        citation: null,
        onThisDay: [],
        sudoku: null,
        wikiMystery: null
    }),
    mounted() {
        this.getHomeData();
        this.getDailyGames();
    },
    methods: {
        getHomeData() {
            axios.get(`/api/homepage`).then(response => {
                const data = parseAxiosResponse(response);
                if (data) {
                    if (data.upcomingEvents) {
                        this.upcomingEvents = data.upcomingEvents;
                    }
                    if (data.citation) {
                        this.citation = data.citation;
                    }
                    if (data.onThisDay) {
                        this.onThisDay = data.onThisDay;
                    }
                }
            });
        },
        getDailyGames() {
            axios.get(`/api/daily-games`).then(response => {
                const data = parseAxiosResponse(response);
                if (data) {
                    if (data.sudoku) {
                        this.sudoku = data.sudoku;
                    }
                    if (data.wikiMystery) {
                        this.wikiMystery = data.wikiMystery;
                    }
                }
            });
        },
        renewWikiMystery() {
            this.wikiMystery = null;
            axios.get(`/api/daily-games/wiki-mystery`).then(response => {
                const data = parseAxiosResponse(response);
                if (data) {
                    this.wikiMystery = data;
                }
            });
        }
    }
};
</script>



<style lang="scss" scoped>
@use '../themes/global.scss' as *;
</style>
