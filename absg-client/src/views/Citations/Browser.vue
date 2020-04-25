<template>
<div>

    <v-container>
        <v-card>
            <v-card-title>
                <v-text-field
                    v-model="filter.search"
                    append-icon="fas fa-search"
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
                            <img
                                alt="Avatar"
                                :src="item.author.url"
                            >
                        </v-avatar>

                        <div class="citation" v-html="item.citation"></div>
                    </div>
                </template>
                <template v-slot:item.author="{ item }">
                    {{ item.author.label }} <span v-if="item.year" class="year"> - {{ item.year }}</span>
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


        <div v-if="!isLoading && (!citations || citations.length == 0)"
            style="text-align:center;">
            <p style="margin: 70px auto">Aucune citation n'a encore été enregistrée... soyez le premier !</p>
            <v-btn
                color="accent"
                @click.stop="resetDialog(true)">
                <v-icon left>fas fa-plus</v-icon>
                <span v-if="$vuetify.breakpoint.mdAndUp">Nouvelle citation</span>
            </v-btn>
        </div>


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
                            :items="peopleList"
                            :filter="filterAuthor"
                            v-model="citationEditor.author"
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
        authors: null, // map id => auteur info
        authorsList: [], // liste complete des auteurs (utilisé par les <select>)
        peopleList: [], // lite complete des personnes enregistrées dans l'annuaire (utilisé pour l'autocomplete de l'auteur)
        citations: [], // liste des citations affichées sur la page courante
        filter: {
            authorId: null, // ID de l'auteur sélectionné
            search: null,
            pageIndex: 0, // page courante affiché (0 = page 1)
            pageSize: 20, // nombre de citations affichées par page
        },
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
        this.isLoading = true;
        if (!this.authors) {
            // Il faut initialiser la vue
            axios.get(`/api/citations/init`).then(response => {
                const authors = parseAxiosResponse(response);
                // On initialise les liste des auteurs de citations
                this.authorsList = [{id: -1, label: "Tout le monde"}];
                this.authors = {};
                for (const a of authors) {
                    const aData = getPeopleAvatar(a);
                    this.authorsList.push(aData);
                    this.authors[aData.id] = aData;
                    this.peopleList.push({value: aData.id, text: aData.label });
                }
                // on récupère la liste des dernière citations
                this.refreshList();
            }).catch( err => {
                store.commit('onError', err);
            });
        }
    },
    methods: {
        refreshList(reset = false) {
            // On affiche l'indicateur de chargement
            this.isLoading = true;
            // Est-ce qu'on force le reset
            if (reset) {
                this.filter.pageIndex = 0;
                this.filter.authorId = null;
            }

            // On appelle l'API avec les paramètres de filtrage
            axios.get(`/api/citations/list?authorId=${this.filter.authorId}&pageIndex=${this.filter.pageIndex}&pageSize=${this.filter.pageSize}`)
                .then(response => {
                    const data = parseAxiosResponse(response);

                    this.citations = data.citations.map(i => ({
                        id: i.id,
                        citation: i.citation,
                        author: this.authors[i.authorId],
                        authorId: i.authorId,
                        year: i.year
                    }));

                    this.isLoading = false;

                }).catch( err => {
                    store.commit('onError', err);
                });
        },
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
            this.citationEditor.author = citation.authorId;
            this.citationEditor.year = citation.year;
            console.log(this.citationEditor);
        },
        filterAuthor(item, queryText, itemText) {
            const textOne = item.text.toLowerCase()
            const textTwo = item.text.toLowerCase()
            const searchText = queryText.toLowerCase()

            return textOne.indexOf(searchText) > -1 || textTwo.indexOf(searchText) > -1
        },
        saveCitation: function () {
            // On vérifie si tout est bien renseigné
            this.citationEditor.isLoading = true;

            // On envoie au serveur
            axios.post(`/api/citations/`, this.citationEditor).then(
                response => {
                    // on reset l'IHM
                    this.resetDialog();
                    this.refreshList(true);
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
                response => {
                    this.citationDeletion.citation = null;
                    this.citationDeletion.open = false;
                    this.refreshList(true);
                },
                err => {
                    store.commit('onError', err);
                }
            );
        },

        searchMethod(value, search, item) {
            console.log("search", item);
            if (!search) {
                return item;
            }
            return item != null && (
                item.citation.toLowerCase().indexOf(search.toLowerCase()) > -1
                || item.author.label.toLowerCase().indexOf(search.toLowerCase()) > -1
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
}
</style>
