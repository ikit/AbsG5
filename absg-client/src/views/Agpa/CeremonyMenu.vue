<template>
  <v-container>
    <v-card
      :style="{
        margin: $vuetify.display.smAndDown ? '10px auto' : '20px auto',
        marginTop: $vuetify.display.smAndDown ? '60px' : '100px',
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
        vlf: null

    }),
    computed: {
        ...mapState([
            'settings',
            'agpaMeta',
            'user'
        ])
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
