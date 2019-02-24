<template>
    <div style="width: 100%; height: 100%; position: relative">

        <l-map
            :zoom="zoom"
            :center="center"
            :options="mapOptions"
            @update:center="centerUpdate"
            @update:zoom="zoomUpdate">
            <l-tile-layer
                :url="url"
                :attribution="attribution"/>
            <l-marker :lat-lng="withPopup">
                <l-popup>
                <div @click="innerClick">
                    I am a popup
                    <p v-show="showParagraph">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi. Donec finibus semper metus id malesuada.
                    </p>
                </div>
                </l-popup>
            </l-marker>
            <l-marker :lat-lng="withTooltip">
                <l-tooltip :options="{permanent: true, interactive: true}">
                <div @click="innerClick">
                    I am a tooltip
                    <p v-show="showParagraph">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sed pretium nisl, ut sagittis sapien. Sed vel sollicitudin nisi. Donec finibus semper metus id malesuada.
                    </p>
                </div>
                </l-tooltip>
            </l-marker>
        </l-map>
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

import { L, LMap, LTileLayer, LMarker, LPopup, LTooltip } from 'vue2-leaflet';

export default {
    name: 'Example',
    components: {
        LMap,
        LTileLayer,
        LMarker,
        LPopup,
        LTooltip
    },
    data () {
        return {
            zoom: 13,
            center: L.latLng(47.413220, -1.219482),
            url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            withPopup: L.latLng(47.413220, -1.219482),
            withTooltip: L.latLng(47.414220, -1.250482),
            currentZoom: 11.5,
            currentCenter: L.latLng(47.413220, -1.219482),
            showParagraph: false,
            mapOptions: {
                zoomSnap: 0.5,
                zoomControl: false,

            }
        };
    },
    methods: {
        zoomUpdate (zoom) {
            this.currentZoom = zoom;
        },
        centerUpdate (center) {
            this.currentCenter = center;
        },
        showLongText () {
            this.showParagraph = !this.showParagraph;
        },
        innerClick () {
            alert('Click!');
        }
    }
};

</script>

<style scoped>

</style>
