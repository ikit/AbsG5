<template>
  <div>
    <v-container>
      <v-card>
        <!-- Header avec recherche et bouton -->
        <v-card-title class="card-header">
          <v-text-field
            v-model="filter.search"
            prepend-inner-icon="fas fa-search"
            label="Rechercher"
            single-line
            hide-details
            density="compact"
            variant="outlined"
            class="search-field"
          />
          <v-spacer />
          <v-btn
            v-if="$vuetify.display.mdAndUp"
            color="accent"
            @click.stop="resetDialog(true)"
          >
            <v-icon start>
              fas fa-plus
            </v-icon>
            <span>Nouvelle citation</span>
          </v-btn>
          <v-btn
            v-else
            icon
            color="accent"
            @click.stop="resetDialog(true)"
          >
            <v-icon>fas fa-plus</v-icon>
          </v-btn>
        </v-card-title>

        <!-- Contenu principal -->
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
                class="citation-avatar"
              >
                <img
                  alt="photo"
                  :src="item.author.thumb"
                  class="citation-avatar-img"
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
        <v-card-title class="dialog-header bg-primary">
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
                prepend-inner-icon="fas fa-user"
                label="Auteur de la citation"
                :items="persons"
                item-title="fullname"
                item-value="id"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="citationEditor.citation"
                prepend-inner-icon="fas fa-quote-left"
                label="La citation"
                variant="outlined"
                density="compact"
                hide-details
                rows="3"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="citationEditor.year"
                prepend-inner-icon="fas fa-calendar-alt"
                label="Année de référence (où la citation a été dite)"
                variant="outlined"
                density="compact"
                hide-details
              />
            </v-col>
            <v-col cols="12">
              <v-alert
                type="info"
                variant="tonal"
                density="compact"
                class="info-alert"
              >
                Merci de mettre la citation entre double quotes, et les précisions entre parenthèses : "La citation" (ma précision).
              </v-alert>
            </v-col>
          </v-row>
        </v-container>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn
            variant="text"
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
        <v-card-title class="dialog-header bg-primary">
          Supprimer la citation
        </v-card-title>
        <v-card-text>
          Êtes vous sûr de vouloir supprimer cette citation ?
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn
            variant="text"
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
import store from '../../stores/helpers';
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

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.dialog-header {
  color: white;
}

.dialog-actions {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.search-field {
  max-width: 300px;
}

.citation :deep(.note) {
  color: rgba(var(--v-theme-on-surface), 0.45) !important;
  flex: 1 0 1;
}

.citationRow:hover {
  background: rgba(var(--v-theme-on-surface), 0.05);
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

.info-alert {
  font-size: 0.9em;
  font-style: italic;
  background: rgba(var(--v-theme-info), 0.25) !important;
  color: rgba(var(--v-theme-on-surface), 0.85) !important;

  :deep(.v-icon) {
    color: rgb(var(--v-theme-info)) !important;
  }
}

.citation-avatar {
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
}

.citation-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 600px) {
  .card-header {
    flex-wrap: wrap;
  }

  .search-field {
    flex: 1;
    min-width: 150px;
    max-width: unset;
  }
}
</style>
