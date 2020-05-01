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
                    Nouvelle entrée
                </v-btn>
            </v-card-title>
            <v-data-table
                :headers="headers"
                :items="persons"
                :search="filter.search"
                :loading="isLoading"
                loading-text="Récupération des données..."
                no-data-text="Aucune personne enregistré dans l'annuaire."
                no-results-text="Aucune personne trouvé."
            >
                <template v-slot:item.photo="{ item }">
                    <div v-if="item.thumb" class="thumb">
                        <img :src="item.thumb" @click="photosGalleryDisplay(item.galleryIndex)"/>
                        </div>
                    <div v-if="!item.thumb" class="noThumb">
                        <v-icon small>fas fa-user-circle</v-icon>
                    </div>
                </template>

                <template v-slot:item.name="{ item }">
                    <div v-if="item.surname" style="font-style: italic;">{{ item.surname }}</div>
                    <div v-if="item.lastname" style="font-weight: bold">{{ item.lastname }}</div>
                    <div v-if="item.lastname" >
                        {{ item.firstname }}
                        <span style="opacity:0.5">{{ item.firstname2 }}</span>
                    </div>
                </template>

                <template v-slot:item.age="{ item }">
                    <div v-if="item.age.age" style="font-weight: bold">{{ item.age.age }}</div>
                    <div v-if="item.age.birth" >{{ item.age.birth }}</div>
                    <div v-if="item.age.death" >{{ item.age.death }}</div>
                </template>

                <template v-slot:item.contact="{ item }">
                    <div v-if="item.phone">{{ item.phone }}</div>
                    <div v-if="item.email" >{{ item.email }}</div>
                </template>


                <template v-slot:item.actions="{ item }">
                    <v-icon v-if="item.address" small class="mr-2" @click="openMap(item)">
                        fas fa-map-marker-alt
                    </v-icon>
                    <v-icon small class="mr-2" @click="editPerson(item)">
                        fa-pen
                    </v-icon>
                </template>

            </v-data-table>
        </v-card>
    </v-container>


    <v-dialog v-model="personEditor.open" width="900px">
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
                        <v-menu
                            v-model="personEditor.dateOfBirthMenu"
                            :close-on-content-click="true"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on }">
                                <v-text-field
                                    :rules="editorRules.dateOfBirth"
                                    v-model="personEditor.dateOfBirth"
                                    label="Date de naissance"
                                    prepend-icon="far fa-calendar-alt"
                                    clearable
                                    v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker v-model="personEditor.dateOfBirth" @input="dateOfBirthMenu = false"></v-date-picker>
                        </v-menu>

                        <v-menu
                            v-model="personEditor.dateOfDeathMenu"
                            :close-on-content-click="true"
                            :nudge-right="40"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on }">
                                <v-text-field
                                    :rules="editorRules.dateOfDeath"
                                    v-model="personEditor.dateOfDeath"
                                    clearable
                                    label="Date du décè"
                                    prepend-icon="far fa-calendar-alt"
                                    v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker v-model="personEditor.dateOfDeath" @input="dateOfDeathMenu = false"></v-date-picker>
                        </v-menu>

                        <v-text-field
                            label="Adresse"
                            prepend-icon="fas fa-map-marker-alt"
                            v-model="personEditor.address">
                        </v-text-field>

                        <v-text-field
                            label="Téléphone"
                            prepend-icon="fas fa-phone"
                            v-model="personEditor.phone">
                        </v-text-field>

                        <v-text-field
                            label="Email"
                            prepend-icon="fas fa-at"
                            v-model="personEditor.email">
                        </v-text-field>

                        <v-text-field
                            label="Dernier métier exercé"
                            prepend-icon="fas fa-briefcase"
                            v-model="personEditor.job">
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
            <v-btn color="accent" @click="savePerson()">Enregistrer</v-btn>
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

