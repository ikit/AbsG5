<template>
<div class="ceremony">
        <div class="reveal">
            <div class="slides">
                <section>
                    <h1>Absolument G Photos Awards</h1>
                    <h2>2018</h2>
                </section>

                <section>
                    <p>Statistiques</p>
                </section>

                <section v-for="(slide, cidx) in slides" :key="cidx" style="width:100%; height:100%">
                    <div v-if="slide.type === 'category'">
                        <h3>{{ slide.title }}</h3>
                        <img :src="`/img/agpa/cupesMaxi/c${slide.id}.png`" class="catIllustration"/>
                    </div>
                    <div v-if="slide.type === 'photo'">
                        <div style="position: absolute; top:0; left:0; right:0; bottom:0">
                            <v-img class="photo" :src="slide.url" :contain="true" aspect-ratio="1"></v-img>
                            <div class="photoInfo">
                                {{slide.title}}
                                <img :src="slide.avatar" class="authorAvatar"/>
                            </div>
                        </div>
                    </div>
                    <div v-if="slide.type === 'awardWaiting'">
                        <p>Délibération</p>
                    </div>
                    <div v-if="slide.type === 'photoAward'">
                        <div style="position: absolute; top:0; left:0; right:0; bottom:0">
                            <v-img class="photo" :src="slide.url" :contain="true" aspect-ratio="1"></v-img>
                            <div class="photoInfo">
                                {{slide.title}}
                                <img :src="slide.avatar" class="authorAvatar"/>
                                <img :src="slide.award" class="award"/>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
    </div>
</div>
</template>


<script>
import axios from 'axios';
import { agpaPhotoToGalleryPhoto } from '../../middleware/AgpaHelper';
import { padNumber } from '../../middleware/CommonHelper';
import * as Reveal from 'reveal';

export default {
    name: 'Ceremony',
    data: () => ({
        revealProgress: 0,
        year: 2018,
        slides: [],
        stats: {}
    }),
    mounted() {
        this.initView();
    },
    methods: {
        initView() {
            // Reset photos list
            this.photosGalery = [];
            this.photosGalleryIndex = 0;
            this.year = 2018; // Number.parseInt(this.$route.params.year);
            axios.get(`/api/agpa/ceremony/${this.year}`).then(response => {
                const data = response.status === 200 ? response.data : null;
                this.error = response.status !== 200 ? response : null;




                console.log("ready ", data)
                if (data) {
                    for(let catId in data.categories) {
                        if (catId > 0) {
                            const cat = data.categories[catId];
                            this.slides.push({ type: "category", id: catId, title: cat.title});
                            const nominated = cat.nominated.map(photo => ({
                                url: `http://absolumentg.fr/assets/img/agpa/${photo.year}/mini/${photo.filename}`,
                                title: photo.title,
                                username: photo.user.username,
                                avatar: `http://absolumentg.fr/assets/img/avatars/${padNumber(photo.user.id, 3)}.png`,
                            }));
                            this.slides = this.slides.concat(nominated.map(photo => { photo.type = "photo"; return photo; }));
                            this.slides.push({ type:"awardWaiting"});
                            const awards = cat.nominated.map(photo => ({
                                url: `http://absolumentg.fr/assets/img/agpa/${photo.year}/mini/${photo.filename}`,
                                title: photo.title,
                                username: photo.user.username,
                                avatar: `http://absolumentg.fr/assets/img/avatars/${padNumber(photo.user.id, 3)}.png`,
                                award: `/img/agpa/cupes/c${catId}-${photo.awards[catId]}.png`,

                            }));
                            awards.pop();
                            awards.reverse();
                            this.slides = this.slides.concat(awards.map(photo => { photo.type = "photoAward"; return photo; }));
                        }
                    }
                    console.log(" >  ", this.slides)

                    // store.commit('photosGalleryReset', this.photosGalery);
                }
                this.isLoading = false;

                Reveal.initialize({transition: "fade", progress: false, controls: false });
                Reveal.addEventListener("slidechanged", () => console.log("Progress: ", Reveal.getProgress() * 100, "%"));
            });
        },

        handleSlideChange(event) {

            this.setBatteryProgress(Reveal.getProgress() * 100);
        },
        setBatteryProgress(progress) {
            console.log(progress);
        }
    },
};
</script>

<style src='reveal/css/reveal.css'></style>

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
        height: 50vh;
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



}

</style>
