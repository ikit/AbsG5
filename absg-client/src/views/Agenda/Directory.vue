<template>
  <div>
    <v-container>
      <v-card>
        <v-card-title>
          <v-text-field
            v-model="filter.search"
            prepend-icon="fas fa-search"
            style="max-width: 300px"
            label="Rechercher"
            single-line
            hide-details
          />
          <v-spacer />
          <v-btn
            v-if="$vuetify.breakpoint.lgAndUp"
            @click="resetDialog(true)"
          >
            <v-icon left>
              fa-plus
            </v-icon>
            Nouvelle entrée
          </v-btn>
          <v-btn
            v-else
            fab
            small
            @click.stop="resetDialog(true)"
          >
            <v-icon>fas fa-plus</v-icon>
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
          disable-sort
        >
          <template #[`item.photo`]="{ item }">
            <div
              v-if="item.thumb && $vuetify.breakpoint.lgAndUp"
              class="thumb"
            >
              <img
                :src="item.thumb"
                @click="photosGalleryDisplay(item.galleryIndex)"
              >
            </div>
            <div
              v-if="!item.thumb && $vuetify.breakpoint.lgAndUp"
              class="noThumb"
            >
              <v-icon small>
                fas fa-user-circle
              </v-icon>
            </div>
          </template>

          <template #[`item.name`]="{ item }">
            <div
              v-if="item.surname"
              style="font-style: italic;"
            >
              {{ item.surname }}
            </div>
            <div
              v-if="item.lastname"
              style="font-weight: bold"
            >
              {{ item.lastname }}
            </div>
            <div v-if="item.lastname">
              {{ item.firstname }}
              <span style="opacity:0.5">{{ item.firstname2 }}</span>
            </div>
          </template>

          <template #[`item.age`]="{ item }">
            <div
              v-if="item.age.age"
              style="font-weight: bold"
            >
              {{ item.age.age }}
            </div>
            <div v-if="item.age.birth">
              {{ item.age.birth }}
            </div>
            <div v-if="item.age.death">
              {{ item.age.death }}
            </div>
          </template>

          <template #[`item.contact`]="{ item }">
            <div v-if="item.phone">
              {{ item.phone }}
            </div>
            <div v-if="item.email">
              {{ item.email }}
            </div>
          </template>


          <template #[`item.actions`]="{ item }">
            <v-icon
              v-if="item.address"
              small
              class="mr-2"
              @click="openMap(item)"
            >
              fas fa-map-marker-alt
            </v-icon>
            <v-icon
              small
              class="mr-2"
              @click="editPerson(item)"
            >
              fa-pen
            </v-icon>
          </template>
        </v-data-table>
      </v-card>
    </v-container>


    <v-dialog
      v-model="personEditor.open"
      width="900px"
    >
      <v-card>
        <v-card-title class="grey lighten-4">
          {{ personEditor.id ? `Modifier les informations de ${personEditor.lastname} ${personEditor.firstname}` : "Nouvelle fiche" }}
        </v-card-title>

        <v-container
          grid-list-sm
          class="pa-4"
        >
          <v-form :disabled="personEditor.isLoading">
            <v-row>
              <v-col>
                <v-text-field
                  v-model="personEditor.lastname"
                  label="Nom"
                  prepend-icon="fas fa-user"
                />

                <v-text-field
                  v-model="personEditor.firstname"
                  label="Prénom (principale)"
                  style="margin-left: 33px;"
                />

                <v-text-field
                  v-model="personEditor.firstname2"
                  label="Prénoms secondaires"
                  style="margin-left: 33px;"
                />

                <v-text-field
                  v-model="personEditor.surname"
                  label="Surnom (utilisé à la place du prénom dans la famille)"
                  style="margin-left: 33px;"
                />

                <v-select
                  v-model="personEditor.sex"
                  :items="sexes"
                  prepend-icon="fas fa-venus-mars"
                  label="Sexe"
                  item-text="label"
                  item-value="id"
                />
              </v-col>

              <v-col>
                <v-text-field
                  v-model="personEditor.dateOfBirth"
                  :rules="editorRules.date"
                  label="Date de naissance"
                  placeholder="AAAA.MM.JJ"
                  style="margin-left: 33px;"
                  validate-on-blur
                  prepend-icon="far fa-calendar-alt"
                />
                <v-text-field
                  v-model="personEditor.dateOfDeath"
                  :rules="editorRules.date"
                  label="Date du décè"
                  placeholder="AAAA.MM.JJ"
                  style="margin-left: 33px;"
                  validate-on-blur
                  prepend-icon="far fa-calendar-alt"
                />

                <v-text-field
                  v-model="personEditor.address"
                  label="Adresse"
                  prepend-icon="fas fa-map-marker-alt"
                />

                <v-text-field
                  v-model="personEditor.phone"
                  label="Téléphone"
                  prepend-icon="fas fa-phone"
                />

                <v-text-field
                  v-model="personEditor.email"
                  label="Email"
                  prepend-icon="fas fa-at"
                />

                <v-text-field
                  v-model="personEditor.job"
                  label="Dernier métier exercé"
                  prepend-icon="fas fa-briefcase"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-container>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            color="primary"
            :disabled="personEditor.isLoading"
            @click="resetDialog()"
          >
            Annuler
          </v-btn>
          <v-btn
            color="accent"
            :loading="personEditor.isLoading"
            :disabled="personEditor.isLoading"
            @click="savePerson()"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>



<script>
import axios from 'axios';
import store from '../../store';
import { parseAxiosResponse } from '../../middleware/CommonHelper';
import { differenceInMonths, format } from 'date-fns';

export default  {
    store,
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

            open: false,
            isLoading: false,
            complete: 0,
            dateOfBirthMenu: false,
            dateOfDeathMenu: false,
        },
        editorRules: {
            date: [
                value => {
                    const pattern = /^([0-9]{4})?(\.[0-9]{2}(\.[0-9]{2})?)?$/
                    return !value || pattern.test(value) || 'La valeur doit être une date valide: YYYY ou bien YYYY.MM ou bien YYYY.MM.DD'
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
            this.personEditor.isLoading = false;
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
            this.personEditor.complete = 0;
        },

        editPerson (person) {
            this.personEditor.open = true;
            this.personEditor.isLoading = false;
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
            this.isLoading = false;
        },

        savePerson() {
            this.personEditor.isLoading = true;
            
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

            // On envoie au serveur
            axios.post(`/api/agenda/person`, formData, {
                headers: {
                    "Content-Type" : "multipart/form-data",
                },
                onUploadProgress: progressEvent => {
                    this.personEditor.complete = (progressEvent.loaded / progressEvent.total * 100 || 0);
                }
            })
            .then( response => {
                const savedPerson = parseAxiosResponse(response);
                // on reset l'IHM
                this.resetDialog();
                // On ajoute ou met à jour la liste
                this.refreshList(savedPerson);
            })
            .catch( err => {
                store.commit('onError', err);
                this.personEditor.isLoading = false;
            });
        },

        computeDateFromForm(input) {
            try {
                if (input) {
                    const tokens = input.split(".");
                    let year = null;
                    let month = 0;
                    let day = 1;

                    if (tokens.length > 0) {
                        year = Number.parseInt(tokens[0], 10);
                    }
                    if (tokens.length > 1) {
                        month = Number.parseInt(tokens[1], 10);
                    }
                    if (tokens.length > 2) {
                        day = Number.parseInt(tokens[2], 10);
                    }
                    return `${year.toString().padStart(4, "0")}.${month.toString().padStart(2, "0")}.${day.toString().padStart(2, "0")}`;
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
