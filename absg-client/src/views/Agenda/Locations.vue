<template>
<div>
    <v-container>
        <v-card>
            <v-card-title>
                <v-text-field
                    v-model="filter.search"
                    prepend-icon="fas fa-search"
                    label="Rechercher"
                    single-line
                    hide-details
                ></v-text-field>
                <v-spacer></v-spacer>
                <v-btn v-if="$vuetify.breakpoint.lgAndUp" @click="resetDialog(true)">
                    <v-icon left>fa-plus</v-icon>
                    Nouveau lieu
                </v-btn>
                <v-btn v-else fab small @click.stop="resetDialog(true)">
                    <v-icon>fas fa-plus</v-icon>
                </v-btn>
            </v-card-title>
            <v-data-table
                :headers="headers"
                :items="places"
                :search="filter.search"
                :loading="isLoading"
                loading-text="Récupération des données..."
                no-data-text="Aucun lieu enregistré dans l'annuaire."
                no-results-text="Aucun lieu trouvé."
                disable-sort
            >
                <template v-slot:item.name="{ item }">
                    <div v-if="item.thumb && $vuetify.breakpoint.lgAndUp" class="thumb">
                        <img :src="item.thumb" @click="photosGalleryDisplay(item.galleryIndex)"/>
                        </div>
                    <div v-if="!item.thumb && $vuetify.breakpoint.lgAndUp" class="noThumb">
                        <v-icon small>fas fa-home</v-icon>
                    </div>
                    <span style="font-weight: bold">{{ item.name }}</span>
                </template>

                <template v-slot:item.actions="{ item }">

                    <v-icon small class="mr-2" v-if="item.virtualVisitUrl" @click="openVirtualVisit(item)">
                        fas fa-eye
                    </v-icon>
                    <v-icon small class="mr-2" @click="openMap(item)">
                        fas fa-map-marker-alt
                    </v-icon>
                    <v-icon small class="mr-2" @click="editPlace(item)">
                        fa-pen
                    </v-icon>
                </template>
            </v-data-table>
        </v-card>
    </v-container>


    <v-dialog v-model="placeEditor.open" width="800px">
        <v-card>
            <v-card-title class="grey lighten-4">
                {{ placeEditor.id ? `Modifier les informations du lieux ${placeEditor.name}` : "Nouveau lieu" }}
            </v-card-title>

            <v-container grid-list-sm class="pa-4">
                <v-row>
                    <v-col>
                        <v-text-field
                            label="Nom d'usage"
                            prepend-icon="fas fa-home"
                            v-model="placeEditor.name">
                        </v-text-field>

                        <v-text-field
                            label="Adresse complète"
                            prepend-icon="fas fa-map-marked-alt"
                            v-model="placeEditor.address">
                        </v-text-field>

                        <v-text-field
                            label="Coordonnées GPS"
                            style="margin-left: 33px;"
                            v-model="placeEditor.gps">
                        </v-text-field>

                        <v-text-field
                            label="Téléphone fixe"
                            prepend-icon="fas fa-phone"
                            v-model="placeEditor.phone">
                        </v-text-field>
                    </v-col>

                    <v-col>
                        <ImageEditor ref="imgEditor" style="height: 300px; position: relative"/>


                    </v-col>
                </v-row>
            </v-container>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="resetDialog()">Annuler</v-btn>
            <v-btn color="accent" @click="savePlace()">Enregistrer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</div>
</template>


<script>
import axios from 'axios';
import store from '../../store';
import { parseAxiosResponse, getPeopleAvatar } from '../../middleware/CommonHelper';
import { differenceInMonths, format } from 'date-fns';
import ImageEditor from '../../components/ImageEditor.vue';

