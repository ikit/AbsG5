<template>
  <v-container style="max-width: 100%; margin: 0; padding: 0;">
    <!-- Ecran d'attente entre 2 éditions (février-septembre) -->
    <v-card
      v-if="currentMonth > 0 && currentMonth < 9"
      style="margin: auto; margin-top: 50px; width: 600px; position: relative; padding: 40px 10px 10px 10px; overflow: visible;"
    >
      <img
        src="/img/agpa/cupesMaxi/c1.png"
        height="100px"
        style="position: absolute; top: -50px; left: calc(50% - 56px); z-index: 1;"
      >
      <p style="text-align: center; font-size: 2em; font-weight: bold; font-family: 'Tangerine', serif; color: #c0b44f; line-height: 1em;">
        L'édition <span style="font-size: 2em; font-weight: normal; padding-right: 3px;"> {{ currentYear }}</span> des A.G.P.A. n'a pas encore démarrée.
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
        style="margin: 15px; text-align: center; padding: 15px"
      >
        <p style="opacity: 0.5; ">
          Thème de l'année
        </p>
        <p style="font-weight: bold; font-size: 1.1em; margin-bottom: 0">
          {{ agpaMeta.categories[8].title }}
        </p>
        <p style="font-style: italic">
          {{ agpaMeta.categories[8].description }}
        </p>
      </v-card>
      <v-card
        v-else
        style="margin: 15px; font-weight: bold; color: #ff8f00; padding: 15px"
      >
        <v-icon
          color="warning"
          style="width: 50px"
        >
          fas fa-exclamation-triangle
        </v-icon>
        Aucun thème pour la catégorie spéciale n'a été décidé
      </v-card>
      <v-card style="margin: 15px; padding: 15px">
        <v-icon style="width: 50px">
          fas fa-info
        </v-icon>
        N'hésitez pas à discuter de l'organisation sur <router-link
          :to="{ path: '/forum/' }"
          tag="a"
        >
          le forum
        </router-link>.
      </v-card>
    </v-card>
    <!-- Affichage de l'édition en cours -->
    <section v-else>
      <div
        v-if="isLoading"
        style="width: 50px; margin: 50px auto;"
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
import store from '../../store';
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
    color: orange;
    font-size: 3em;
}
</style>

