<template>
<v-container>
    <v-card style="margin: 20px auto; margin-top: 100px; width: 600px; display: relative; padding: 40px 10px 40px 10px;">
        <img src="/img/agpa/cupesMaxi/c1.png" width="200px" style="position: absolute; top: -100px; left: 200px"/>
        <h2 style="text-align: center; font-size: 3em; font-weight: bold; font-family: 'Tangerine', serif; color: #c0b44f; line-height: 1em;">
            <span style="font-size: 2em; font-weight: normal; padding-right: 3px;">{{ current.year - 2005 }} </span><sup>ème</sup> cérémonie des A.G.P.A.
        </h2>
        <p style="text-align: center; font-size: 2em; font-weight: bold; font-family: 'Tangerine', serif; opacity: 0.3"> ouverture dans </p>
        <Timer ref="timer" style="margin: auto"  v-on:completed="startCeremony()"></Timer>
    </v-card>


    <p style="text-align: center; font-size: 1em; font-weight: bold; font-family: serif; opacity: 0.5">
        Vous avez encore le temps... en attendant vous pouvez revoir les anciennes cérémonies:
    </p>

    <v-container fluid>
        <v-layout row wrap>
            <v-flex v-for="edition in formerEditions" :key="edition.year" style="min-width: 250px; width: 250px; margin: 15px">
                <a :href="`/agpa/ceremony/${edition.year}`" target="_blank" style="text-decoration: none">
                    <v-card style="width: 250px; height: 150px; margin: auto;">
                        <v-img
                            :src="`/files/agpa/${edition.year}/mini/${edition.photos[0].filename}`"
                            aspect-ratio="2.75">
                        </v-img>
                        <p style=" margin: 0; text-align: center; font-size: 3em; font-weight: bold; font-family: 'Tangerine', serif; opacity: 0.5; line-height: 1em;">{{ edition.year }}</p>
                    </v-card>
                </a>
            </v-flex>
        </v-layout>
    </v-container>

    <div v-bind:class="{ ceremony: current.displayed, hiddenCeremony: !current.displayed }" >
        <video ref="video" style="margin: auto;" width="100%" height="100%" controls>
            <source src="/files/agpa/intro.mp4" type="video/mp4" >
            Your browser does not support the video tag.
        </video>
    </div>
</v-container>
</template>


<script>
import axios from 'axios';
import store from '../../store';
import { mapState } from 'vuex';
import { parseAxiosResponse } from '../../middleware/CommonHelper';
import { agpaPhotoToGalleryPhoto } from '../../middleware/AgpaHelper';
import { padNumber } from '../../middleware/CommonHelper';
import { addDays, addSeconds, format } from 'date-fns';
import Timer from '../../components/Timer';

export default {
    name: 'CeremonyMenu',
    store,
    components: {
        Timer,
    },
    data: () => ({
        isLoading: false,

        formerEditions: [],
        current: {
            year: null,
            ceremonyDate: null,
            displayed: false
        }

    }),
    computed: {
        ...mapState([ 'settings' ])
    },
    mounted() {
        this.isLoading = true;

        // On récupère la date de la cérémonie depuis les settings du site
        setTimeout(() => this.resetTimer());

        axios.get(`/api/agpa/archives`).then(response => {
            this.formerEditions = parseAxiosResponse(response);
            this.isLoading = false;
        });


    },
    methods: {
        resetTimer() {
            const p1 = new Date(new Date().getFullYear(), 9, 1) // le 1er octobre à minuit
            const p2 = addDays(p1, this.settings.agpaPhase1Duration);
            const p3 = addDays(p2, this.settings.agpaPhase2Duration);
            const p4 = addDays(p3, this.settings.agpaPhase3Duration);
            let p5 = addDays(p4, this.settings.agpaPhase4Duration);
            p5 = addSeconds(p5, this.settings.agpaCeremonyStartTime);

            this.current.ceremonyDate = p5; // new Date( new Date().getTime() + 1000000);
            this.current.year = new Date().getFullYear();
            this.$refs.timer.init(this.current.ceremonyDate);
        },

        startCeremony() {
            this.current.displayed = true;
            this.$refs.video.play();
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../../themes/global.scss';
@import '../../themes/agpa.scss';


.hiddenCeremony {
    visibility: hidden;
}
.ceremony {
    opacity:0;
    position: fixed;
    overflow: hidden;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: #000;
    z-index: 10000;
    -moz-animation: anim 3s linear forwards;
    -webkit-animation: anim 3s linear forwards;
    -o-animation: anim 3s linear forwards;
    -ms-animation: anim 3s linear forwards;
    animation: anim 3s linear forwards;
}
@-moz-keyframes anim {
   0%  {opacity:0;}
   100% {opacity:1;}
}
@-webkit-keyframes anim {
   0%  {opacity:0;}
   100% {opacity:1;}
}
@-o-keyframes anim {
   0%  {opacity:0;}
   100% {opacity:1;}
}
@-ms-keyframes anim {
   0%  {opacity:0;}
   100% {opacity:1;}
}
@keyframes anim {
   0%  {opacity:0;}
   100% {opacity:1;}
}


</style>
