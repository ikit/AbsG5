<template>
  <div>
    <div class="ceremony">
      <div class="reveal">
        <div class="slides">
          <section>
            <h1>Absolument G Photos Awards</h1>
            <h2>{{ year }}</h2>
          </section>

          <section>
            <h3>Participation</h3>Reveal.layout();
            <highcharts :options="stats.diag1" />
          </section>

          <section
            v-for="(slide, cidx) in slides"
            :key="cidx"
            style="width:100%; height:100%"
          >
            <div v-if="slide.type === 'category'">
              <h3>{{ slide.title }}</h3>
              <img
                :src="`/img/agpa/cupesMaxi/c${slide.id}.png`"
                class="catIllustration"
              >
            </div>
            <div v-if="slide.type === 'photo'">
              <div style="position: absolute; top:0; left:0; right:0; bottom:0">
                <v-img
                  class="photo"
                  :src="slide.url"
                  :contain="true"
                  aspect-ratio="1"
                />
                <div class="photoInfo">
                  {{ slide.title }}
                  <img
                    :src="slide.avatar"
                    class="authorAvatar"
                  >
                </div>
              </div>
            </div>
            <div
              v-if="slide.type === 'awardWaiting'"
              style="width:100%; height:100%"
            >
              <div style="position: relative; display: flex; flex-direction: row; flex-wrap: wrap; height: 50%">
                <div class="photoDeliberating">
                  <v-img
                    style="height: 100%;"
                    :src="slide.photos[0]"
                    :contain="true"
                    aspect-ratio="1"
                  />
                </div>
                <div class="photoDeliberating">
                  <v-img
                    style="height: 100%;"
                    :src="slide.photos[1]"
                    :contain="true"
                    aspect-ratio="1"
                  />
                </div>
              </div>
              <div style="position: relative; display: flex; flex-direction: row; flex-wrap: wrap; height: 50%">
                <div class="photoDeliberating">
                  <v-img
                    style="height: 100%;"
                    :src="slide.photos[2]"
                    :contain="true"
                    aspect-ratio="1"
                  />
                </div>
                <div class="photoDeliberating">
                  <v-img
                    style="height: 100%;"
                    :src="slide.photos[3]"
                    :contain="true"
                    aspect-ratio="1"
                  />
                </div>
              </div>
            </div>
            <div v-if="slide.type === 'photoAward'">
              <div style="position: absolute; top:0; left:0; right:0; bottom:0">
                <v-img
                  class="photo"
                  :src="slide.url"
                  :contain="true"
                  aspect-ratio="1"
                />
                <div class="photoInfo">
                  {{ slide.title }}
                  <img
                    :src="slide.avatar"
                    class="authorAvatar"
                  >
                  <img
                    :src="slide.award"
                    class="award"
                  >
                </div>
              </div>
            </div>
            <div
              v-if="slide.type === 'bestAuthorWaiting'"
              class="allAuthors"
            >
              <img
                v-for="user of slide.users"
                :key="user.userId"
                :src="user.avatar"
              >
            </div>
            <div
              v-if="slide.type === 'bestAuthorAward'"
              style="width:100%; height:100%"
            >
              <img
                :src="slide.avatar"
                class="authorAvatar"
              >
              <h3>{{ slide.username }}</h3>
              <img
                :src="slide.award"
                class="award"
              >
              <!--
                        <div style="position: relative; display: flex; flex-direction: row; flex-wrap: wrap; height: 50%">
                            <div class="photoDeliberating">
                                <img :src="slide.avatar" class="authorAvatar"/>
                            </div>
                            <div class="photoDeliberating"><v-img style="height: 100%;" :src="slide.photos[0]" :contain="true" aspect-ratio="1"></v-img></div>
                        </div>
                        <div style="position: relative; display: flex; flex-direction: row; flex-wrap: wrap; height: 50%">
                            <div class="photoDeliberating"><v-img style="height: 100%;" :src="slide.photos[1]" :contain="true" aspect-ratio="1"></v-img></div>
                            <div class="photoDeliberating"><v-img style="height: 100%;" :src="slide.photos[2]" :contain="true" aspect-ratio="1"></v-img></div>
                        </div> -->
            </div>
          </section>

          <section>
            <h1>Merci !</h1>
          </section>

          <section>
            <button
              type="button"
              class="button"
              @click="close()"
            >
              Quitter la cérémonie
            </button>
          </section>
        </div>
      </div>

      <div class="controls">
        <v-btn
          small
          color="primary"
          dark
        >
          Début
        </v-btn>
        <v-btn
          small
          color="primary"
          dark
        >
          Précédante
        </v-btn>
        <v-btn
          small
          color="primary"
          dark
        >
          Suivante
        </v-btn>
        <v-btn
          small
          color="primary"
          dark
          @click="close()"
        >
          Quitter
        </v-btn>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import { mapState } from 'vuex';
