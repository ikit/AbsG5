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
        <Phase1 v-if="current && current.phase == 1" :current="current"></Phase1>
        <Phase2 v-if="current && current.phase == 2" :current="current"></Phase2>
        <Phase3 v-if="current && current.phase == 3" :current="current"></Phase3>
        <Phase4 v-if="current && current.phase == 4" :current="current"></Phase4>
        <Phase5 v-if="current && current.phase == 5" :current="current"></Phase5>
    </section>
</template>


<script>
import axios from 'axios';
import Phase1 from './Phase1';
import Phase2 from './Phase2';
import Phase3 from './Phase3';
import Phase4 from './Phase4';
import Phase5 from './Phase5';

console.log("Edition !!!");

export default {
    components: {
        Phase1,
        Phase2,
        Phase3,
        Phase4,
        Phase5,
    },
    data: () => ({
        isLoading: true,
        current: null,
        error: null,
    }),
    mounted () {
        console.log("mounted");
        axios.get('/api/agpa').then(response => {
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
@import '../../themes/global.scss';

#content {
    text-align: center;
}
h2 {
    font-family: 'Tangerine', serif;
    color: orange;
    font-size: 3em;
}
</style>

