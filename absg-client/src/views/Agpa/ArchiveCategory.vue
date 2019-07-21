<template>
    <section id="content">
        <div v-if="isLoading" style="width: 50px; margin: 50px auto;">
            <v-progress-circular
                :size="50"
                color="primary"
                indeterminate>
            </v-progress-circular>
        </div>
        <div v-if="!isLoading && !current">Une erreur est survenue :( ...<br/>{{ error }}</div>

        <div v-if="current">
            <h2>Catégorie {{ category }} {{ year }}</h2>
        <button type="button" @click="showLitebox">Show Litebox</button>

            <v-container fluid v-if="current">
                <v-layout row wrap>
                    <v-flex v-for="photo in current.photos" :key="photo.id" style="min-width: 250px; width: 15%; margin: 15px">
                        <div>
                            <div style="width: 250px; height: 250px; margin: auto;">
                                <div style="width: 250px; height: 250px; display: table-cell; text-align: center; vertical-align: middle;">
                                    <img class="thumb" :src="`http://absolumentg.fr/assets/img/agpa/${year}/mini/vignette_${photo.filename}`"/>
                                </div>
                            </div>
                            <div style="">

                            </div>
                            <v-card style="margin-bottom: 50px">
                                <div style="text-align: center">
                                    {{ photo.title }}
                                </div>
                                <div> {{ photo.user.username }} </div>
                            </v-card>
                        </div>
                    </v-flex>
                </v-layout>
            </v-container>
        </div>

        <div  v-if="liteboxOn" style="position: fixed; z-index:20000 top: 0; left: 0; right:0; bottom: 0; background: rgba(0,0,0,0.5)">
            <vue-litebox
                :items="photosGalery"
                @close="hideLitebox">
                <!-- <a v-for="img in photosGalery"
                        :key="img.idx"
                        :data-image="img.url"
                        :title="img.title">
                        <div class="bgbox">
                            <img :src="img.url">
                        </div>
                        <div class="img-title" v-html="img.title"></div>
                    </a> -->
            </vue-litebox>
        </div>
    </section>
</template>


<script>
import axios from 'axios';
import VueLitebox from 'vue-litebox';

export default {
    components: {
        VueLitebox,
    },
    data: () => ({
        isLoading: true,
        current: null,
        error: null,
        year: 0,
        category: null,
        photosGalery: [],
        liteboxOn: false
    }),
    props: ['darkMode'],
    mounted () {
        console.log(this.$route.params);
        this.year = this.$route.params.year;
        this.category = this.$route.params.catId;
        axios.get(`/api/agpa/archives/${this.$route.params.year}/${this.$route.params.catId}`).then(response => {
            console.log(response);
            this.current = response.status === 200 ? response.data : null;
            this.error = response.status !== 200 ? response : null;
            this.isLoading = false;
            // Prepare photo galery
            if (this.current) {
                let idx = 0;
                for (let photo of this.current.photos) {
                    this.photosGalery.push({
                        src: `http://absolumentg.fr/assets/img/agpa/${this.year}/mini/${photo.filename}`,
                        title: photo.title,
                        idx: idx
                    });
                    idx++;
                }
            }
        });
    },
    methods: {
        showLitebox() {
            this.liteboxOn = true;
        },
        hideLitebox() {
            this.liteboxOn = false;
        }
    }
};
</script>


<style lang="scss" scoped>
@import '../../assets/global.scss';

#content {
    text-align: center;
}

h2 {
    font-family: 'Tangerine', serif;
    color: orange;
    font-size: 3em;
    margin: 0 35px;
}
h2:hover {
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);

}

.thumb {
    background: white;
    padding: 1px;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
}
</style>
