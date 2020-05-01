<template>
<div>

    <v-btn icon href="/agpa/ceremony/2019" target="_blank">
        2019
    </v-btn>

    <h1>12<sup>ème</sup> cérémony des A.G.P.A.</h1>
    <p style="text-align:center"> Ouverture dans </p>
    <Timer ref="timer" style="margin: auto"  v-on:completed="startCeremony()"></Timer>



    <div v-bind:class="{ ceremony: current.displayed }">
        <video ref="video" style="margin: auto;" width="100%" height="100%" controls>
            <source src="http://dev.absolumentg.fr/files/agpa/intro.mp4" type="video/mp4" >
            Your browser does not support the video tag.
        </video>
    </div>
</div>
</template>


<script>
import axios from 'axios';
import { agpaPhotoToGalleryPhoto } from '../../middleware/AgpaHelper';
import { padNumber } from '../../middleware/CommonHelper';
import Timer from '../../components/Timer';

export default {
    name: 'CeremonyMenu',
    components: {
        Timer,
    },
    data: () => ({
        isLoading: false,
        year: 2020,
        current: {
            year: 2020,
            ceremonyDate: null,
            displayed: false
        }

    }),
    mounted() {
        // TODO: récupérer la date de la cérémonie depuis le back et initialiser le compte à rebours
        this.current.ceremonyDate = new Date( new Date().getTime() + 10000000);
        console.log( this.current.ceremonyDate);
    },
    methods: {
        startCeremony() {
            console.log("TIMER DONE !");
            this.current.displayed = true;

            console.log(this.$refs.video);
            this.$refs.video.play();
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../../themes/global.scss';



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
