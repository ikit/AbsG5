<template>
    <div class="p4">
        <p>Le concours des A.G.P.A. est désormais terminé.
            Rendez-vous l'année prochaine pour une nouvelle édition :)
        </p>
        <p>Vous pouvez revivre la cérémonie en allant dans la section <a href="/agpa/ceremony">Cérémonies</a> des A.G.P.A.
        </p>
        <p>L'ensemble des photos sont consultable dans la section <a href="/agpa/archives">Archives</a> des A.G.P.A.
        </p>
    </div>
</template>


<script>
import axios from 'axios';
import { mapState } from 'vuex';
import { getModuleInfo, getPeopleAvatar, parseAxiosResponse } from '../../middleware/CommonHelper';
import { format } from 'date-fns';
import { fr } from "date-fns/locale";
import { agpaPhotoToGalleryPhoto } from '../../middleware/AgpaHelper';
import PhotoWidget from './components/PhotoWidget';
import store from '../../store';

export default {
    store,
    data: () => ({
        end: ""
    }),
    computed: { ...mapState([
        'agpaMeta'
    ])},
    watch: {
        $route(to, from) {
            this.refresh();
        },
        'agpaMeta': function () {
            this.refresh();
        }
    },
    mounted () {
        if (this.agpaMeta) {
            this.refresh();
        } else {
            store.dispatch('initAGPA');
        }
    },
    methods: {
        refresh() {
            axios.get(`/api/agpa/close-edition`);
            // Date de la cérémonie
            this.end = format(new Date(this.agpaMeta.boudaries[3].endDate), "dd MMM 'à' HH'h'mm", {locale: fr});
        },
    }
};
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';
@import '../../themes/agpa.scss';

#content {
    text-align: center;
}

h2, .h2 {
    text-align: left;
    margin: 10px;
    font-weight: normal;
    opacity: 0.5;
}
.h2 {
    display: inline-block;
}

.phase-left-header {
    margin: -5px 0 -10px 0;
    cursor: pointer;

    h2 {
        font-size: 20px;
        line-height: 20px;
        text-align: left;
    }
    p {
        text-align: left;
        font-size: 15px;
        line-height: 20px;
        opacity: 0.5;
        margin: 0;
    }
}
.phase-right-header {
    margin: -5px 0 -10px 0;
    opacity: 0.5;
    cursor: pointer;

    h2 {
        font-size: 20px;
        line-height: 20px;
        text-align: right;
    }
    p {
        text-align: right;
        font-size: 15px;
        line-height: 20px;
        margin: 0;
    }
}
.p4 {
    p {
        width: 500px;
        margin: auto;
        margin-top: 30px;
        text-align: justify;
    }
    a, .endDate {
        font-weight: bold;
        text-decoration: none;
        color: #26a69a;
    }
}
</style>
