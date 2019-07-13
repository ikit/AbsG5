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
            <h2>{{ year }} - Catégorie {{ category }}</h2>
            <LightBox :images="photosGalery" :showLightBox="false"></LightBox>
            <v-container fluid v-if="current">
                <v-layout row wrap>
                    <v-flex v-for="photo in current.photos" :key="photo.id" style="min-width: 200px; width: 15%; margin: 15px">
                        <v-card>
                            <v-img
                                :src="`http://absolumentg.fr/assets/img/agpa/${year}/mini/${photo.filename}`"
                                aspect-ratio="1">
                            </v-img>

                            <div style="text-align: center">
                                {{ photo.title }}
                            </div>
                            <div> {{ photo.user.username }} </div>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </div>

    </section>
</template>


<script>
import axios from 'axios';
import LightBox from 'vue-image-lightbox';

export default {
    components: {
        LightBox,
    },
    data: () => ({
        isLoading: true,
        current: null,
        error: null,
        year: 0,
        category: null,
        photosGalery: [],
    }),
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
                for (let photo of this.current.photos) {
                    this.photosGalery.push({
                        thumb: `http://absolumentg.fr/assets/img/agpa/${this.year}/mini/${photo.filename}`,
                        src: `http://absolumentg.fr/assets/img/agpa/${this.year}/mini/${photo.filename}`,
                        caption: photo.title,
                    });
                }
            }
        });
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
}
</style>
