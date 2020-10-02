<template>
<div>
    <h2>Edition {{ current.editionYear }}</h2>

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
                        <router-link :to="`/agpa/archives/${current.editionYear}/${cat.id}`" tag="button">
                            <v-btn text color="accent">Voir les photos</v-btn>
                        </router-link>
                    </v-card-actions>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</div>
</template>


<script>

export default {
    data: () => ({
    }),
    props: ['current'],
    methods: {
        getCategoryPhoto (cat) {
            let url = '';
            if (cat.id > 0) {
                const photo = this.current.photos[cat.photos[0]];
                url = `/files/agpa/${this.current.editionYear}/mini/${photo.filename}`;

            } else {
                url = '/img/avatars/016.png';
            }
            return url;
        },
        resetDialog (open = false) {
            this.citationEditor.open = open;
            this.citationEditor.citationId = null;
            this.citationEditor.citation = null;
            this.citationEditor.author = null;
        },
        saveCitation: function () {
            this.citations.push({
                authorAvatar: '/img/avatars/016.png',
                authorId: 16,
                authorName: this.citationEditor.author,
                citation: this.citationEditor.citation,
            });
            this.resetDialog();
        }
    }
};
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';

h2 {
    font-family: 'Tangerine', serif;
    // font-family: "Comfortaa", sans-serif;
    color: orange;
    font-size: 3em;
    font-weight: bold;
    text-shadow:
        0 1px 0 #ccc, 0 2px 0 #c9c9c9,
        0 3px 0 #bbb, 0 4px 0 #b9b9b9,
        0 5px 0 #aaa, 0 6px 1px rgba(0,0,0,.1),
        0 0 5px rgba(0,0,0,.1), 0 1px 3px rgba(0,0,0,.3),
        0 3px 5px rgba(0,0,0,.2), 0 5px 10px rgba(0,0,0,.25),
        0 10px 10px rgba(0,0,0,.2), 0 20px 20px rgba(0,0,0,.15);
}
</style>
