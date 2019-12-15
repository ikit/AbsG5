<template>
<div class="ceremony">
        <div class="reveal">
            <div class="slides">
                <section>
                    <h1>Absolument G Photos Awards</h1>
                    <h2>2018</h2>
                </section>

                <section v-for="(slide, cidx) in slides" :key="cidx">
                    <div v-if="slide.type === 'category'">
                        <h3>Categorie {{ slide.id }}</h3>
                        <img :src="`/img/agpa/cupesMaxi/c${slide.id}.jpg`" class="catIllustration"/>
                    </div>
                    <div v-if="slide.type === 'photo'">
                        <div style="position: relative; padding: 50px; height: 70vh;">
                            <img :src="slide.url"/>
                            <div style="text-align: center">
                                {{slide.title}}
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
import * as Reveal from 'reveal';

export default {
    name: 'Ceremony',
    data: () => ({
        revealProgress: 0,
        year: 2018,
        slides: []
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
            axios.get(`/api/agpa/archives/${this.year}`).then(response => {
                const data = response.status === 200 ? response.data : null;
                this.error = response.status !== 200 ? response : null;
                // Prepare photo galery
                console.log("ready ", data)
                if (data) {
                    for(let catId in data.categories) {
                        const cat = data.categories[catId];
                        this.slides.push({ type: "category", id: catId});
                        if (catId > 0) {
                            for (let photo of cat.photos) {
                                let slide = agpaPhotoToGalleryPhoto(photo);
                                slide.type = "photo";
                                this.slides.push(slide);
                            }
                        }
                    }
                    console.log(" >  ", this.slides)

                    // store.commit('photosGalleryReset', this.photosGalery);
                }
                this.isLoading = false;

                Reveal.initialize();
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
    background: #000;
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

    img {
        background: #fff;
        padding: 1px;
        border: 1px solid #000;
        max-height: 100%;
        max-width: 100%;
    }


    .catIllustration {
        display: absolute;
        height: 50vh;
        margin: auto;
        bottom: 50px;
        border: none;
        background: none;
        padding: 0;
    }

}

</style>