import { parseAxiosResponse } from '../../middleware/CommonHelper';
import { agpaPhotoToGalleryPhoto } from '../../middleware/AgpaHelper';
import { padNumber } from '../../middleware/CommonHelper';
import {Chart} from 'highcharts-vue';
import * as md5 from "md5";
import Reveal from 'reveal.js';
import store from '../../store';

export default {
    name: "Ceremony",
    store,
    components: {
        highcharts: Chart
    },
    data: () => ({
        isLoading: false,
        year: 2018,
        slides: [],
        isMaster: false,
        stats: {
            diag1: {
                chart: {
                    styledMode: true
                },
                xAxis: [{
                    categories: [],
                    crosshair: true
                }],
                yAxis: [
                    {
                        title: {
                            text: 'Photos',
                        },
                        labels: {
                            format: '{value}',
                        }
                    },
                    {
                        opposite: true,
                        title: {
                            text: 'Participants',
                        },
                        labels: {
                            format: '{value}',
                        }
                    }],
                tooltip: {
                    shared: true
                },
                series: [],
                plotOptions: {
                    series: {
                        label: {
                            connectorAllowed: false
                        },
                        pointStart: 2006
                    }
                }
            }
        }
    }),
    computed: { ...mapState([
        "user",
        "wsMessage",
    ])},
    watch: {
        wsMessage(newValue, oldValue) {
            if (newValue.message === "agpaSynchSlide") {
                // On va au slide du maitre de cérémonie automatiquement
                const slideIdx = newValue.payload.slide;
                const slideHash = newValue.payload.hash;
                const remoteUser = newValue.payload.user;
                if (!this.isMaster && remoteUser.id != this.user.id) {
                    const hashIdx = this.slides.findIndex(s => s.hash === slideHash);
                    Reveal.slide(hashIdx > -1 ? hashIdx + 2 : slideIdx, 0, 0);
                }
            }
        }
    },
    mounted() {
        this.year = Number.parseInt(this.$route.params.year);
        this.initView()
    },
    methods: {
        initView() {
            // Les admins sont maîtres de cérémonie
            this.isMaster = !!this.user.roles.find(e => e === "admin");
            // Reset photos list
            this.photosGalery = [];
            this.photosGalleryIndex = 0;
            axios.get(`/api/agpa/ceremony/${this.year}`).then(response => {
                const data = parseAxiosResponse(response);
                if (data) {
                    // Participations
                    this.stats.diag1.series = [
                        {
                            name: 'Photos',
                            type: 'column',
                            yAxis: 0,
                            data: data.stats.totalPhotos.map(e => +e.total)
                        },
                        {
                            name: 'Participants',
                            type: 'spline',
                            yAxis: 1,
                            data: data.stats.totalAuthors.map(e => +e.total)
                        }
                    ];

                    // Categories
                    for(let catId in data.categories) {
                        const cat = data.categories[catId];
                        // Meilleurs photographes
                        if (catId == -1) {
                            this.slides.push({ type: "category", id: catId, title: cat.title});
                            this.slides.push({ type: "bestAuthorWaiting",
                                users: data.authors.sort(() => Math.random() - 0.5).map(
                                    e => ({
                                        ...e,
                                        avatar: `/files/avatars/${padNumber(e.userId, 3)}.png`,
                                    }))}
                                );
                            for (const s of data.categories[-1].nominated.reverse()) {
                                this.slides.push({
                                    type: "bestAuthorAward",
                                    ...s,
                                    photos:[],
                                    avatar: `/files/avatars/${padNumber(s.userId, 3)}.png`,
                                    award: `/img/agpa/cupes/cx1-${s.award}.png`});
                            }
                        } else
                        // AGPA d'honneurs
                        if (catId == -4) {
                            this.slides.push({ type: "category", id: catId, title: cat.title});
                            const awards = cat.nominated.map(photo => ({
                                type: "photoAward",
                                url: `/files/agpa/${photo.year}/mini/${photo.filename}`,
                                title: photo.title,
                                username: photo.username,
                                avatar: `/files/avatars/${padNumber(photo.userId, 3)}.png`,
                                award: `/img/agpa/cupes/c${catId.replace("-", "x")}-${photo.award}.png`,

                            }));
                            this.slides = this.slides.concat(awards);
                        }
                        // Les autres catégories
                        else {

                            this.slides.push({ type: "category", id: catId, title: cat.title});
                            let nominated = cat.nominated.map(photo => ({
                                url: `/files/agpa/${photo.year}/mini/${photo.filename}`,
                                title: photo.title,
                                username: photo.username,
                                avatar: `/files/avatars/${padNumber(photo.userId, 3)}.png`,
                            }));
                            nominated = nominated.map(photo => { photo.type = "photo"; return photo; }).sort(() => Math.random() - 0.5);
                            this.slides = this.slides.concat(nominated);
                            this.slides.push({ type:"awardWaiting", photos: nominated.map(e => e.url)});
                            const awards = cat.nominated.map(photo => ({
                                url: `/files/agpa/${photo.year}/mini/${photo.filename}`,
                                title: photo.title,
                                username: photo.username,
                                avatar: `/files/avatars/${padNumber(photo.userId, 3)}.png`,
                                award: `/img/agpa/cupes/c${catId.replace("-", "x")}-${photo.award}.png`,

                            }));
                            awards.pop();
                            awards.reverse();
                            this.slides = this.slides.concat(awards.map(photo => { photo.type = "photoAward"; return photo; }));
                        }
                    }

                    // POur la visio syncrhonisé des cérémonie, on ajoute à chaque slide une signature unique
                    // pour pouvoir retrouver un slide malgrès l'ordre aléatoire de certains slide
                    for (const s of this.slides) {
                        s.hash = md5(JSON.stringify(s));
                    }
                }

                this.isLoading = false;
                Reveal.initialize({transition: "fade", progress: false, controls: false });

                // On s'abonne aux événements
                Reveal.on( 'slidechanged', event => {
                    if (this.isMaster) {
                        const slide = this.slides[event.indexh - 2];
                        let hash = slide ? slide.hash : "-";
                        axios.get(`/api/agpa/ceremony/${this.year}/notifyMasterSlide/${event.indexh}/${hash}`);
                    }
                });
            });
        },

        close() {
            window.close();
        },
    },
};
</script>


