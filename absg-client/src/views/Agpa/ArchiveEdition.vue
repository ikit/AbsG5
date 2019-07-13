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
                        <router-link :to="{name: '/archives/{{current.editionYear}}/{{cat.id}}'}">
                            <v-btn flat color="accent" >Voir les photos</v-btn>
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
    name: 'Phase5',
    data: () => ({
    }),
    props: ['current'],
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

        resetDialog (open = false) {
            this.citationEditor.open = open;
            this.citationEditor.citationId = null;
            this.citationEditor.citation = null;
            this.citationEditor.author = null;
        },
        saveCitation: function () {
            this.citations.push({
                authorAvatar: 'http://absolumentg.fr/assets/img/avatars/016.png',
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
@import '../../assets/global.scss';

h2 {
    font-family: 'Tangerine', serif;
    color: orange;
    font-size: 3em;
}
</style>
