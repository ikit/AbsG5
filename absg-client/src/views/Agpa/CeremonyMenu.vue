<template>
  <v-container>
    <!-- Debug Panel -->
    <v-card
      v-if="debugMode"
      :style="{
        margin: '10px auto',
        marginTop: '60px',
        padding: '15px',
        maxWidth: '600px',
        background: '#fff3cd',
        border: '2px solid #ffc107'
      }"
    >
      <div style="text-align: center; margin-bottom: 10px;">
        <strong>🔧 Mode Debug - Simulation de Phase</strong>
      </div>
      <v-row dense>
        <v-col cols="12" sm="6">
          <v-btn
            block
            size="small"
            :color="debugPhase === 'phase1-4' ? 'primary' : 'default'"
            @click="setDebugPhase('phase1-4')"
          >
            Phase 1-4 (timer)
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6">
          <v-btn
            block
            size="small"
            :color="debugPhase === 'phase5' ? 'primary' : 'default'"
            @click="setDebugPhase('phase5')"
          >
            Phase 5 (revoir)
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6">
          <v-btn
            block
            size="small"
            :color="debugPhase === 'interlude' ? 'primary' : 'default'"
            @click="setDebugPhase('interlude')"
          >
            Interlude (annonce)
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6">
          <v-btn
            block
            size="small"
            color="error"
            @click="toggleDebugMode()"
          >
            Désactiver debug
          </v-btn>
        </v-col>
      </v-row>
      <div style="margin-top: 10px; font-size: 0.8em; text-align: center; opacity: 0.7;">
        <span v-if="debugPhase === 'phase1-4'">Période 1: Nouvelle édition (oct-déc/jan) - Affiche timer</span>
        <span v-else-if="debugPhase === 'phase5'">Période 2: Post-cérémonie (janv) - Revoir la cérémonie</span>
        <span v-else-if="debugPhase === 'interlude'">Période 3: Interlude (fév-sept) - Annonce prochaine édition</span>
      </div>
    </v-card>

    <v-card
      :style="{
        margin: $vuetify.display.smAndDown ? '10px auto' : '20px auto',
        marginTop: debugMode ? '20px' : ($vuetify.display.smAndDown ? '60px' : '100px'),
        width: $vuetify.display.smAndDown ? '100%' : '600px',
        maxWidth: $vuetify.display.smAndDown ? '100%' : '600px',
        display: 'relative',
        padding: $vuetify.display.smAndDown ? '30px 10px 20px 10px' : '40px 10px 40px 10px',
        overflow: 'visible'
      }"
    >
      <img
        src="/img/agpa/cupesMaxi/c1.png"
        :width="$vuetify.display.smAndDown ? '120px' : '200px'"
        :style="{
          position: 'absolute',
          top: $vuetify.display.smAndDown ? '-60px' : '-100px',
          left: $vuetify.display.smAndDown ? 'calc(50% - 60px)' : 'calc(50% - 100px)'
        }"
      >
      <h2
        :style="{
          textAlign: 'center',
          fontSize: $vuetify.display.smAndDown ? '1.8em' : '3em',
          fontWeight: 'bold',
          fontFamily: 'Tangerine, serif',
          color: '#c0b44f',
          lineHeight: '1em'
        }"
      >
        <span
          :style="{
            fontSize: '2em',
            fontWeight: 'normal',
            paddingRight: '3px'
          }"
        >{{ agpaMeta ? (agpaMeta.year - 2005) : "?" }} </span><sup>ème</sup> cérémonie des A.G.P.A.
      </h2>
      <p
        :style="{
          textAlign: 'center',
          fontSize: $vuetify.display.smAndDown ? '1.2em' : '2em',
          fontWeight: 'bold',
          fontFamily: 'Tangerine, serif',
          opacity: 0.3
        }"
      >
        ouverture dans
      </p>
      <Timer
        v-if="timerEnable && current.ceremonyDate"
        ref="timer"
        :end="current.ceremonyDate"
        style="margin: auto"
        @completed="startCeremony()"
      />
      <div
        v-else
        style="text-align: center;"
      >
        <v-btn
          color="primary"
          @click="startCeremony()"
        >
          <v-icon
            small
            left
          >
            fas fa-play
          </v-icon>
          Lancer la cérémonie
        </v-btn>
      </div>
    </v-card>

    <!-- Panneau annonce prochaine édition (Période Interlude: février à septembre) -->
    <v-card
      v-if="!current.displayed && isInterludePeriod"
      :style="{
        margin: $vuetify.display.smAndDown ? '20px auto' : '40px auto',
        width: $vuetify.display.smAndDown ? '100%' : '600px',
        maxWidth: $vuetify.display.smAndDown ? '100%' : '600px',
        padding: $vuetify.display.smAndDown ? '20px' : '30px',
        textAlign: 'center'
      }"
    >
      <h3
        :style="{
          fontSize: $vuetify.display.smAndDown ? '1.5em' : '2em',
          fontWeight: 'bold',
          fontFamily: 'Tangerine, serif',
          color: '#c0b44f',
          marginBottom: '15px'
        }"
      >
        Prochaine édition des A.G.P.A.
      </h3>
      <p
        :style="{
          fontSize: $vuetify.display.smAndDown ? '1em' : '1.2em',
          marginBottom: '10px',
          opacity: 0.8
        }"
      >
        La {{ agpaMeta ? (agpaMeta.year - 2005) : '?' }}<sup>ème</sup> édition des A.G.P.A. débutera le <strong>1er octobre {{ agpaMeta ? agpaMeta.year : '' }}</strong>
      </p>
      <p
        v-if="settings && settings.agpaSpecialEdition && settings.agpaSpecialEdition.title"
        :style="{
          fontSize: $vuetify.display.smAndDown ? '0.9em' : '1.1em',
          fontStyle: 'italic',
          opacity: 0.7
        }"
      >
        Thème de la catégorie spéciale : <strong>{{ settings.agpaSpecialEdition.title }}</strong>
      </p>
    </v-card>

    <div
      v-if="!current.displayed"
      class="preloadInfo"
    >
      <p v-if="prealoadInfoDisplay">
        Vous avez encore le temps... en attendant vous pouvez revoir les anciennes cérémonies:
      </p>
      <p v-else-if="preloadProgress === 100">
        Vous êtes pret pour la cérémonie
      </p>
      <p v-else-if="preloadProgress < 100">
        Préchargement des données pour la cérémonie: {{ preloadProgress }}%
      </p>
      <p v-else>
        Vous pouvez revoir les anciennes cérémonies:
      </p>
    </div>

    <v-container
      v-if="!current.displayed"
      fluid
    >
      <v-row
        row
        wrap
      >
        <v-col
          v-for="edition in formerEditions"
          :key="edition.year"
          :cols="6"
          :sm="4"
          :md="3"
          :style="{
            minWidth: $vuetify.display.xs ? '150px' : '250px',
            margin: $vuetify.display.smAndDown ? '10px auto' : '15px'
          }"
        >
          <a
            v-if="edition.photos && edition.photos.length > 0"
            :href="`/agpa/ceremony/${edition.year}`"
            target="_blank"
            style="text-decoration: none"
          >
            <v-card
              :style="{
                width: $vuetify.display.xs ? '100%' : '250px',
                margin: 'auto'
              }"
            >
              <v-img
                :src="`/files/agpa/${edition.year}/mini/${edition.photos[0].filename}`"
                :height="$vuetify.display.xs ? '120px' : '150px'"
                cover
              />
              <p
                :style="{
                  margin: 0,
                  textAlign: 'center',
                  fontSize: $vuetify.display.xs ? '2em' : '3em',
                  fontWeight: 'bold',
                  fontFamily: 'Tangerine, serif',
                  opacity: 0.5,
                  lineHeight: '1em'
                }"
              >
                {{ edition.year }}
              </p>
            </v-card>
          </a>
        </v-col>
      </v-row>
    </v-container>

    <div :class="{ ceremony: current.displayed, hiddenCeremony: !current.displayed }">
      <video
        ref="video"
        style="margin: auto;"
        width="100%"
        height="100%"
        controls
        preload="auto"
        @ended="openCeremonySlideShow()"
      >
        <!-- TODO: Restaurer après migration - fichier manquant -->
        <!-- <source
          src="/files/agpa/intro.mp4"
          type="video/mp4"
        > -->
        Your browser does not support the video tag.
      </video>
    </div>
  </v-container>
