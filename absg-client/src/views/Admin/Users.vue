<template>
<div style="background: white" v-cloak>
    <v-container fluid grid-list-xl>
        <v-layout row wrap>
            <v-flex>
                <v-container fluid  grid-list-md>
                    <v-data-iterator
                        :items="usersList"
                        :items-per-page="filter.pageSize"
                        :page="filter.pageIndex"
                        :search="filter.request"
                        hide-default-footer>

                        <template v-slot:header>
                            <div class="stickyHeader">
                                <v-select
                                    v-if="$vuetify.breakpoint.mdAndUp"
                                    v-model="filter.authorId"
                                    v-on:change="refreshList"
                                    :items="personsList"
                                    item-text="label"
                                    item-value="id"
                                    prepend-inner-icon="fa-user"
                                    label="usersList de"
                                    style="display: inline-block; width: 300px; margin-right: 50px">
                                </v-select>
                                <span class="grey--text">{{ totalUsers }} usersList</span>
                                <v-btn
                                    style="float: right; margin-top: 15px"
                                    color="accent"
                                    :disabled="isLoading"
                                    @click.stop="resetDialog(true)">
                                    <v-icon left>fas fa-plus</v-icon>
                                    <span v-if="$vuetify.breakpoint.mdAndUp">Nouvelle citation</span>
                                </v-btn>
                                <v-progress-linear
                                    v-if="isLoading"
                                    style="position: absolute; bottom: 0; left: 0; right: 0;"
                                    indeterminate
                                    color="accent"
                                ></v-progress-linear>
                            </div>
                        </template>


                        <template v-slot:default="props">
                            <v-card style="margin-top: 15px">
                                <v-list dense>
                                <template v-for="item in usersList">
                                    <v-list-item
                                        class="citationRow"
                                        :key="item.id">
                                        <v-list-item-avatar>
                                            <img :src="item.author.url"/>
                                        </v-list-item-avatar>
                                        <v-list-item-content>
                                            <v-btn text icon
                                                color="primary"
                                                class="editAction"
                                                @click.prevent="editCitation(item)">
                                                <v-icon>fas fa-pen</v-icon>
                                            </v-btn>
                                            <v-btn text icon
                                                color="red"
                                                class="deleteAction"
                                                @click.prevent="deleteCitationConfirmation(item)">
                                                <v-icon>fas fa-times</v-icon>
                                            </v-btn>
                                            <div>
                                                <b class="author">{{ item.author.label }}</b> <span v-if="item.year" class="year"> - {{ item.year }}</span>
                                            </div>
                                            <div class="citation" v-html="item.citation"></div>

                                        </v-list-item-content>
                                    </v-list-item>
                                </template>
                                </v-list>
                            </v-card>
                        </template>

                        <template v-slot:footer>
                            <v-row class="mt-2" style="margin: 0 5px" align="center" justify="center">
                                <span class="grey--text">usersList par page</span>
                                <v-menu offset-y>
                                    <template v-slot:activator="{ on }">
                                        <v-btn
                                            text
                                            color="primary"
                                            class="ml-2"
                                            :disabled="isLoading"
                                            v-on="on">
                                                {{ filter.pageSize }}
                                            <v-icon>fa-angle-down</v-icon>
                                        </v-btn>
                                    </template>
                                        <v-list>
                                        <v-list-item
                                            v-for="(number, index) in [10, 20, 50]"
                                            :key="index"
                                            @click="updateCitationsPerPage(number)">
                                            <v-list-item-title>{{ number }}</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>

                                <v-spacer></v-spacer>

                                <span class="mr-4 grey--text" >
                                    Page {{ filter.pageIndex +1}} / {{ totalPages }}
                                </span>
                                <v-btn
                                    fab small
                                    dark
                                    :disabled="isLoading"
                                    color="accent"
                                    class="mr-1"
                                    @click="formerPage">
                                    <v-icon>fa-chevron-left</v-icon>
                                </v-btn>
                                <v-btn
                                    fab small
                                    dark
                                    :disabled="isLoading"
                                    color="accent"
                                    class="ml-1"
                                    @click="nextPage"
                                >
                                    <v-icon>fa-chevron-right</v-icon>
                                </v-btn>
                            </v-row>
                        </template>
                    </v-data-iterator>
                </v-container>
            </v-flex>

            <v-flex>
                <div class="immt" v-if="immt">
                    <div>
                        <div>
                            <img :src="immt.src" @click="zoomOnImmt"/>
                        </div>
                    </div>
                    <p>{{ immt.title }}</p>
                </div>
            </v-flex>
        </v-layout>
    </v-container>








    <v-dialog v-model="userEditor.open" width="800px">
        <v-card>
            <v-card-title class="grey lighten-4">
            {{ userEditor.id ? "Editer le compte utilisateur" : "Nouvel utilisateur" }}
            </v-card-title>
            <v-container grid-list-sm class="pa-4">
            <v-layout row wrap>
                <v-flex xs12>
                    <v-text-field
                        prepend-icon="fas fa-quote-left"
                        label="Pseudo"
                        v-model="userEditor.username">
                    </v-text-field>
                </v-flex>
                <v-flex xs12>
                    <v-text-field
                        prepend-icon="fas fa-quote-left"
                        label="Email"
                        v-model="userEditor.email">
                    </v-text-field>
                </v-flex>
                <v-flex xs12>
                    <v-text-field
                        prepend-icon="fas fa-quote-left"
                        label="Mot de passe"
                        v-model="userEditor.password">
                    </v-text-field>
                </v-flex>
                <v-flex xs12>
                    <v-autocomplete
                        prepend-icon="fas fa-user"
                        label="Identité"
                        :items="personsList"
                        :filter="filterAuthor"
                        v-model="userEditor.person"
                    ></v-autocomplete>
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

    <v-dialog v-model="userDeletion.open" width="800px">
        <v-card>
            <v-card-title>
                Supprimer le compte de l'utilisateur
            </v-card-title>
            <p style="margin: 0 24px;">Êtes vous sûr de vouloir supprimer ce compte ?</p>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="userDeletion.open = false">Annuler</v-btn>
            <v-btn color="accent" @click="deleteUser()">Supprimer</v-btn>
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
        isLoading: false, // Est-ce qu'on est en train de charger la liste des utilisateurs ou non
        users: null, // map id => user info
        personsList: [], // lite complete des personnes enregistrées dans l'annuaire (utilisé pour l'autocomplete de l'auteur)
        roles: [
            { id: "member", label: "Membre", comment: "Membre du site avec accès à l'ensemble des fonctionnalités"},
            { id: "admin", label: "Admin", comment: "Membre du site avec accès à l'ensemble des fonctionnalités y compris les outils avancés d'administration"},
            { id: "archiv", label: "Archiviste", comment: "Les archivistes ont accès à des outils avancés pour gérer/modérer les albums photos"},
            ],
        totalUsers: 0, // nombre total de users (tiens compte de si on filtre ou non)
        totalPages: 10, // nombre de page total
        usersList: [], // liste des utilisateurs affichées sur la page courante
        filter: {
            username: null, // Nom de l'utilisateur sélectionné
            rootFamilly: null,
            pageIndex: 0, // page courante affiché (0 = page 1)
            pageSize: 20, // nombre de usersList affichées par page
        },
        userEditor: {
            open: false, // si oui ou non la boite de dialogue pour créer/éditer une citation est affichée
            id: null, // l'ID du user (vaut -1 si pour la création)
            username: null,
            password: null, // l'auteur de la citation (texte saisie libre mais autocomplete avec liste des auteurs existant)
            email: null,
            role: null,
            person: null // la fiche info associé à l'utilisateur
        },
        userDeletion: {
            open: false, // si oui ou non la boite de dialogue pour confirmer la suppression d'un user est affichée
            user: null, // l'utilisateur à supprimer
        }
    }),
    mounted () {
        this.isLoading = true;
        if (!this.users) {
            // Il faut initialiser la vue
            axios.get(`/api/usersList/init`).then(response => {
                const users = parseAxiosResponse(response);
                // On initialise les liste des auteurs de usersList
                this.personsList = [{id: -1, label: "Tout le monde"}];
                this.users = {};
                for (const a of users) {
                    const aData = getPeopleAvatar(a);
                    this.personsList.push(aData);
                    this.users[aData.id] = aData;
                    this.personsList.push({value: aData.id, text: aData.label });
                }
                // on récupère la liste des dernière usersList
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
            axios.get(`/api/usersList/list?authorId=${this.filter.authorId}&pageIndex=${this.filter.pageIndex}&pageSize=${this.filter.pageSize}`)
                .then(response => {
                    const data = parseAxiosResponse(response);
                    this.totalUsers = data.totalUsers;
                    this.totalPages = data.totalPages;
                    this.filter.pageIndex = data.pageIndex;
                    this.filter.pageSize = data.pageSize;

                    this.usersList = data.usersList.map(i => ({
                        id: i.id,
                        citation: i.citation,
                        author: this.users[i.authorId],
                        authorId: i.authorId,
                        year: i.year
                    }));

                    this.isLoading = false;

                }).catch( err => {
                    store.commit('onError', err);
                });
        },
        resetDialog (open = false) {
            this.userEditor.open = open;
            this.userEditor.id = null;
            this.userEditor.citation = null;
            this.userEditor.author = null;
            this.userEditor.year = new Date().getFullYear();
        },
        editCitation(citation) {
            this.userEditor.open = open;
            this.userEditor.id = citation.id;
            this.userEditor.citation = citation.citation;
            this.userEditor.author = citation.authorId;
            this.userEditor.year = citation.year;
            console.log(this.userEditor);
        },
        filterAuthor(item, queryText, itemText) {
            const textOne = item.text.toLowerCase()
            const textTwo = item.text.toLowerCase()
            const searchText = queryText.toLowerCase()

            return textOne.indexOf(searchText) > -1 || textTwo.indexOf(searchText) > -1
        },
        saveCitation: function () {
            // On vérifie si tout est bien renseigné
            this.userEditor.isLoading = true;

            // On envoie au serveur
            axios.post(`/api/usersList/`, this.userEditor).then(
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
            axios.delete(`/api/usersList/${this.citationDeletion.citation.id}`).then(
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
        formerPage() {
            this.filter.pageIndex = Math.max(0, this.filter.pageIndex - 1);
            this.refreshList();
        },
        nextPage() {
            this.filter.pageIndex = Math.min(this.totalPages, this.filter.pageIndex + 1);
            this.refreshList();
        },
        updateCitationsPerPage(count) {
            this.filter.pageSize = count;
            this.refreshList();
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../../themes/global.scss';



.citation ::v-deep .note  {
    color: #999!important;
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
