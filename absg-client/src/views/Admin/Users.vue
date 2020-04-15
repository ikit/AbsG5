<template>
<div>
    <v-container>
        <v-card>
            <v-card-title>
            <v-text-field
                v-model="filter.quickFilter"
                append-icon="fas fa-search"
                label="Rechercher"
                single-line
                hide-details
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn @click="resetDialog(true)">
                <v-icon small>fa-plus</v-icon>
                Nouvel utilisateur
            </v-btn>
            </v-card-title>
            <v-data-table
                :headers="headers"
                :items="usersList"
                :search="filter.quickFilter"
                :loading="isLoading"
                loading-text="Récupération des utilisateurs..."
            >

                <template v-slot:item.roles="{ item }">
                    <v-chip
                        v-for="r in item.roles"
                        :key="r"
                        :color="getRoleColor(r)"
                        dark>
                        {{ getRoleLabel(r) }}
                    </v-chip>
                </template>

                <template v-slot:item.active="{ item }">
                    <v-icon
                        v-if="item.isActive"
                        small
                        class="mr-2"
                        color="green"
                        @click="switchUserActivity(item)">
                        fas fa-check-circle
                    </v-icon>
                    <v-icon
                        v-if="!item.isActive"
                        small
                        class="mr-2"
                        color="red"
                        @click="switchUserActivity(item)">
                        fas fa-times-circle
                    </v-icon>
                </template>


                <template v-slot:item.actions="{ item }">
                    <v-icon small class="mr-2" @click="editUser(item)">
                        fa-pen
                    </v-icon>
                </template>

            </v-data-table>
        </v-card>
    </v-container>


    <v-dialog v-model="userEditor.open" width="800px">
        <v-card>
            <v-card-title class="grey lighten-4">
            {{ userEditor.id != -1 ? `Editer le compte utilisateur n°${userEditor.id}` : "Nouvel utilisateur" }}
            </v-card-title>

            <v-container grid-list-sm class="pa-4">
                <v-row>
                    <v-col>
                        <h2>Compte utilisateur</h2>
                        <p style="opacity: 0.5">Informations obligatoires.</p>
                        <v-text-field
                            prepend-icon="fas fa-user"
                            label="Pseudo"
                            v-model="userEditor.username">
                        </v-text-field>

                        <v-text-field
                            prepend-icon="fas fa-at"
                            label="Email"
                            v-model="userEditor.person.email">
                        </v-text-field>

                        <v-text-field
                            prepend-icon="fas fa-unlock"
                            label="Mot de passe"
                            v-model="userEditor.password">
                        </v-text-field>
                        <v-select
                            prepend-icon="fas fa-user-tag"
                            prepend-inner=""
                            v-model="userEditor.roles"
                            :items="roles"
                            attach
                            chips
                            label="Rôles"
                            multiple
                            item-text="label"
                            item-value="id"
                        ></v-select>
                    </v-col>

                    <v-col>
                        <h2>Informations personnelles</h2>
                        <p style="opacity: 0.5">Informations optionnels mais recommandées.</p>
                        <v-text-field
                            label="Nom"
                            v-model="userEditor.person.lastname">
                        </v-text-field>

                        <v-text-field
                            label="Prénom"
                            v-model="userEditor.person.firstname">
                        </v-text-field>

                        <v-select
                            :items="sexes"
                            v-model="userEditor.person.sex"
                            label="Sexe"
                            item-text="label"
                            item-value="id"
                        ></v-select>

                        <v-select
                            :items="rootFamillies"
                            v-model="userEditor.rootFamily"
                            label="Maison mère"
                            item-text="label"
                            item-value="id"
                        ></v-select>
                    </v-col>
                </v-row>
            </v-container>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="resetDialog()">Annuler</v-btn>
            <v-btn color="accent" @click="saveUser()">Enregistrer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="userActivity.open" width="800px">
        <v-card v-if="userActivity.user && userActivity.user.isActive">
            <v-card-title>
                Désactiver le compte {{ userActivity.user.username }}
            </v-card-title>
            <p style="margin: 0 24px;">
                Êtes vous sûr de vouloir désactiver ce compte ?
                Il ne sera plus possible d'utiliser ce compte pour accéder au site, mais l'historique et les informations le concernant sont conservés.</p>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="userActivity.open = false">Annuler</v-btn>
            <v-btn color="accent" @click="setUserIsActive(false)">Désactiver</v-btn>
            </v-card-actions>
        </v-card>
        <v-card v-if="userActivity.user && !userActivity.user.isActive">
            <v-card-title>
                Réactiver le compte {{ userActivity.user.username }}
            </v-card-title>
            <p style="margin: 0 24px;">
                Êtes vous sûr de vouloir réactiver ce compte ?
                Il ne sera à nouveau possible de l'utiliser pour accéder au site.</p>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="userActivity.open = false">Annuler</v-btn>
            <v-btn color="accent" @click="setUserIsActive(true)">Réactiver</v-btn>
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
        headers : [
          { text: 'Utilisateur', value: 'username' },
          { text: 'Nom', value: 'person.lastname' },
          { text: 'Prénom', value: 'person.firstname' },
          { text: 'Email', value: 'person.email' },
          { text: 'Dernière fois', value: 'lastActivity' },
          { text: 'Rôles', value: 'roles' },
          { text: 'Actif', value: 'active' },
          { text: '', value: 'actions' },
        ],
        filter: {
            quickfilter: null, // un filtre par recherche de mot clés multichamps: cf construction du champs quickfilter dans mounted()
            pageIndex: 0, // page courante affiché (0 = page 1)
            pageSize: 20, // nombre de usersList affichées par page
        },
        roles: [
            { id: "member", label: "Membre", comment: "Membre du site avec accès à l'ensemble des fonctionnalités de base", color:"grey"},
            { id: "admin", label: "Admin", comment: "Donne l'accès aux outils avancés d'administration", color:"red"},
            { id: "archivist", label: "Archiviste", comment: "Donne l'accès aux outils avancés pour gérer/modérer les albums photos", color:"blue"},
        ],
        sexes: [
            { id: "undefined", label: "Non défini" },
            { id: "male", label: "Homme" },
            { id: "female", label: "Femme" }
        ],
        rootFamillies: [
            { id: null, label: "Aucune" },
            { id: "gueudelot", label: "Gueudelot" },
            { id: "guibert", label: "Guibert" },
            { id: "guyomard", label: "Guyomard" },
        ],
        usersList: [], // liste des utilisateurs affichées sur la page courante

        // Les models des boites de dialogue
        userEditor: {
            open: false, // si oui ou non la boite de dialogue pour créer/éditer une citation est affichée
            id: null, // l'ID du user (vaut -1 pour la création)
            username: null, // son pseudo
            password: null, // pour initialiser ou réinitialiser son mot de passe
            roles: [], // les rôles de l'utilisateur (sans rôle c'est comme si le compte était inactif, il ne pourra accéder à rien)
            rootFamily: null, // la famille principale à laquelle ratacher l'utilisateur
            person: { // la fiche info associé à l'utilisateur
                lastname: null,
                firstname: null,
                sex: null,
                email: null,
            }
        },
        userActivity: {
            open: false, // si oui ou non la boite de dialogue pour confirmer la suppression d'un user est affichée
            user: null, // l'utilisateur à supprimer
        }
    }),
    mounted () {
        this.isLoading = true;
        this.resetDialog();
        axios.get(`/api/users/list`).then(response => {
            const result = parseAxiosResponse(response);
            // On initialise la liste des utilisateurs
            this.users = {};
            for (const u of result.users) {
                const uData = { ...u, ...getPeopleAvatar(u)};
                this.usersList.push(uData);
            }
            this.isLoading = false;
        }).catch( err => {
            store.commit("onError", err);
        });
    },
    methods: {
        resetDialog (open = false) {
            this.userEditor.open = open;
            this.userEditor.id = -1;
            this.userEditor.username = "";
            this.userEditor.password = "";
            this.userEditor.roles = ["member"];
            this.userEditor.rootFamily = null;
            this.userEditor.person = {
                lastname: "",
                firstname: "",
                sex: "undefined",
                email: "",
            }
        },
        editUser(user) {
            this.userEditor.open = true;
            this.userEditor.id = user.id;
            this.userEditor.username = user.username;
            this.userEditor.password = "";
            this.userEditor.roles = user.roles;
            this.userEditor.rootFamily = user.rootFamily;
            this.userEditor.person = user.person;
        },
        saveUser(user = null) {
            if (!user) {
                user = this.userEditor;
            }

            // On vérifie si tout est bien renseigné
            this.userEditor.isLoading = true;
            const that = this;

            // On envoie au serveur
            axios.post(`/api/users`, user).then(
                savedUser => {
                    // on reset l'IHM
                    that.resetDialog();
                    // On ajoute le nouvel utilisateur à la liste
                    console.log("SAVED USER", savedUser);
                    that.refreshUser(savedUser);
                },
                err => {
                    store.commit('onError', err);
                }
            );
        },
        switchUserActivity(user) {
            this.userActivity.open = true;
            this.userActivity.user = user;
        },
        setUserIsActive(isActive) {
            this.userActivity.user.isActive = isActive
            this.saveUser(this.userActivity.user);
            this.userActivity.open = false;
        },
        getRoleColor(role) {
            const r = this.roles.find(e => e.id === role);
            return r ? r.color : "none";
        },
        getRoleLabel(role) {
            const r = this.roles.find(e => e.id === role);
            return r ? r.label : "";
        },
        refreshUser(user) {
            console.log("REFRESH LIST", user);
            const idx = this.usersList.findIndex(e => e.id === user.id);
            if (idx > -1) {
                this.usersList[idx] = user;
            } else {
                this.usersList.push(user);
            }
        }
    }
};
</script>