</template>


<script>
import axios from 'axios';
import store from '../../stores/helpers';
import { mapState } from '../../stores/helpers';
import { parseAxiosResponse } from '../../middleware/CommonHelper';
import { agpaPhotoToGalleryPhoto } from '../../middleware/AgpaHelper';
import { padNumber } from '../../middleware/CommonHelper';
import { addDays, addSeconds, format } from 'date-fns';
import Timer from '../../components/Timer.vue';

import localforage from 'localforage';

export default {
    name: 'CeremonyMenu',
    store,
    components: {
        Timer,
    },
    data: () => ({
        isLoading: false,
        timerEnable: true, // par défaut on l'affich pour éviter les probleme d'init avec le DOM
        prealoadInfoDisplay: false,
        preloadProgress: 0,

        formerEditions: [],
        current: {
            ceremonyDate: null,
            displayed: false
        },
        vlf: null,

        // Debug mode
        debugMode: false,
        debugPhase: null

    }),
    computed: {
        ...mapState([
            'settings',
            'agpaMeta',
            'user'
        ]),

        isInterludePeriod() {
            // En mode debug, vérifier si on est en période interlude
            if (this.debugMode && this.debugPhase === 'interlude') {
                return true;
            }

            // En mode normal, vérifier si on est entre février et septembre
            if (!this.debugMode && this.current.ceremonyDate) {
                const now = new Date();
                const month = now.getMonth(); // 0-11
                // Février (1) à septembre (8)
                // Et la cérémonie doit être très loin dans le futur (plus de 60 jours)
                const daysUntilCeremony = (this.current.ceremonyDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                return month >= 1 && month <= 8 && daysUntilCeremony > 60;
            }

            return false;
        }
    },
    watch: {
        'settings': function () {
            if (this.agpaMeta && this.settings) {
                setTimeout(() => this.resetTimer());
            }
        },
        'agpaMeta': function () {
            if (this.agpaMeta && this.settings) {
                setTimeout(() => this.resetTimer());
            }
        }
    },
    mounted() {
        this.isAdmin = this.user?.roles?.find(e => e === "admin") !== undefined;
        this.vlf = localforage.createInstance({
            storeName: 'absg5'
        });

        // Activer le mode debug si URL contient ?debug=true (pour les admins uniquement)
        if (this.isAdmin && this.$route.query.debug === 'true') {
            this.debugMode = true;
        }

        // Ajouter un raccourci clavier pour les admins (Ctrl+Shift+D)
        if (this.isAdmin) {
            window.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                    e.preventDefault();
                    this.toggleDebugMode();
                }
            });
        }

        if (this.agpaMeta && this.settings) {
            // On récupère la date de la cérémonie depuis les settings du site
            setTimeout(() => this.resetTimer());
        }
        if (!this.agpaMeta) {
            store.dispatch('initAGPA');
        }

        this.isLoading = true;
        axios.get(`/api/agpa/archives`).then(response => {
            this.formerEditions = parseAxiosResponse(response);
            this.isLoading = false;
        }).catch( err => {
            store.commit("onError", err);
        });
    },
    methods: {
        resetTimer() {
            if (!this.agpaMeta) return;

            // Calcul identique à agpaCommonHelpers.ts du backend
            // Phase 1 démarre le 1er octobre à minuit
            let startDate = new Date(this.agpaMeta.year, 9, 1, 0, 0, 0);

            // Phase 1 se termine X1 jours plus tard à 1h du matin
            startDate = addDays(startDate, this.settings.agpaPhase1Duration);
            startDate = addSeconds(startDate, 3600); // +1h pour terminer à 1h

            // Phase 2 se termine X2 jours plus tard à 1h du matin (addDays préserve l'heure)
            startDate = addDays(startDate, this.settings.agpaPhase2Duration);

            // Phase 3 se termine X3 jours plus tard à 1h du matin
            startDate = addDays(startDate, this.settings.agpaPhase3Duration);

            // Phase 4 se termine X4 jours plus tard à l'heure de la cérémonie
            startDate = addDays(startDate, this.settings.agpaPhase4Duration);
            // On retire 1h (revenir à minuit) puis on ajoute l'heure de la cérémonie
            startDate = addSeconds(startDate, -3600 + this.settings.agpaCeremonyStartTime);

            this.current.ceremonyDate = startDate;
            const delta = new Date().getTime() - startDate.getTime();
            this.prealoadInfoDisplay = delta > 0 && delta < 86400000;
            if (new Date() > this.current.ceremonyDate) {
                this.timerEnable = false;
            } else {
                this.timerEnable = true;
            }

            this.preloadIntro();
            this.preloadCeremony();
        },

        startCeremony() {
            this.current.displayed = true;
            this.$refs.video.play();
            if (this.$refs.timer) {
                this.$refs.timer.stop();
            }
        },

        openCeremonySlideShow() {
            this.re
            this.$refs.video.pause();
            window.open(`/agpa/ceremony/${this.agpaMeta.year}`, '_blank');
            this.current.displayed = false;
            this.timerEnable = false;
        },

        preloadIntro() {
            // TODO: Restaurer après migration - fichier intro.mp4 manquant
            // Temporairement désactivé pendant la migration
            this.introReady();
            /* const that = this;
            that.$vlf.getItem("ceremonyIntro").then(
                data => {
                    if (!data) {
                        // Si on ne trouve pas l'intro, on la prétélécharge
                        var req = new XMLHttpRequest();
                        req.open('GET', '/files/agpa/intro.mp4', true);
                        req.responseType = 'blob';

                        req.onprogress = (event) => {
                            this.preloadProgress = Math.round((event.loaded / event.total) * 100);
                        }

                        req.onload = function() {
                            // Onload is triggered even on 404
                            // so we need to check the status code
                            if (this.status === 200) {
                                var videoBlob = this.response;
                                // On sauvegarde localement la vidéo
                                that.$vlf.setItem('ceremonyIntro', videoBlob).then(v => {
                                    console.log(v);
                                });

                                var vid = URL.createObjectURL(videoBlob); // IE10+
                                // Video is now downloaded
                                // and we can set it as source on the video element
                                that.$refs.video.src = vid;
                            }
                        }
                        req.onerror = function() {
                            // Error
                        }

                        req.send();
                    } else {
                        // SI la vidéos est déjà là, on la charge directement
                        var vid = URL.createObjectURL(data); // IE10+
                        // Video is now downloaded
                        // and we can set it as source on the video element
                        that.$refs.video.src = vid;
                    }
                    that.introReady();
                }
            ) */
        },

        preloadCeremony() {
            const that = this;
            that.vlf.getItem("ceremonyData").then(
                data => {
                    if (!data) {
                        // Si on ne trouve pas l'intro, on la prétélécharge
                        axios.get(`/api/agpa/ceremony/${that.agpaMeta.year}`).then(response => {
                            const d = parseAxiosResponse(response);
                            if (d) {
                                // On sauvegarde localement la vidéo
                                that.vlf.setItem('ceremonyData', d).then(v => {
                                    that.preloadImages(d);
                                });
                            }
                        });
                    } else {
                        that.preloadImages(data);
                    }
                }
            )
        },

        preloadImages(data) {
            console.log(data)
        },

        introReady(){
            this.preloadProgress = 100;
        },

        // Debug mode methods
        toggleDebugMode() {
            this.debugMode = !this.debugMode;
            if (!this.debugMode) {
                this.debugPhase = null;
                this.resetTimer(); // Recalculer avec les vraies dates
            }
        },

        setDebugPhase(phase) {
            this.debugPhase = phase;
            const now = new Date();
            const currentYear = now.getFullYear();

            if (phase === 'phase1-4') {
                // Période 1: Nouvelle édition (phases 1-4: octobre à cérémonie)
                // Simuler qu'on est le 15 novembre avec cérémonie dans 1 mois
                this.current.ceremonyDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                this.timerEnable = true;
                this.current.displayed = false;
            } else if (phase === 'phase5') {
                // Période 2: Post-cérémonie (phase 5: de fin cérémonie à fin janvier)
                // Simuler qu'on est en janvier, cérémonie passée
                this.current.ceremonyDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                this.timerEnable = false;
                this.current.displayed = false;
            } else if (phase === 'interlude') {
                // Période 3: Interlude (février à septembre)
                // Simuler qu'on est en mars, cérémonie très loin dans le futur (octobre prochain)
                const nextOctober = new Date(currentYear, 9, 1, 0, 0, 0);
                // Si on est déjà passé octobre, prendre l'année suivante
                if (now.getMonth() >= 9) {
                    nextOctober.setFullYear(currentYear + 1);
                }
                this.current.ceremonyDate = nextOctober;
                this.timerEnable = true;
                this.current.displayed = false;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@use '../../themes/global.scss' as *;
@use '../../themes/agpa.scss' as *;


.hiddenCeremony {
    visibility: hidden;
}
.ceremony {
    opacity:0;
    position: fixed;
    overflow: hidden;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: #000;
    z-index: 10000;
    -moz-animation: anim 3s linear forwards;
    -webkit-animation: anim 3s linear forwards;
    -o-animation: anim 3s linear forwards;
    -ms-animation: anim 3s linear forwards;
    animation: anim 3s linear forwards;
}
@-moz-keyframes anim {
   0%  {opacity:0;}
   100% {opacity:1;}
}
@-webkit-keyframes anim {
   0%  {opacity:0;}
   100% {opacity:1;}
}
@-o-keyframes anim {
   0%  {opacity:0;}
   100% {opacity:1;}
}
@-ms-keyframes anim {
   0%  {opacity:0;}
   100% {opacity:1;}
}
@keyframes anim {
   0%  {opacity:0;}
   100% {opacity:1;}
}
.preloadInfo {
    text-align: center;
    font-size: 1em;
    font-weight: bold;
    font-family: serif;
    opacity: 0.5
}

</style>
