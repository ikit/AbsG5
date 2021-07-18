<template>
    <div class="p4">
        <p>Le concours des A.G.P.A. est désormais terminé.
            Les résultats suite au dépouillement des votes vous seront présentés lors de la cérémonie plannifiée le <span class="endDate">01 janv. à 16h30</span>.
        </p>
        <p>Ceux qui ne pourront pas être présent, pourront suivre la cérémonie à distance en "direct", en se connectant sur le site
            et en allant dans la section <a href="/agpa/ceremony">Cérémonies</a> des A.G.P.A.
            Vous pourrez y suivre le déroulement de la cérémonie comme si vous y êtiez.
        </p>
        <p>Lors de la cérémonie, une visioconférence sera ouverte à l'adresse
            <a href="https://meet.jit.si/AbsolumentG" target="_blank">https://meet.jit.si/AbsolumentG</a> afin de permettre
            à ceux qui le souhaite de profiter de l'ambiance.
        </p>
        <p>Enfin, sachez que toutes les cérémonies des éditions passées sont disponnibles en ligne.
            Vous pourrez donc voir et revoir la cérémonie sur le site même si malheureusement vous ne pouviez pas être présent, ni sur place,
            ni à distance.
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
    mounted () {
        if (this.agpaMeta) {
            this.refresh();
        } else {
            store.dispatch('initAGPA');
        }
    },
    methods: {
        refresh() {
            // Fin de la phase 4
            const date = new Date(this.agpaMeta.boudaries[3].endDate, );
            this.end = format(date, "dd MMM 'à' HH'h'mm", {locale: fr});
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
