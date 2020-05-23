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
                <v-btn @click="resetDialog(true)">
                    <v-icon small>fa-plus</v-icon>
                    Nouvelle citation
                </v-btn>
            </v-card-title>

            <v-data-table
                :headers="headers"
                :items="citations"
                :search="filter.search"
                :custom-filter="searchMethod"
                loading-text="Récupération des citations..."
                no-data-text="Aucune citation enregistrée."
                no-results-text="Aucune citation trouvée."
            >
                <template v-slot:item.citation="{ item }">
                    <div style="display: flex; vertical-align: middle">
                        <v-avatar size="36px" style="flex: 0 1 1">
                            <img alt="photo" :src="item.author.thumb"/>
                        </v-avatar>
                        <div class="citation" style="margin-left: 10px; font-size: 1.1em;" v-html="item.citation"></div>
                    </div>
                </template>
                <template v-slot:item.author="{ item }">
                    {{ item.author.fullname }}
                    <p v-if="item.year" class="year">{{ item.year }}</p>
                </template>

                <template v-slot:item.actions="{ item }">
                    <v-icon small class="mr-2" @click="editCitation(item)">
                        fa-pen
                    </v-icon>
                    <v-icon small class="mr-2" @click="deleteCitationConfirmation(item)">
                        fas fa-times
                    </v-icon>
                </template>
            </v-data-table>
        </v-card>
    </v-container>


    <v-dialog v-model="citationEditor.open" width="800px">
        <v-card>
            <v-card-title class="grey lighten-4">
            {{ citationEditor.id ? "Editer la citation" : "Nouvelle citation" }}
            </v-card-title>
            <v-container grid-list-sm class="pa-4">
            <v-layout row wrap>
                <v-flex xs12>
                    <v-autocomplete
                        prepend-icon="fas fa-user"
                        label="Autheur de la citation"
                        :items="persons"
                        v-model="citationEditor.author"
                        item-text="fullname"
                        item-value="id"
                    ></v-autocomplete>
                </v-flex>
                <v-flex xs12>
                    <v-text-field
                        prepend-icon="fas fa-quote-left"
                        label="La citation"
                        v-model="citationEditor.citation">
                    </v-text-field>
                </v-flex>
                <v-flex xs12>
                    <v-text-field
                        prepend-icon="fas fa-calendar-alt"
                        label="Année de référence (où la citation a été dite)"
                        v-model="citationEditor.year">
                    </v-text-field>
                </v-flex>
                <v-flex xs12>
                    <v-card>
                        <div style="position: relative;">

                            <v-icon style="position: absolute; top: 18px; left: 22px;">fas fa-info</v-icon>
                            <p style="margin-left: 50px; padding: 10px; font-style: italic">
                                Merci de les mettre la citation entre double quotes, et les précisions entre parenthèses: "La citation" (ma précision).
                            </p>
                        </div>
                    </v-card>

                </v-flex>
            </v-layout>
            </v-container>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="resetDialog()">Annuler</v-btn>
            <v-btn color="accent" @click="saveCitation()">Enregistrer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="citationDeletion.open" width="800px">
        <v-card>
            <v-card-title>
                Supprimer la citation
            </v-card-title>
            <p style="margin: 0 24px;">Êtes vous sûr de vouloir supprimer cette citation ?</p>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="citationDeletion.open = false">Annuler</v-btn>
            <v-btn color="accent" @click="deleteCitation()">Supprimer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

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
            open: false, // si oui ou non la boite de dialogue pour confirmer la suppression d'une citation est affichée
            citation: null, // la citation à supprimer
        }
    }),
    mounted () {
        this.isLoading = true;
        // On récupère la liste des personnes (pour l'aide à la saisie)
        axios.get(`/api/agenda/persons`).then(response => {
            this.persons = parseAxiosResponse(response);
        }).catch( err => {
            store.commit('onError', err);
        });

        // On récupère la liste des citations
        axios.get(`/api/citations/list`).then(response => {
            this.citations = parseAxiosResponse(response);
            this.isLoading = false;
        }).catch( err => {
            store.commit('onError', err);
        });
    },
    computed: {
        numberOfPages () {
            return Math.ceil(this.citations.length / this.filter.pageSize)
        }
    },
    methods: {
        resetDialog (open = false) {
            this.citationEditor.open = open;
            this.citationEditor.id = null;
            this.citationEditor.citation = null;
            this.citationEditor.author = null;
            this.citationEditor.year = new Date().getFullYear();
        },
        editCitation(citation) {
            this.citationEditor.open = open;
            this.citationEditor.id = citation.id;
            this.citationEditor.citation = citation.citation;
            this.citationEditor.author = citation.author.id;
            this.citationEditor.year = citation.year;
        },
        saveCitation: function () {
            // On vérifie si tout est bien renseigné
            this.citationEditor.isLoading = true;

            // On envoie au serveur
            axios.post(`/api/citations/`, this.citationEditor).then(
                citation => {
                    // on ferme la boite de dialogue
                    this.resetDialog();

                    // On met à jour l'IHM
                    const idx = this.citations.findIndex(e => e.id === citation.id);
                    if (idx > -1) {
                        // Maj citation existante
                        this.citations.splice(idx, 1, citation)
                    } else {
                        // ajout de la nouvelle citation
                        this.citations.push(citation);
                    }
                },
                err => {
                    store.commit('onError', err);
                }
            );
        },
        deleteCitationConfirmation: function(item) {
            this.citationDeletion.open = true;
            this.citationDeletion.citation = item;
        },
        deleteCitation: function () {
            axios.delete(`/api/citations/${this.citationDeletion.citation.id}`).then(
                removedCitation => {
                    // On met à jour l'IHM
                    this.citationDeletion.citation = null;
                    this.citationDeletion.open = false;

                    const idx = this.citations.findIndex(e => e.id === removedCitation.id);
                    if (idx > -1) {
                        // Maj citation existante
                        this.citations.splice(idx, 1)
                    }
                },
                err => {
                    store.commit('onError', err);
                }
            );
        },

        searchMethod(value, search, item) {
            if (!search) {
                return item;
            }
            return item != null && (
                item.citation.toLowerCase().indexOf(search.toLowerCase()) > -1
                || item.author.fullname.toLowerCase().indexOf(search.toLowerCase()) > -1
            );
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../../themes/global.scss';



.citation ::v-deep .note  {
    color: #999!important;
    flex: 1 0 1;
}

// .citationRow {
//     border-bottom: 1px solid #ddd;
// }
.citationRow:hover {
    background: rgba(15, 15, 30, 0.05);
    .deleteAction, .editAction {
        display: block;
    }
}
.deleteAction, .editAction {
    position: absolute;
    text-align: center;
    display: none;
}
.deleteAction {
    right: 15px;
}
.editAction {
    right: 50px;
}
.year {
    opacity: 0.5;
    margin: 0;
}
</style>
