<template>
<div>
    <v-container>
        <v-card>
            <v-card-title>
                <v-text-field
                    v-model="quickFilter"
                    append-icon="fas fa-search"
                    label="Rechercher"
                    single-line
                    hide-details
                ></v-text-field>
                <v-spacer></v-spacer>
                <v-btn @click="resetDialog(true)">
                    <v-icon small>fa-plus</v-icon>
                    Nouvelle entrée
                </v-btn>
            </v-card-title>
            <v-data-table
                :headers="headers"
                :items="persons"
                :search="quickFilter"
                :loading="isLoading"
                loading-text="Récupération des données..."
            >
                <template v-slot:item.lastname="{ item }">
                    <v-icon small class="mr-2">
                        fas fa-user-circle
                    </v-icon>
                    <span style="font-weight: bold">{{ item.lastname }}</span>
                </template>

                <template v-slot:item.firstname="{ item }">
                    {{ item.firstname }}
                    <span style="opacity:0.5">{{ item.firstname2 }}</span>
                </template>

                <template v-slot:item.location="{ item }">
                    <span v-html="item.location"></span>
                </template>


                <template v-slot:item.actions="{ item }">
                    <v-icon small class="mr-2" @click="editPerson(item)">
                        fa-pen
                    </v-icon>
                    <v-icon small class="mr-2" @click="deletePerson(item)">
                        fa-trash
                    </v-icon>
                </template>

            </v-data-table>
        </v-card>
    </v-container>


    <v-dialog v-model="personEditor.open" width="800px">
        <v-card>
            <v-card-title class="grey lighten-4">
                {{ personEditor.id ? `Modifier les informations de ${personEditor.lastname} ${personEditor.firstname}` : "Nouvelle fiche" }}
            </v-card-title>

            <v-container grid-list-sm class="pa-4">
                <v-row>
                    <v-col>
                        <v-text-field
                            label="Nom"
                            prepend-icon="fas fa-user"
                            v-model="personEditor.lastname">
                        </v-text-field>

                        <v-text-field
                            label="Prénom (principale)"
                            style="margin-left: 33px;"
                            v-model="personEditor.firstname">
                        </v-text-field>

                        <v-text-field
                            label="Prénoms secondaires"
                            style="margin-left: 33px;"
                            v-model="personEditor.firstname2">
                        </v-text-field>

                        <v-text-field
                            label="Surnom (utilisé à la place du prénom dans la famille)"
                            style="margin-left: 33px;"
                            v-model="personEditor.surname">
                        </v-text-field>

                        <v-select
                            :items="sexes"
                            v-model="personEditor.sex"
                            prepend-icon="fas fa-venus-mars"
                            label="Sexe"
                            item-text="label"
                            item-value="id"
                        ></v-select>
                    </v-col>

                    <v-col>
                        <v-file-input
                            :rules="editorRules.photo"
                            accept="image/png, image/jpeg"
                            prepend-icon="fas fa-camera"
                            label="Photo (trombinoscope)"
                        ></v-file-input>

                        <v-menu
                            v-model="personEditor.dayOfBirthMenu"
                            :close-on-content-click="true"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on }">
                                <v-text-field
                                    :rules="editorRules.birthDay"
                                    v-model="personEditor.dayOfBirth"
                                    label="Date de naissance"
                                    prepend-icon="far fa-calendar-alt"
                                    clearable
                                    v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker v-model="personEditor.dayOfBirth" @input="dayOfBirthMenu = false"></v-date-picker>
                        </v-menu>

                        <v-menu
                            v-model="personEditor.dayOfDeathMenu"
                            :close-on-content-click="true"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on }">
                                <v-text-field
                                    :rules="editorRules.dayOfDeath"
                                    v-model="personEditor.dayOfDeath"
                                    clearable
                                    label="Date du décè"
                                    prepend-icon="far fa-calendar-alt"
                                    v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker v-model="personEditor.dayOfDeath" @input="dayOfDeathMenu = false"></v-date-picker>
                        </v-menu>

                        <v-text-field
                            label="Adresse"
                            prepend-icon="fas fa-map-marker-alt"
                            v-model="personEditor.location">
                        </v-text-field>
                        <v-text-field
                            label="Dernier métier exercé"
                            prepend-icon="fas fa-briefcase"
                            v-model="personEditor.job">
                        </v-text-field>

                    </v-col>
                </v-row>
            </v-container>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="resetDialog()">Annuler</v-btn>
            <v-btn color="accent" @click="savePerson()">Enregistrer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</div>
