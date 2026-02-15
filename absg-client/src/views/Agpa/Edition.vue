<template>
  <v-container class="edition-container">
    <!-- Ecran d'attente entre 2 éditions (février-septembre) -->
    <v-card
      v-if="currentMonth > 0 && currentMonth < 9"
      class="edition-main-card"
    >
      <img
        src="/img/agpa/cupesMaxi/c1.png"
        height="100px"
        class="edition-cup-icon"
      >
      <p class="edition-title">
        L'édition <span class="edition-title-year"> {{ currentYear }}</span> des A.G.P.A. n'a pas encore démarrée.
      </p>
      <v-timeline>
        <v-timeline-item
          v-for="item in phases"
          :key="item.id"
          small
          right
        >
          <template #opposite>
            <span> {{ item.start }}</span>
          </template>
          {{ item.label }}
        </v-timeline-item>
      </v-timeline>
      <v-card
        v-if="agpaMeta && agpaMeta.categories[8] && agpaMeta.categories[8].title"
        class="edition-inner-card edition-theme-card"
      >
        <p class="edition-theme-label">
          Thème de l'année
        </p>
        <p class="edition-theme-title">
          {{ agpaMeta.categories[8].title }}
        </p>
        <p class="edition-theme-description">
          {{ agpaMeta.categories[8].description }}
        </p>
      </v-card>
      <v-card
        v-else
        class="edition-inner-card edition-warning-card text-warning"
      >
        <v-icon
          color="warning"
          class="edition-icon"
        >
          fas fa-exclamation-triangle
        </v-icon>
        Aucun thème pour la catégorie spéciale n'a été décidé
      </v-card>
      <v-card class="edition-inner-card">
        <v-icon class="edition-icon">
          fas fa-info
        </v-icon>
        N'hésitez pas à discuter de l'organisation sur WhatApps.
      </v-card>
    </v-card>
    <!-- Affichage de l'édition en cours -->
    <section v-else>
      <div
        v-if="isLoading"
        class="edition-loader"
      >
        <v-progress-circular
          :size="50"
          color="primary"
          indeterminate
        />
      </div>
      <Phase1 v-if="agpaMeta && agpaMeta.phase == 1" />
      <Phase2 v-if="agpaMeta && agpaMeta.phase == 2" />
      <Phase3 v-if="agpaMeta && agpaMeta.phase == 3" />
      <Phase4 v-if="agpaMeta && agpaMeta.phase == 4" />
      <Phase5 v-if="agpaMeta && agpaMeta.phase == 5" />
    </section>
  </v-container>
</template>


<script>
import store from '../../stores/helpers';
import { mapState } from '../../stores/helpers';
import { getModuleInfo, getPeopleAvatar } from '../../middleware/CommonHelper';
import { format } from 'date-fns';
import { fr } from "date-fns/locale";
import Phase1 from './Phase1.vue';
import Phase2 from './Phase2.vue';
import Phase3 from './Phase3.vue';
import Phase4 from './Phase4.vue';
import Phase5 from './Phase5.vue';

export default {
    components: {
        Phase1,
        Phase2,
        Phase3,
        Phase4,
        Phase5,
    },
    store,
    data: () => ({
        isLoading: true,
        currentMonth: null,
        currentYear: null,
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
    watch: {
        'agpaMeta': function () {
            this.init();
        }
    },
    mounted () {
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        if (this.agpaMeta) {
            this.init();
        }
    },
    methods: {
        init() {
            this.isLoading = false;
            for (let i = 0; i< 5; i++) {
                this.phases[i].start = format(new Date(this.agpaMeta.boudaries[i].startDate), "do MMM 'à' HH'h'mm", {locale: fr})
            }
        }
    }
};
</script>


<style lang="scss" scoped>
@use '../../themes/global.scss' as *;

#content {
    text-align: center;
}
h2 {
    font-family: 'Tangerine', serif;
    color: rgb(var(--v-theme-warning));
    font-size: 3em;
}

.edition-container {
    max-width: 100%;
    margin: 0;
    padding: 0;
}
.edition-main-card {
    margin: auto;
    margin-top: 50px;
    width: 600px;
    position: relative;
    padding: 40px 10px 10px 10px;
    overflow: visible;
}
.edition-cup-icon {
    position: absolute;
    top: -50px;
    left: calc(50% - 56px);
    z-index: 1;
}
.edition-title {
    text-align: center;
    font-size: 2em;
    font-weight: bold;
    font-family: 'Tangerine', serif;
    color: #c0b44f;
    line-height: 1em;
}
.edition-title-year {
    font-size: 2em;
    font-weight: normal;
    padding-right: 3px;
}
.edition-inner-card {
    margin: 15px;
    padding: 15px;
}
.edition-theme-card {
    text-align: center;
}
.edition-theme-label {
    opacity: 0.5;
}
.edition-theme-title {
    font-weight: bold;
    font-size: 1.1em;
    margin-bottom: 0;
}
.edition-theme-description {
    font-style: italic;
}
.edition-warning-card {
    font-weight: bold;
}
.edition-icon {
    width: 50px;
}
.edition-loader {
    width: 50px;
    margin: 50px auto;
}
</style>

