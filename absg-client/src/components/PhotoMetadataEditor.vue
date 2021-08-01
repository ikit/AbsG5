<template>
  <v-card dark>
    <v-form style="text-align: left; position: relative;">
      <v-icon style="position: absolute; top: 3px; opacity: 0.5">
        fas fa-info-circle
      </v-icon>
      <p style="font-familly: monospace; font-size: 10px; opacity: 0.5; margin: 0 0 0 40px">
        <span style="font-variant: all-small-caps; width: 45px;display: inline-block;">Dossier:</span> {{ photo.folder }}
      </p>
      
      <p style="font-familly: monospace; font-size: 10px; opacity: 0.5; margin: 0 0 0 40px">
        <span style="font-variant: all-small-caps; width: 45px;display: inline-block;">Photo:</span> {{ photo.id }}
      </p>

      <v-textarea
        v-model="photo.comment"
        label="Commentaire"
        prepend-icon="fas fa-pen"
        rows="1"
        auto-grow
      />

      <v-text-field
        v-model="photo.date"
        label="Date"
        :rules="photosEditorRules.date"
        placeholder="YYYY-MM-DD HH:mm"
        prepend-icon="far fa-calendar-alt"
        validate-on-blur
      />

      <v-combobox
        v-model="photo.persons"
        :items="persons"
        label="Personnes"
        prepend-icon="fas fa-user"
        multiple
        small-chips
        deletable-chips
        auto-select-first
      />

      <v-combobox
        v-model="photo.place"
        :items="places"
        label="Lieux"
        prepend-icon="fas fa-map-marker-alt"
        @change="onSelectPlace($event)"
      />

      <v-text-field
        v-model="photo.gps"
        placeholder="Position GPS"
        style="padding: 0; margin-left: 34px; margin-top: 0;"
      />


      <div style="text-align: center">
        <v-btn
          color="accent"
          style="margin-top: 30px"
          @click="savePhotoMetadata()"
        >
          <v-icon>fas fa-save</v-icon>
          &nbsp; Enregistrer et suivante &nbsp;
          <v-icon>fas fa-chevron-right</v-icon>
        </v-btn>
      </div>
    </v-form>
  </v-card>
</template>

<script>
import axios from 'axios';
import store from '../store';
import { format } from "date-fns";
import { parseAxiosResponse } from '../middleware/CommonHelper';
import { el } from 'date-fns/locale';
import { Photo } from '../model/Photo';

export default {
    name: 'PhotoMetadataEditor',
    props: {
        photo: {
            type: Photo,
            required: true
        }
    },
    data: () => ({
        persons: [],
        places: [],
        placesData: [],
        photosEditorRules : {
            date: [
                value => {
                    const pattern = /^([0-9]{4})?(-[0-9]{2}(-[0-9]{2}( [0-9]{2}(-[0-9]{2})?)?)?)?$/
                    return !value || pattern.test(value) || "La valeur doit être une date valide: YYYY-MM-DD HH-mm"
                }
            ]
        },
    }),
    mounted() {
        // On récupère la liste des personnes et des lieux de l'agenda pour l'aide à la saisie
        if (this.persons.length === 0) {
            axios.get(`/api/agenda/persons`).then(response => {
                this.persons = parseAxiosResponse(response).filter(e => e.lastname && e.firstname).map(e => (
                    `${e.firstname} ${e.lastname}`.trim()
                ));
            });
        }
        if (this.places.length === 0) {
            axios.get(`/api/agenda/places`).then(response => {
                this.placesData = parseAxiosResponse(response);
                this.places = this.placesData.filter(e => e.name).map(e => (
                    e.name.trim()
                ));
            });
        }
    },
    methods: {
        onSelectPlace(placeName) {

            const elt = this.placesData.find(e => e.name === placeName);
            if (elt) {
                this.photo.gps = elt.gps;
            }
        },

        savePhotoMetadata() {
            axios.post(`/api/photos/save`, this.photo).catch(
                err => store.commit('onError', err)
            );
            store.commit('photosGalleryNext');
        },
    }
}


</script>



<style lang="scss" scoped>
@import '../themes/global.scss';

</style>
