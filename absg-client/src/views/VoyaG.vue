<template>
    <div style="width: 100%; height: 100%; position: relative">


        <div id="map-wrap" style="height: 100vh">
            <l-map :zoom="zoom" :center="center">
                <l-tile-layer :url="url"></l-tile-layer>
                <l-marker :lat-lng="center"></l-marker>
            </l-map>
        </div>


        <div style="position: absolute; top: 0; left: 0; z-index: 2000; text-align: center">
            <v-btn color="accent" fab small dark>
                <v-icon>far fa-clock</v-icon>
            </v-btn>
            <v-btn color="primary" fab small dark>
                <v-icon>fas fa-map-pin</v-icon>
            </v-btn>
            <v-btn color="primary" fab small dark>
                <v-icon>fas fa-search</v-icon>
            </v-btn>
            <v-btn color="primary" fab small dark>
                <v-icon>fas fa-layer-group</v-icon>
            </v-btn>
            <v-btn color="primary" fab small dark>
                <v-icon>fas fa-crosshairs</v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import { LMap, LTileLayer, LMarker, LPopup, LTooltip } from 'vue2-leaflet';
import { Icon, latLng } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// this part resolve an issue where the markers would not appear
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

export default {
    name: "Example",
    components: {
        LMap,
        LTileLayer,
        LMarker,
        LPopup,
        LTooltip
    },
    data() {
        return {
            zoom: 13,
            center: latLng(47.41322, -1.219482),
            url: "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
            currentCenter: latLng(47.41322, -1.219482),
            showParagraph: false,
            mapOptions: {
                zoomSnap: 0.5
            },
        };
    },
    methods: {
        zoomUpdate(zoom) {
            this.zoom = zoom;
        },
        centerUpdate(center) {
            this.zoom = center;
        },
        showLongText() {
            this.showParagraph = !this.showParagraph;
        },
        innerClick() {
            alert("Click!");
        }
    }
};

</script>

<style lang="scss" scoped>
</style>