export default {
    store,
    components: {
        ImageEditor
    },
    data: () => ({
        isLoading: false,
        headers: [
            { text: `Lieux`, value: 'name' },
            { text: 'Adresse', value: 'address' },
            { text: 'Téléphone', value: 'phone' },
            { text: 'Coordonnées GPS', value: 'gps' },
            { text: '', value: 'actions', align: 'end' },
        ],
        filter: { search: "" }, // un filtre par recherche de mot clés multichamps
        places: [],
        placesGallery: [],
        placeEditor: {
            id: null,
            name: null,
            address: null,
            virtualVisitUrl: null,
            phone: null,
            gps: null,
            photo: null,

            open: false,
            isLoading: false,
            complete: 0,
        },
        editorRules: {
            photo: [
                value => !value || value.size < 2000000 || 'La taille de la photo doit être inférieur à 2 MB',
            ],
            birthDay: [
                value => {
                    const pattern = /^([0-9]{4})+(-[0-9]{2}(-[0-9]{2})?)?$/
                    return pattern.test(value) || 'La valeur doit être une date valide: YYYY ou bien YYYY-MM ou bien YYYY-MM-DD'
                }
            ],
            dayOfDeath: [
                value => {
                    const pattern = /^([0-9]{4})+(-[0-9]{2}(-[0-9]{2})?)?$/
                    return pattern.test(value) || 'La valeur doit être une date valide: YYYY ou bien YYYY-MM ou bien YYYY-MM-DD'
                }
            ],
        }
    }),
    mounted() {
        this.isLoading = true;
        axios.get(`/api/agenda/places`).then(response => {
            const data = parseAxiosResponse(response);
            let idx = 0;
            this.places = data.map(e => ({
                ...e,
                title: e.name,
                galleryIndex: e.thumb ? idx++ : null
            }));
            store.commit('photosGalleryReset', this.places.filter(e => e.thumb));
            this.isLoading = false;
        });
    },
    methods: {
        openVirtualVisit(place) {
            if (place && place.virtualVisitUrl) {
                const win = window.open(place.virtualVisitUrl, '_blank');
                win.focus();
            }
        },
        openMap(place) {
            if (place && (place.gps || place.address)) {
                const url = `https://www.google.com/maps/place/${place.gps || place.address}`;
                const win = window.open(url, '_blank');
                win.focus();
            }
        },
        photosGalleryDisplay(index) {
            store.commit('photosGallerySetIndex', index);
            store.commit('photosGalleryDisplay');
        },

        resetDialog(open = false) {
            this.placeEditor.open = open;
            this.placeEditor.id = null;
            this.placeEditor.name = null;
            this.placeEditor.address = null;
            this.placeEditor.virtualVisitUrl = null;
            this.placeEditor.phone = null;
            this.placeEditor.gps = null;
            this.placeEditor.photo = null;
            this.placeEditor.complete = 0;
        },

        editPlace (place) {
            this.placeEditor.open = true;
            this.placeEditor.id = place.id;
            this.placeEditor.name = place.name;
            this.placeEditor.address = place.address;
            this.placeEditor.virtualVisitUrl = place.virtualVisitUrl;
            this.placeEditor.phone = place.phone;
            this.placeEditor.gps = place.gps;
            this.placeEditor.photo = place.photo;
            this.placeEditor.complete = 0;
        },

        refreshList(place) {
            this.isLoading = true;
            let idx = this.places.findIndex(e => e.id === place.id);
            if (idx > -1) {
                const newEntry = {
                    ...place,
                    title: place.name,
                };
                this.places.splice(idx, 1, newEntry)
            } else {
                this.places.push({
                    ...place,
                    title: place.name,
                });
            }
            // On met à jour la gallerie photo et ses index
            idx = 0;
            this.places = this.places.map(e => ({
                ...e,
                galleryIndex: e.thumb ? idx++ : null
            }));
            store.commit('photosGalleryReset', this.places.filter(e => e.thumb));
            this.isLoading = false;
        },

        savePlace() {
            this.placeEditor.isLoading = true;
            const { imgEditor } = this.$refs;

            // On récupère l'image
            const imgUrl = imgEditor.imageUrl();
            let img = null;
            if (imgUrl) {
                axios.get(imgEditor.imageUrl(), { responseType: 'blob' }).then(
                    response => {
                        this.placeEditor.image = response.data;
                        this._savePlaceRequest();
                    }
                );
            } else {
                this.placeEditor.image = null;
                this._savePlaceRequest();
            }
        },
        _savePlaceRequest() {
            // On prépare l'envoie des infos au serveur
            const formData = new FormData();
            formData.append("id", this.placeEditor.id);
            formData.append("name", this.placeEditor.name);
            formData.append("address", this.placeEditor.address);
            formData.append("virtualVisitUrl", this.placeEditor.virtualVisitUrl);
            formData.append("phone", this.placeEditor.phone);
            formData.append("gps", this.placeEditor.gps);
            formData.append("photo", this.placeEditor.photo);

            if (this.placeEditor.image) {
                formData.append("image", this.placeEditor.image);
            }

            // On envoie tout au serveur pour qu'il enregistre
            const that = this;
            axios.post(`/api/agenda/place`, formData, {
                headers: {
                    "Content-Type" : "multipart/form-data",
                },
                onUploadProgress: progressEvent => {
                    this.placeEditor.complete = (progressEvent.loaded / progressEvent.total * 100 | 0);
                }
            })
            .then(response => {
                const savedPlace = parseAxiosResponse(response);
                // on reset l'IHM
                that.resetDialog();
                // On ajoute ou met à jour le lieu liste
                that.refreshList(savedPlace);
            })
            .catch(err => {
                store.commit("onError", err);
            });
        },


    }
}
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';

.thumb {
    width: 150px;
    margin-top: 5px;
    margin-right: 10px;
    display: inline-block;
    vertical-align: middle;
    text-align: center;

    img {
        max-height: 150px;
        max-width: 150px;
        border: 1px solid #000;
        background: #fff;
        padding: 1px;
        cursor: pointer;
    }
}
.noThumb {
    display: inline-block;
    width: 150px;
    text-align: center;
    line-height: 50px;
    margin-top: 5px;
    margin-bottom: 5px;
    margin-right: 10px;
    border: 1px solid #eee;
    color: #eee;
    background: #fafafa;
}

</style>