<style src='reveal.js/dist/reveal.css'></style>
<style src='../../themes/agpa-highchart-theme.css'></style>

<style lang="scss" scoped>
@import '../../themes/global.scss';

.ceremony {
    position: fixed;
    top: 0;
    left:0;
    right: 0;
    bottom: 0;
    background-color: #000;
    background-image: url('/img/agpa/ceremony-background.jpg');
    z-index: 10000;
    color: #d0d0d0;

    font-family: 'Tangerine', serif;

    h1 {
        display: block;
        font-family: 'Tangerine', serif;
        font-size: 100px;
        margin-block-start: 0.67em;
        margin-block-end: 0.67em;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
        font-weight: 100;
        text-align: center;
        color: #e9a039;
        text-shadow: 0 2px #000;
        text-shadow: 0 -2px white;
        margin: 10vh 0 -100px 0;
    }
    h2 {
        color: #6f6f6f;
        font-size: 250px;
        font-weight: 100;
        text-shadow: 0 2px #000;
        text-shadow: 0 -2px white;
    }
    h3 {
        color: #f1d99f;
        font-size: 100px;
        font-weight: 100;
        text-shadow: 0 1px #000;
        text-shadow: 0 -1px white;
    }

    section {
        padding: 0
    }

    img.catIllustration {
        display: absolute;
        height: 60vh;
        margin: auto;
        bottom: 50px;
        border: none;
        background: none;
        padding: 0;
    }

    .photo {
        // background: #fff;
        // padding: 1px;
        // border: 1px solid #000;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 100px;
        filter:  drop-shadow(0 0 10px #000)
    }
    .photoDeliberating {
        flex-grow: 1;
        max-height: 95%;
        max-width: 95%;
        margin: 10px;
        filter:  drop-shadow(0 0 10px #000)
    }

    .photoInfo {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100px;
        padding: 0 100px;
        font-size: 40px;
        line-height: 1em;

        // Alignement vertical du text
        display: flex; // contexte sur le parent
        flex-direction: column; // direction d'affichage verticale
        justify-content: center; // alignement vertical


        .authorAvatar {
            position: absolute;
            top: 0;
            left: 0;
            width: 100px;
        }

        .award {
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
        }
    }

    .allAuthors {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        height: 100%;

        img {
            height: 100px
        }
    }

}

.controls {
    background: rgba(0,0,0,0.8);
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    height: 30px;
    opacity: 0;
    text-align: center;

    button {
        color: #fff;
        margin: 3px 10px;
        font-family: 'Lucida Sans', Verdana, sans-serif;

    }
}

.controls:hover {
    opacity: 1;
}


</style>
