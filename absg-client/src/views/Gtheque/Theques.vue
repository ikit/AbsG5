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
            v-if="$vuetify.breakpoint.mdAndUp"
            @click.stop="resetDialog(true)"
          >
            <v-icon left>
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
          :custom-filter="searchMethod"
          loading-text="Récupération des citations..."
          no-data-text="Aucune citation enregistrée."
          no-results-text="Aucune citation trouvée."
          disable-sort
        >
          <template #[`item.citation`]="{ item }">
            <div style="display: flex; vertical-align: middle">
              <v-avatar
                v-if="$vuetify.breakpoint.lgAndUp"
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
          <v-layout
            row
            wrap
          >
            <v-flex xs12>
              <v-autocomplete
                v-model="citationEditor.author"
                prepend-icon="fas fa-user"
                label="Autheur de la citation"
                :items="persons"
                item-text="fullname"
                item-value="id"
              />
            </v-flex>
            <v-flex xs12>
              <v-text-field
                v-model="citationEditor.citation"
                prepend-icon="fas fa-quote-left"
                label="La citation"
              />
            </v-flex>
            <v-flex xs12>
              <v-text-field
                v-model="citationEditor.year"
                prepend-icon="fas fa-calendar-alt"
                label="Année de référence (où la citation a été dite)"
              />
            </v-flex>
            <v-flex xs12>
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
            </v-flex>
          </v-layout>
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
import Vue from 'vue';
import { format } from 'date-fns';

export default {
    data: () => ({
        debugToken: format(new Date(), "yyyyMMddHHmmss")
    })
}
</script>


<style lang="scss" scoped>
@import '../../themes/global.scss';
h1 {
    font-size: 200px;
    line-height: 400px;
}
hr {
    width: 200px;
    border: 1px;
    border-bottom: 1px solid #aaa;
    margin: auto;
    margin-top: -50px;
    margin-bottom: 70px;
}
p {
    text-align: center;
    color: #999;
    font-size: 1.5em;
}
p.token {
    font-family: monospace;
    width: 210px;
    margin: auto;
    margin-top: 50px;
    border: 1px solid #999;
    background: #fff;
    text-align: center
}
</style>
