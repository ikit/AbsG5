<template>
<div>




    <h2>Archive Edition {{ current.editionYear }}</h2>

    <v-container fluid v-if="current">
        <v-layout row wrap>
            <v-flex v-for="cat in current.categories" :key="cat.id" style="min-width: 300px; width: 40%; margin: 15px">
                <v-card>
                    <v-img
                        :src="getCategoryPhoto(cat)"
                        aspect-ratio="2.75">
                    </v-img>

                    <v-card-title primary-title>
                        <div style="text-align: left">
                            <h3 class="headline mb-0">Catégorie {{ cat.title }} </h3>
                            <div> {{ cat.description }} </div>
                        </div>
                    </v-card-title>

                    <v-card-actions>
                        <router-link :to="{name: '/archives/' + current.editionYear + '/' + cat.id}">
                            <v-btn text color="accent" >Voir les photos</v-btn>
                        </router-link>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</div>
</template>


<script>
import axios from 'axios';

export default {
    name: 'Phase5',
    data: () => ({
    }),
    props: ['current'],
    mounted () {
        console.log('salut', this.$route.params);
        this.year = this.$route.params.year ? this.$route.params.year : '';
        axios.get(`/api/agpa/archives/${this.year}`).then(response => {
            console.log(response);
            this.current = response.status === 200 ? response.data : null;
            this.error = response.status !== 200 ? response : null;
            this.isLoading = false;
        });
    },
    methods: {


        getCategoryPhoto (cat) {
            let url = '';
            if (cat.id > 0) {
                const photo = this.current.photos[cat.photos[0]];
                url = `http://absolumentg.fr/assets/img/agpa/${this.current.editionYear}/mini/${photo.filename}`;

            } else {
                url = 'http://absolumentg.fr/assets/img/avatars/016.png';
            }
            return url;
        },
    }

};
</script>


<style lang="scss" scoped>
@import '../../assets/global.scss';

h2 {
    font-family: 'Tangerine', serif;
    color: orange;
    font-size: 3em;
}
</style>
