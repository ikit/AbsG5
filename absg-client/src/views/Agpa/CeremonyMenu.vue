<template>
  <v-container>
    <v-card style="margin: 20px auto; margin-top: 100px; width: 600px; display: relative; padding: 40px 10px 40px 10px;">
      <img
        src="/img/agpa/cupesMaxi/c1.png"
        width="200px"
        style="position: absolute; top: -100px; left: calc(100%/2 - 100px);"
      >
      <h2 style="text-align: center; font-size: 3em; font-weight: bold; font-family: 'Tangerine', serif; color: #c0b44f; line-height: 1em;">
        <span style="font-size: 2em; font-weight: normal; padding-right: 3px;">{{ agpaMeta.year - 2005 }} </span><sup>ème</sup> cérémonie des A.G.P.A.
      </h2>
      <p style="text-align: center; font-size: 2em; font-weight: bold; font-family: 'Tangerine', serif; opacity: 0.3">
        ouverture dans
      </p>
      <Timer
        v-if="timerEnable"
        ref="timer"
        style="margin: auto"
        @completed="startCeremony()"
      />
      <div v-else style="text-align: center;">
        <v-btn
            color="primary"
            @click="startCeremony()"
            >
            <v-icon small left>fas fa-play</v-icon>
            Lancer la cérémonie
        </v-btn>
      </div>
    </v-card>


    <p v-if="prealoadInfoDisplay" class="preloadInfo">
      Vous avez encore le temps... en attendant vous pouvez revoir les anciennes cérémonies:
    </p>

    <div v-else class="preloadInfo">
        <p v-if="preloadProgress === 100">Vous êtes pret pour la cérémonie</p>
        <p v-else>Préchargement des données pour la cérémonie: {{ preloadProgress }}%</p>
    </div>

    <v-container
        v-if="prealoadInfoDisplay"
      fluid
      :style="{ 'display': current.displayed ? 'none' : 'block' }"
    >
      <v-layout
        row
        wrap
      >
        <v-flex
          v-for="edition in formerEditions"
          :key="edition.year"
          style="min-width: 250px; width: 250px; margin: 15px"
        >
          <a
            :href="`/agpa/ceremony/${edition.year}`"
            target="_blank"
            style="text-decoration: none"
          >
            <v-card style="width: 250px; height: 150px; margin: auto;">
              <v-img
                :src="`/files/agpa/${edition.year}/mini/${edition.photos[0].filename}`"
                aspect-ratio="2.75"
              />
              <p style=" margin: 0; text-align: center; font-size: 3em; font-weight: bold; font-family: 'Tangerine', serif; opacity: 0.5; line-height: 1em;">{{ edition.year }}</p>
            </v-card>
          </a>
        </v-flex>
      </v-layout>
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
        <source
          src="/files/agpa/intro.mp4"
          type="video/mp4"
        >
        Your browser does not support the video tag.
      </video>
    </div>
  </v-container>
</template>


<script>
import axios from 'axios';
import store from '../../store';
import { mapState } from 'vuex';
import { parseAxiosResponse } from '../../middleware/CommonHelper';
import { agpaPhotoToGalleryPhoto } from '../../middleware/AgpaHelper';
import { padNumber } from '../../middleware/CommonHelper';
import { addDays, addSeconds, format } from 'date-fns';
import Timer from '../../components/Timer';

import Vue from 'vue';
import Vlf from 'vlf';
import localforage from 'localforage';
Vue.use(Vlf, localforage);

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
        }

    }),
    computed: {
        ...mapState([
            'settings',
            'agpaMeta'
        ])
    },
    watch: {
        'settings': function () {
            setTimeout(() => this.resetTimer());
        }
    },
    mounted() {
        this.isLoading = true;

        // On récupère la date de la cérémonie depuis les settings du site
        setTimeout(() => this.resetTimer());

        axios.get(`/api/agpa/archives`).then(response => {
            this.formerEditions = parseAxiosResponse(response);
            this.isLoading = false;
        }).catch( err => {
            store.commit("onError", err);
        });

        this.$vlf.createInstance({
            storeName: 'absg5'
        });

        this.preloadIntro();
        this.preloadCeremony();
    },
    methods: {
        resetTimer() {
            const p1 = new Date(new Date().getFullYear(), 9, 1) // le 1er octobre à minuit
            const p2 = addDays(p1, this.settings.agpaPhase1Duration);
            const p3 = addDays(p2, this.settings.agpaPhase2Duration);
            const p4 = addDays(p3, this.settings.agpaPhase3Duration);
            let p5 = addDays(p4, this.settings.agpaPhase4Duration);
            p5 = addSeconds(p5, this.settings.agpaCeremonyStartTime);

            this.current.ceremonyDate = p5; // new Date( new Date().getTime() + 1000000);
            const delta = new Date().getTime() - p5.getTime();
            this.prealoadInfoDisplay = delta > 0 && delta < 86400000;
            if (new Date() > this.current.ceremonyDate) {
                this.timerEnable = false;
            } else {
                this.timerEnable = true;
                this.$refs.timer.init(this.current.ceremonyDate);
            }
        },

        startCeremony() {
            this.current.displayed = true;
            this.$refs.video.play();
            this.$refs.timer.stop();
        },

        openCeremonySlideShow() {
            this.re
            this.$refs.video.pause();
            window.open(`/agpa/ceremony/${this.agpaMeta.year}`, '_blank');
            this.current.displayed = false;
            this.timerEnable = false;
        },

        preloadIntro() {
            const that = this;
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
            )
        },

        preloadCeremony() {
            const that = this;
            that.$vlf.getItem("ceremonyData").then(
                data => {
                    if (!data) {
                        // Si on ne trouve pas l'intro, on la prétélécharge
                        axios.get(`/api/agpa/ceremony/${that.agpaMeta.year}`).then(response => {
                            const d = parseAxiosResponse(response);
                            if (d) {
                                // On sauvegarde localement la vidéo
                                that.$vlf.setItem('ceremonyData', d).then(v => {
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
@import '../../themes/global.scss';
@import '../../themes/agpa.scss';


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
