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
            <v-card style="line-height: 75px; margin: 30px 20px; font-family: 'Tangerine', serif; color: orange; font-size: 3em;">
                Edition
                <v-btn text icon color="orange" style="vertical-align: inherit;" @click="gotoNextYear(-1)">
                    <v-icon>fas fa-chevron-left</v-icon>
                </v-btn>

                {{ year }}
                <v-btn text icon color="orange" style="vertical-align: inherit;" @click="gotoNextYear(1)">
                    <v-icon>fas fa-chevron-right</v-icon>
                </v-btn>

                <div style="display: inline-block; width: 100px;">
                </div>

                Catégorie
                <v-btn text icon color="orange" style="vertical-align: inherit;" @click="gotoNextCat(-1)">
                    <v-icon>fas fa-chevron-left</v-icon>
                </v-btn>
                {{ category }}
                <v-btn text icon color="orange" style="vertical-align: inherit;" @click="gotoNextCat(1)">
                    <v-icon>fas fa-chevron-right</v-icon>
                </v-btn>

                <v-menu offset-y :close-on-content-click="false">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn text icon color="orange" style="vertical-align: inherit;" v-bind="attrs" v-on="on">
                            <v-icon>fas fa-bars</v-icon>
                        </v-btn>
                    </template>

                    <v-list>
                        <v-list-item
                            v-for="(filter, index) in filters"
                            :key="index">
                            <v-list-item-action>
                                <v-checkbox v-model="filter.selected"></v-checkbox>
                            </v-list-item-action>
                            <v-list-item-title>{{ filter.text }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>

            </v-card>

            <v-container fluid v-if="current">
                <v-layout row wrap>
                    <v-flex v-for="(photo, index) in photosGalery" :key="photo.id" style="min-width: 250px; width: 15%; margin: 15px">
                        <div>
                            <div style="width: 250px; height: 250px; margin: auto;">
                                <div style="width: 250px; height: 250px; display: table-cell; text-align: center; vertical-align: middle;">
                                    <img class="thumb" :src="photo.thumb" @click="photosGalleryDisplay(index)"/>
                                </div>
                            </div>
                            <div style="">

                            </div>
                            <v-card style="margin-bottom: 50px">
                                <div style="text-align: center">
                                    {{ photo.title }}
                                </div>
                                <div> {{ photo.username }} </div>
                            </v-card>
                        </div>
                    </v-flex>
                </v-layout>
            </v-container>
        </div>
    </section>
</template>


<script>
import axios from 'axios';
import store from '../../store';

export default {
    store,
    data: () => ({
        isLoading: true,
        current: null,
        error: null,
        year: 0,
        category: null,
        photosGalery: [],
        liteboxOn: false,
        archivesMeta: {
            maxYear: 2018,
            minYear: 2006,
            cats1: [1, 2, 3, 4, 5, 6, -2, -1],
            cats2: [1, 2, 7, 3, 4, 5, 8, 6 ,-3, -2, -1]
        }
    }),
    props: ['darkMode'],
    mounted () {
        this.initView();
    },
    watch: {
        $route(to, from) {
            this.initView();
        }
    },
    methods: {
        initView() {
            // Reset photos list
            this.photosGalery = [];
            this.year = Number.parseInt(this.$route.params.year);
            this.category = Number.parseInt(this.$route.params.catId);
            axios.get(`/api/agpa/archives/${this.year}/${this.$route.params.catId}`).then(response => {
                this.current = response.status === 200 ? response.data : null;
                this.error = response.status !== 200 ? response : null;
                this.isLoading = false;
                // Prepare photo galery
                if (this.current) {
                    let idx = 0;
                    for (let photo of this.current.photos) {
                        this.photosGalery.push({
                            url: `http://absolumentg.fr/assets/img/agpa/${this.year}/mini/${photo.filename}`,
                            thumb: `http://absolumentg.fr/assets/img/agpa/${this.year}/mini/vignette_${photo.filename}`,
                            title: photo.title,
                            username: photo.user.username
                        });
                        idx++;
                    }
                    store.commit('photosGalleryReset', this.photosGalery);
                }
            });
        },
        photosGalleryDisplay(index) {
            store.commit('photosGallerySetIndex', index);
            store.commit('photosGalleryDisplay');
        },
        photosGalleryHide() {
            store.commit('photosGalleryHide');
        },
        gotoNextYear(step) {
            let nextYear = this.year + step;
            nextYear = nextYear > this.archivesMeta.maxYear ? this.archivesMeta.minYear : nextYear;
            nextYear = nextYear < this.archivesMeta.minYear ? this.archivesMeta.maxYear : nextYear;
            this.$router.replace({path: `/agpa/archives/${nextYear}/${this.category}`});
        },
        gotoNextCat(step) {
            const cats = this.year < 2012 ? this.archivesMeta.cats1 : this.archivesMeta.cats2;
            let catIdx = cats.indexOf(this.category);
            catIdx += step;
            catIdx %= cats.length;
            this.$router.replace({path: `/agpa/archives/${this.year}/${cats[catIdx]}`});
        }
    }
};
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';

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