</template>



<script>
import axios from 'axios';
import { parseAxiosResponse, getPeopleAvatar } from '../../middleware/CommonHelper';
import { differenceInMonths, format } from 'date-fns';

export default  {
    data: () => ({
        isLoading: false,
        headers: [
            { text: 'Nom', value: 'lastname' },
            { text: 'Prénom', value: 'firstname' },
            { text: 'Naissance', value: 'age' },
            { text: 'Adresse', value: 'location' },
            { text: 'Téléphone', value: 'phone' },
            { text: 'Email', value: 'email' },
            { text: 'Emploi', value: 'job' },
            { text: '', value: 'actions' },
        ],
        quickfilter: null, // un filtre par recherche de mot clés multichamps
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
        persons: [],
        personEditor: {
            open: false,
            lastname: null,
            firstname: null,
            firstname2: null,
            surname: null,
            sex: null,
            dayOfBirth: null,
            dateOfDeath: null,
            homePlace: null,
            jobs: [],
            phone: null,
            email: null,

            dayOfBirthMenu: false,
            dayOfDeathMenu: false,
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
        axios.get(`/api/agenda/persons`).then(response => {
            const data = parseAxiosResponse(response);
            this.persons = data.map(e => ({
                ...e,
                job: e.jobs && e.jobs.length > 0 ? e.jobs[e.jobs.length - 1].label : "",
                location: this.computeLocation(e),
                age: this.computeAge(e),
            }));
            this.isLoading = false;
        });
    },
    methods: {
        computeLocation(person) {
            let loc = null;
            if (person.homePlace && person.homePlace.description) {
                const token = person.homePlace.description.split(",").map(e => e.trim());
                loc = token.join("<br/>");
            }

            return loc;
        },
        computeAge(person) {
            let age = null;
            if (person.dateOfBirth) {
                const birth = new Date(person.dateOfBirth);
                age = format(birth, "dd/MM/yyyy");
                const lastDay = person.dateOfDeath ? person.dateOfDeath : new Date();
                const y = lastDay.getFullYear() - birth.getFullYear();
                if (y > 1) {
                    age += ` (${y} ans)`;
                } else {
                    const m = differenceInMonths(lastDay, birth);
                    age += ` (${m} mois)`;
                }
            }
            return age;
        },

        resetDialog(open = false) {
            this.personEditor.open = open,
            this.personEditor.lastname = null,
            this.personEditor.firstname = null,
            this.personEditor.firstname2 = null,
            this.personEditor.surname = null,
            this.personEditor.sex = null,
            this.personEditor.dayOfBirth = null,
            this.personEditor.dateOfDeath = null,
            this.personEditor.homePlace = null,
            this.personEditor.jobs = [],
            this.personEditor.phone = null,
            this.personEditor.email = null
        },

        editPerson (person) {
            this.personEditor.open = true,
            this.personEditor.lastname = person.lastname,
            this.personEditor.firstname = person.firstname,
            this.personEditor.firstname2 = person.firstname2,
            this.personEditor.surname = person.surname,
            this.personEditor.sex = person.sex,
            this.personEditor.dayOfBirth = person.dayOfBirth,
            this.personEditor.dateOfDeath = person.lastDay,
            this.personEditor.homePlace = person.homePlace,
            this.personEditor.jobs = person.jobs,
            this.personEditor.phone = person.phone,
            this.personEditor.email = person.email
        },
        savePerson(person = null) {
            if (!person) {
                person = this.person;
            }

            // On vérifie si tout est bien renseigné
            this.personEditor.isLoading = true;
            const that = this;

            // On envoie au serveur
            axios.post(`/api/agenda/person`, person).then(
                savedPerson => {
                    // on reset l'IHM
                    that.resetDialog();
                    // On ajoute le nouvel utilisateur à la liste
                    console.log("SAVED Person", savedUser);
                    that.refreshList(savedUser);
                },
                err => {
                    store.commit('onError', err);
                }
            );

        },
        deletePerson (person) {
            console.log("deletePerson", person);
        },
        refreshPerson(person) {
            console.log("REFRESH LIST", person);
            const idx = this.persons.findIndex(e => e.id === person.id);
            if (idx > -1) {
                this.persons[idx] = person;
            } else {
                this.persons.push(person);
            }
        }
    }
};
</script>

<style lang="scss" scoped>
@import '../../themes/global.scss';

</style>