export default  {
    store,
    components: {
        ImageEditor
    },
    data: () => ({
        isLoading: false,
        headers: [
            { text: '', value: 'photo' },
            { text: 'Nom', value: 'name' },
            { text: 'Age', value: 'age' },
            { text: 'Adresse', value: 'address' },
            { text: 'Contact', value: 'contact' },
            { text: 'Emploi', value: 'job' },
            { text: '', value: 'actions' },
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
        filter: { search: "" }, // un filtre par recherche de mot clés multichamps
        persons: [],
        personsGallery: [],
        personEditor: {
            id: null,
            lastname: null,
            firstname: null,
            firstname2: null,
            surname: null,
            sex: null,
            dateOfBirth: null,
            dateOfDeath: null,
            address: null,
            job: null,
            phone: null,
            email: null,
            photo: null,

            open: false,
            isLoading: false,
            complete: 0,
            dateOfBirthMenu: false,
            dateOfDeathMenu: false,
        },
        editorRules: {
            photo: [
                value => !value || value.size < 2000000 || 'La taille de la photo doit être inférieur à 2 MB',
            ],
            dateOfBirth: [
                value => {
                    const pattern = /^([0-9]{4})?(-[0-9]{2}(-[0-9]{2})?)?$/
                    return pattern.test(value) || 'La valeur doit être une date valide: YYYY ou bien YYYY-MM ou bien YYYY-MM-DD'
                }
            ],
            dateOfDeath: [
                value => {
                    const pattern = /^([0-9]{4})?(-[0-9]{2}(-[0-9]{2})?)?$/
                    return pattern.test(value) || 'La valeur doit être une date valide: YYYY ou bien YYYY-MM ou bien YYYY-MM-DD'
                }
            ],
        }
    }),
    mounted() {
        this.isLoading = true;
        axios.get(`/api/agenda/persons`).then(response => {
            const data = parseAxiosResponse(response);
            let idx = 0;
            this.persons = data.map(e => ({
                ...e,
                name: `${e.lastname} ${e.firstname} ${e.firstname2} ${e.surname}`,
                age: this.computeAge(e),
                title: e.name,
                galleryIndex: e.thumb ? idx++ : null
            }));
            idx = 0;
            store.commit('photosGalleryReset', this.persons.filter(e => e.thumb));
            this.isLoading = false;
        });
    },
    methods: {
        computeAge(person) {
            let age = null;
            let birth = null;
            let death = null;
            if (person.dateOfBirth) {
                birth = new Date(person.dateOfBirth);
                const lastDay = person.dateOfDeath ? new Date(person.dateOfDeath) : new Date();
                const y = lastDay.getFullYear() - birth.getFullYear();
                if (y > 1) {
                    age = `${y} ans`;
                } else {
                    const m = differenceInMonths(lastDay, birth);
                    age = `${m} mois`;
                }
                birth = format(birth, "dd/MM/yyyy");
            }
            if (person.dateOfDeath) {
                death = format(new Date(person.dateOfDeath), "dd/MM/yyyy");
            }

            return { age, birth, death };
        },

        openMap(person) {
            if (person && person.address) {
                const url = `https://www.google.com/maps/place/${encodeURI(person.address)}`;
                const win = window.open(url, '_blank');
                win.focus();
            }
        },

        photosGalleryDisplay(index) {
            store.commit('photosGallerySetIndex', index);
            store.commit('photosGalleryDisplay');
        },

        resetDialog(open = false) {
            this.personEditor.open = open;
            this.personEditor.id = null;
            this.personEditor.lastname = null;
            this.personEditor.firstname = null;
            this.personEditor.firstname2 = null;
            this.personEditor.surname = null;
            this.personEditor.sex = null;
            this.personEditor.dateOfBirth = null;
            this.personEditor.dateOfDeath = null;
            this.personEditor.address = null;
            this.personEditor.job = null;
            this.personEditor.phone = null;
            this.personEditor.email = null;
            this.personEditor.photo = null;

            const { imgEditor } = this.$refs;
            imgEditor.reset();

            this.personEditor.complete = 0;
        },

        editPerson (person) {
            this.personEditor.open = true;
            this.personEditor.id = person.id;
            this.personEditor.lastname = person.lastname;
            this.personEditor.firstname = person.firstname;
            this.personEditor.firstname2 = person.firstname2;
            this.personEditor.surname = person.surname;
            this.personEditor.sex = person.sex;
            this.personEditor.dateOfBirth = person.dateOfBirth;
            this.personEditor.dateOfDeath = person.dateOfDeath;
            this.personEditor.address = person.address;
            this.personEditor.job = person.job;
            this.personEditor.phone = person.phone;
            this.personEditor.email = person.email
            this.personEditor.photo = person.photo;
            this.personEditor.complete = 0;
        },

        refreshList(person) {
            this.isLoading = true;
            let idx = this.persons.findIndex(e => e.id === person.id);
            if (idx > -1) {
                const newEntry = {
                    ...person,
                    name: `${person.lastname} ${person.firstname} ${person.firstname2} ${person.surname}`,
                    age: this.computeAge(person),
                    title: person.name,
                };
                this.persons.splice(idx, 1, newEntry)
            } else {
                this.persons.push({
                    ...person,
                    name: `${person.lastname} ${person.firstname} ${person.firstname2} ${person.surname}`,
                    age: this.computeAge(person),
                    title: person.name,
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

        savePerson() {
            this.personEditor.isLoading = true;
            const { imgEditor } = this.$refs;

            // On récupère l'image
            const imgUrl = imgEditor.imageUrl();
            let img = null;
            if (imgUrl) {
                axios.get(imgEditor.imageUrl(), { responseType: 'blob' }).then(
                    response => {
                        this.personEditor.image = response.data;
                        this._savePersonRequest();
                    }
                );
            } else {
                this.personEditor.image = null;
                this._savePersonRequest();
            }

        },
        _savePersonRequest() {
            // On prépare l'envoie des infos au serveur
            const formData = new FormData();
            formData.append("id", this.personEditor.id);
            formData.append("lastname", this.personEditor.lastname);
            formData.append("firstname", this.personEditor.firstname);
            formData.append("firstname2", this.personEditor.firstname2);
            formData.append("surname", this.personEditor.surname);
            formData.append("sex", this.personEditor.sex);
            formData.append("dateOfBirth", this.computeDateFromForm(this.personEditor.dateOfBirth));
            formData.append("dateOfDeath", this.computeDateFromForm(this.personEditor.dateOfDeath));
            formData.append("address", this.personEditor.address);
            formData.append("job", this.personEditor.job);
            formData.append("phone", this.personEditor.phone);
            formData.append("email", this.personEditor.email);
            formData.append("photo", this.personEditor.photo);

            if (this.personEditor.image) {
                formData.append("image", this.personEditor.image);
            }

            // On envoie au serveur
            const that = this;
            axios.post(`/api/agenda/person`, formData, {
                headers: {
                    "Content-Type" : "multipart/form-data",
                },
                onUploadProgress: progressEvent => {
                    this.personEditor.complete = (progressEvent.loaded / progressEvent.total * 100 | 0);
                }
            })
            .then( response => {
                const savedPerson = parseAxiosResponse(response);
                // on reset l'IHM
                that.resetDialog();
                // On ajoute ou met à jour la liste
                that.refreshList(savedPerson);
            })
            .catch( err => {
                store.commit('onError', err);
            });
        },

        computeDateFromForm(input) {
            try {
                if (input) {
                    const tokens = input.split("-");
                    let year = null;
                    let month = 0;
                    let day = 1;

                    if (tokens.length > 0) {
                        year = Number.parseInt(tokens[0], 10);
                    }
                    if (tokens.length > 1) {
                        month = Number.parseInt(tokens[1], 10) - 1;
                    }
                    if (tokens.length > 2) {
                        day = Number.parseInt(tokens[2], 10);
                    }
                    return new Date(year, month, day);
                }
            } catch (err) {}
            return null;
        }
    }
};
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
