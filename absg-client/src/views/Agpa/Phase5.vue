<template>
<div>
    <h2>Edition {{ current.editionYear }} des AGPA</h2>

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
                        <v-btn flat color="accent">Voir les photos</v-btn>
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

h1 {
    display: block;
    font-size: 2em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;
    text-align: center;
    color: $primary;
    text-shadow: 0 -1px #000;
    text-shadow: 0 1px #aaa;
    font-size: 40px;
    font-family: "Comfortaa", sans-serif;
    margin: 20px 0 60px 0;
}
</style>
