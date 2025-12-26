<template>
  <div>
    <div :class="{ stickyHeader: $vuetify.display.lgAndUp, stickyHeaderSmall: !$vuetify.display.lgAndUp }">
      <v-row
        style="padding: 15px"
        align="center"
        justify="center"
      >
        <v-tooltip
          v-if="$vuetify.display.mdAndUp"
          bottom
        >
          <template #activator="{ props }">
            <v-btn
              text
              :disabled="isLoading || (currentYear == 2004 && currentMonth == 0)"
              v-bind="props"
              @click="go(2004, 0)"
            >
              Janvier 2004
            </v-btn>
          </template>
          <span>Premier message</span>
        </v-tooltip>

        <div>
          <v-tooltip bottom>
            <template #activator="{ props }">
              <v-btn
                icon
                small
                :disabled="isLoading || currentYear < 2015"
                v-bind="props"
                @click="goByMonths(-12)"
              >
                <v-icon>fas fa-angle-double-left</v-icon>
              </v-btn>
            </template>
            <span>Revenir un an en arrière</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{ props }">
              <v-btn
                icon
                small
                :disabled="isLoading || currentYear < 2004 || (currentYear == 2004 && currentMonth == 0)"
                v-bind="props"
                @click="goByMonths(-1)"
              >
                <v-icon>fa-chevron-left</v-icon>
              </v-btn>
            </template>
            <span>Revenir un mois en arrière</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ props }">
              <v-btn
                text
                width="200px"
                :disabled="isLoading"
                v-bind="props"
              >
                {{ monthLabels[currentMonth] }} {{ currentYear }}
              </v-btn>
            </template>
            <span>Modifier directement la date en cours</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{ props }">
              <v-btn
                icon
                small
                :disabled="isLoading || currentYear > todayYear || (currentYear == todayYear && currentMonth == todayMonth)"
                v-bind="props"
                @click="goByMonths(1)"
              >
                <v-icon>fa-chevron-right</v-icon>
              </v-btn>
            </template>
            <span>Aller au mois suivant</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{ props }">
              <v-btn
                icon
                small
                :disabled="isLoading || currentYear >= todayYear || (currentYear == todayYear -1 && currentMonth > todayMonth)"
                v-bind="props"
                @click="goByMonths(12)"
              >
                <v-icon>fas fa-angle-double-right</v-icon>
              </v-btn>
            </template>
            <span>Aller à l'année suivante</span>
          </v-tooltip>
        </div>

        <v-tooltip
          v-if="$vuetify.display.mdAndUp"
          bottom
        >
          <template #activator="{ props }">
            <v-btn
              text
              :disabled="isLoading || (currentYear === todayYear && currentMonth === todayMonth)"
              v-bind="props"
              @click="go(todayYear, todayMonth, true)"
            >
              Aujourd'hui
            </v-btn>
          </template>
          <span>Dernier message</span>
        </v-tooltip>
      </v-row>
    </div>

    <Reader
      ref="messageReader"
      :topic-id="-1"
    />
  </div>
</template>

<script>
import axios from 'axios';
import store from '../../store';
import { parseAxiosResponse } from '../../middleware/CommonHelper';
import { addMonths, addYears } from 'date-fns';
import Reader from "./Reader.vue";

export default {
    components: {
        Reader
    },
    data: () => ({
        isLoading: false,
        monthLabels: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
        todayYear: 0,
        todayMonth: 0,
        currentYear: 0,
        currentMonth: 0,
    }),
    mounted() {
        const today = new Date();
        this.todayYear = today.getFullYear();
        this.todayMonth = today.getMonth();

        // On récupère les paramètres de filtrage/pagination en query paramter
        this.currentYear = Number.parseInt(this.$route.query.y); // ? this.$route.query.y : this.todayYear;
        this.currentMonth = Number.parseInt(this.$route.query.m); // ? this.$route.query.m : this.todayMonth;
        this.currentYear = Number.isSafeInteger(this.currentYear) ? this.currentYear :  this.todayYear;
        this.currentMonth = Number.isSafeInteger(this.currentMonth) && this.currentMonth >= 0 && this.currentMonth <= 11 ? this.currentMonth : this.todayMonth;
        this.go(this.currentYear, this.currentMonth);

    },
    methods: {
        // Récupère les messages de la période demandé et les affiches
        go(year, month) {

            this.currentYear = year;
            this.currentMonth = month;
            axios.get(`/api/forum/tbz/${year}/${month}`).then(response => {
                const data = parseAxiosResponse(response);
                this.$refs.messageReader.initTopic(data);
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
@use '../../themes/global.scss' as *;


h1 {
    font-size: 2em;
    line-height: 50px;
    margin-bottom: 50px;
}


</style>
