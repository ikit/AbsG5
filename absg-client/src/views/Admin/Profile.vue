<template>
<div>
    <v-container>
        <v-card>
            <v-card-title>
                Mes informations personnelles
            </v-card-title>

            <v-row>
                <v-col>avatar</v-col>
                <v-col>
                    Login<br/>
                    Authorisations (mes roles)<br/>
                    famille principale<br/>
                </v-col>
            </v-row>
            <v-tabs>
                <v-tab> <v-icon left>fas fa-address-book</v-icon> Répertoire</v-tab>
                <v-tab> <v-icon left>fas fa-map-marked-alt</v-icon> Habitation</v-tab>
            </v-tabs>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn>Sauvegarder</v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</div>
</template>



<script>
import axios from 'axios';
import store from '../../store';
import { parseAxiosResponse, getPeopleAvatar, cleanString } from '../../middleware/CommonHelper';

export default {
    store,
    data: () => ({
        isLoading: false, // Est-ce qu'on est en train de charger la liste des citations ou non
        headers: [
            { text: `Citation`, value: 'citation' },
            { text: `Auteur`, value: 'author' },
            { text: '', value: 'actions', align: 'end' },
        ],
        citations: [],
        persons: [],
        filter: { search: "" },
        citationEditor: {
            open: false, // si oui ou non la boite de dialogue pour créer/éditer une citation est affichée
            id: null, // l'ID de la citation (vaut -1 si pour la création)
            citation: null, // le texte de la citation
            author: null, // l'auteur de la citation (texte saisie libre mais autocomplete avec liste des auteurs existant)
            year: new Date().getFullYear(), // l'année de référence (où la citation à été prononcée)
        },
        citationDeletion: {
            open: false, // si oui ou non la boite de dialogue pour confirmer la suppression d'un citation est affichée
            citation: null, // la citation à supprimer
        }
    }),
    mounted () {
        // this.isLoading = true;
        // // On récupère la liste des personnes (pour l'aide à la saisie)
        // axios.get(`/api/agenda/persons`).then(response => {
        //     this.persons = parseAxiosResponse(response);
        // }).catch( err => {
        //     store.commit('onError', err);
        // });

        // // On récupère la liste des citations
        // axios.get(`/api/citations/list`).then(response => {
        //     this.citations = parseAxiosResponse(response);
        //     this.isLoading = false;
        // }).catch( err => {
        //     store.commit('onError', err);
        // });
    },
    methods: {
        saveCitation: function () {
            // // On vérifie si tout est bien renseigné
            // this.citationEditor.isLoading = true;

            // // On envoie au serveur
            // axios.post(`/api/citations/`, this.citationEditor).then(
            //     citation => {
            //         // on ferme la boite de dialogue
            //         this.resetDialog();

            //         // On met à jour l'IHM
            //         const idx = this.citations.findIndex(e => e.id === citation.id);
            //         if (idx > -1) {
            //             // Maj citation existante
            //             this.citations.splice(idx, 1, citation)
            //         } else {
            //             // ajout de la nouvelle citation
            //             this.citations.push(citation);
            //         }
            //     },
            //     err => {
            //         store.commit('onError', err);
            //     }
            // );
        },
    }
};
</script>

<style lang="scss" scoped>
@import '../../themes/global.scss';


</style>
