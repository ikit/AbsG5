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
          />
          <v-spacer />
          <v-btn
            v-if="$vuetify.display.mdAndUp"
            @click.stop="resetDialog(true)"
          >
            <v-icon start>
              fas fa-plus
            </v-icon>
            <span>Nouvelle citation</span>
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
          :items="citations"
          :search="filter.search"
          loading-text="Récupération des citations..."
          no-data-text="Aucune citation enregistrée."
          no-results-text="Aucune citation trouvée."
          disable-sort
        >
          <template #[`item.citation`]="{ item }">
            <div style="display: flex; vertical-align: middle">
              <v-avatar
                v-if="$vuetify.display.lgAndUp"
                size="36px"
                style="flex: 0 1 1"
              >
                <img
                  alt="photo"
                  :src="item.author.thumb"
                >
              </v-avatar>
              <div
                class="citation"
                style="margin-left: 10px; font-size: 1.1em;"
                v-html="item.citation"
              />
            </div>
          </template>
          <template #[`item.author`]="{ item }">
            {{ item.author.fullname }}
            <p
              v-if="item.year"
              class="year"
            >
              {{ item.year }}
            </p>
          </template>

          <template #[`item.actions`]="{ item }">
            <v-icon
              small
              class="mr-2"
              @click="editCitation(item)"
            >
              fa-pen
            </v-icon>
            <v-icon
              small
              class="mr-2"
              @click="deleteCitationConfirmation(item)"
            >
              fas fa-times
            </v-icon>
          </template>
        </v-data-table>
      </v-card>
    </v-container>


    <v-dialog
      v-model="citationEditor.open"
      width="800px"
    >
      <v-card>
        <v-card-title class="grey lighten-4">
          {{ citationEditor.id ? "Editer la citation" : "Nouvelle citation" }}
        </v-card-title>
        <v-container
          grid-list-sm
          class="pa-4"
        >
          <v-row
            row
            wrap
          >
            <v-col cols="12">
              <v-autocomplete
                v-model="citationEditor.author"
                prepend-icon="fas fa-user"
                label="Autheur de la citation"
                :items="persons"
                item-title="fullname"
                item-value="id"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="citationEditor.citation"
                prepend-icon="fas fa-quote-left"
                label="La citation"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="citationEditor.year"
                prepend-icon="fas fa-calendar-alt"
                label="Année de référence (où la citation a été dite)"
              />
            </v-col>
            <v-col cols="12">
              <v-card>
                <div style="position: relative;">
                  <v-icon style="position: absolute; top: 18px; left: 22px;">
                    fas fa-info
                  </v-icon>
                  <p style="margin-left: 50px; padding: 10px; font-style: italic">
                    Merci de les mettre la citation entre double quotes, et les précisions entre parenthèses: "La citation" (ma précision).
                  </p>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            color="primary"
            @click="resetDialog()"
          >
            Annuler
          </v-btn>
          <v-btn
            color="accent"
            @click="saveCitation()"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="citationDeletion.open"
      width="800px"
    >
      <v-card>
        <v-card-title class="grey lighten-4">
          Supprimer la citation
        </v-card-title>
        <p style="margin: 0 24px;">
          Êtes vous sûr de vouloir supprimer cette citation ?
        </p>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            color="primary"
            @click="citationDeletion.open = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="accent"
            @click="deleteCitation()"
          >
            Supprimer
          </v-btn>
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
            { title: `Citation`, key: 'citation' },
            { title: `Auteur`, key: 'author' },
            { title: '', key: 'actions', align: 'end', sortable: false },
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
    computed: {
        numberOfPages () {
            return Math.ceil(this.citations.length / this.filter.pageSize)
        }
    },
    mounted () {
        this.isLoading = true;
        // On récupère la liste des personnes (pour l'aide à la saisie)
        axios.get(`/api/agenda/persons`).then(response => {
            this.persons = parseAxiosResponse(response);
        }).catch( err => {
            store.commit('onError', err);
        });

        // On récupère la liste des citations
        this.loadCitations();
    },
    methods: {
        loadCitations() {
            axios.get(`/api/citations/list`).then(response => {
                this.citations = parseAxiosResponse(response);
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
            this.citationEditor.author = citation.author.id;
            this.citationEditor.year = citation.year;
        },
        saveCitation: function () {
            // On vérifie si tout est bien renseigné
            this.citationEditor.isLoading = true;

            // Préparer les données à envoyer (sans les propriétés UI)
            const data = {
                id: this.citationEditor.id,
                citation: this.citationEditor.citation,
                author: this.citationEditor.author,
                year: this.citationEditor.year
            };

            // On envoie au serveur
            axios.post(`/api/citations/`, data).then(
                response => {
                    // on ferme la boite de dialogue
                    this.resetDialog();

                    // Recharger toute la liste pour avoir les données complètes
                    this.loadCitations();
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
            const citationId = this.citationDeletion.citation.id;
            axios.delete(`/api/citations/${citationId}`).then(
                response => {
                    // On ferme la boite de dialogue
                    this.citationDeletion.citation = null;
                    this.citationDeletion.open = false;

                    // Recharger la liste
                    this.loadCitations();
                },
                err => {
                    store.commit('onError', err);
                }
            );
        },

        searchMethod(value, search, item) {
            if (!search) {
                return true;
            }
            return item != null && (
                (item.citation && item.citation.toLowerCase().indexOf(search.toLowerCase()) > -1)
                || (item.author && item.author.fullname && item.author.fullname.toLowerCase().indexOf(search.toLowerCase()) > -1)
            );
        }
    }
};
</script>

<style lang="scss" scoped>
@use '../../themes/global.scss' as *;



.citation :deep(.note)  {
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
