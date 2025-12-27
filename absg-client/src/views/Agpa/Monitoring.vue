<template>
  <section
    v-if="isAdmin"
    id="content"
  >
    <v-card style="margin: 24px">
      <v-tabs
        v-model="currentTab"
        :show-arrows="$vuetify.display.mobile"
        :touch="false"
        :stacked="$vuetify.display.mobile"
      >
        <v-tab>
          <v-icon :start="!$vuetify.display.mobile">
            far fa-image
          </v-icon>
          <span v-if="!$vuetify.display.mobile">Photos</span>
        </v-tab>
        <v-tab>
          <v-icon :start="!$vuetify.display.mobile">
            fas fa-vote-yea
          </v-icon>
          <span v-if="!$vuetify.display.mobile">Votes</span>
        </v-tab>
        <v-tab>
          <v-icon :start="!$vuetify.display.mobile">
            fas fa-calculator
          </v-icon>
          <span v-if="!$vuetify.display.mobile">Notes</span>
        </v-tab>
        <v-tab>
          <v-icon :start="!$vuetify.display.mobile">
            fas fa-trophy
          </v-icon>
          <span v-if="!$vuetify.display.mobile">Palmarès</span>
        </v-tab>
        <v-tab>
          <v-icon :start="!$vuetify.display.mobile">
            fas fa-chart-pie
          </v-icon>
          <span v-if="!$vuetify.display.mobile">Stats</span>
        </v-tab>


      </v-tabs>

      <!-- <v-btn
        style="position: absolute; top: 5px; right: 5px"
        @click="closeEdition()"
      >
        <v-icon
          size="small"
          start
        >
          fa-plus
        </v-icon>
        Close edition
      </v-btn> -->

      <v-window v-model="currentTab" :touch="false">
        <!-- Vérification des photos -->
        <v-window-item>
          <h2>Participation</h2>

          <!-- Résumé de participation -->
          <v-card
            v-if="participationSummary"
            style="margin: 10px 10px 20px 10px; padding: 15px;"
            elevation="2"
          >
            <h3 style="margin-bottom: 15px; color: #666;">Résumé de la participation</h3>

            <v-row dense>
              <!-- Participants par famille -->
              <v-col cols="12" md="6">
                <div style="font-weight: bold; margin-bottom: 10px; color: #555;">Participants par famille</div>
                <v-table density="compact" style="font-size: 0.85em;">
                  <thead>
                    <tr>
                      <th style="text-align: left;">Famille</th>
                      <th style="text-align: center;">Participants</th>
                      <th style="text-align: center;">Photos</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="family in participationSummary.byFamily" :key="family.name">
                      <td style="text-align: left;">{{ family.name }}</td>
                      <td style="text-align: center; font-weight: 500;">{{ family.participants }}</td>
                      <td style="text-align: center;">{{ family.photos }}</td>
                    </tr>
                    <tr style="border-top: 2px solid #ccc; font-weight: bold;">
                      <td style="text-align: left;">Total</td>
                      <td style="text-align: center;">{{ participationSummary.totalParticipants }}</td>
                      <td style="text-align: center;">{{ participationSummary.totalPhotos }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>

              <!-- Photos par catégorie -->
              <v-col cols="12" md="6">
                <div style="font-weight: bold; margin-bottom: 10px; color: #555;">Photos par catégorie</div>
                <v-table density="compact" style="font-size: 0.85em;">
                  <thead>
                    <tr>
                      <th style="text-align: left;">Catégorie</th>
                      <th style="text-align: center;" title="Famille Gueudelot">Gd</th>
                      <th style="text-align: center;" title="Famille Guibert">Gb</th>
                      <th style="text-align: center;" title="Famille Guyomard">Gy</th>
                      <th style="text-align: center;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="cat in participationSummary.byCategory" :key="cat.id">
                      <td style="text-align: left;">{{ cat.name }}</td>
                      <td style="text-align: center;">{{ cat.gueudelot || '-' }}</td>
                      <td style="text-align: center;">{{ cat.guibert || '-' }}</td>
                      <td style="text-align: center;">{{ cat.guyomard || '-' }}</td>
                      <td style="text-align: center; font-weight: 500;">{{ cat.total }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
            </v-row>
          </v-card>

          <!-- Filtre rapide -->
          <v-card style="margin: 10px; padding: 15px;" elevation="1">
            <v-text-field
              v-model="photoFilter"
              prepend-icon="fas fa-search"
              label="Filtrer par photographe, titre de photo ou catégorie"
              single-line
              hide-details
              clearable
              density="compact"
            />
          </v-card>

          <v-table style="text-align: left; font-size: 0.8em; margin: 10px">
            <template #default>
              <thead>
                <tr style="vertical-align: baseline;">
                  <th style="width: 200px;">Auteur</th>
                  <th style="width: 150px;">Catégorie</th>
                  <th>Photos</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="group of filteredPhotosByAuthorAndCategory"
                  :key="`${group.userId}-${group.categoryId}`"
                >
                  <td style="vertical-align: top; padding-top: 10px;">
                    {{ group.username }}
                  </td>
                  <td style="vertical-align: top; padding-top: 10px;">
                    {{ group.categoryTitle }}
                  </td>
                  <td>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                      <div
                        v-for="photo in group.photos"
                        :key="photo.id"
                        style="display: inline-block; text-align: center;"
                      >
                        <img
                          class="thumb"
                          :src="photo.thumb"
                          @click="photosGalleryDisplay(photo)"
                          style="display: block; margin-bottom: 5px;"
                        >
                        <div
                          @click="displayPhotoEdition(photo)"
                          style="cursor: pointer; font-size: 0.9em; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #1976d2;"
                          :title="photo.title"
                        >
                          {{ photo.title }}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </v-window-item>

        <!-- Vérification des votes -->
        <v-window-item>
          <h2>Vérification des votes</h2>

          <!-- Résumé des votes -->
          <v-card
            v-if="votesSummary"
            style="margin: 10px 10px 20px 10px; padding: 15px;"
            elevation="2"
          >
            <h3 style="margin-bottom: 15px; color: #666;">Résumé des votes</h3>

            <v-row dense>
              <!-- Votants par famille -->
              <v-col cols="12" md="6">
                <div style="font-weight: bold; margin-bottom: 10px; color: #555;">Votants par famille</div>
                <v-table density="compact" style="font-size: 0.85em;">
                  <thead>
                    <tr>
                      <th style="text-align: left;">Famille</th>
                      <th style="text-align: center;">Votants</th>
                      <th style="text-align: center;">Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="family in votesSummary.byFamily" :key="family.name">
                      <td style="text-align: left;">{{ family.name }}</td>
                      <td style="text-align: center; font-weight: 500;">{{ family.voters }}</td>
                      <td style="text-align: center;">{{ family.votes }}</td>
                    </tr>
                    <tr style="border-top: 2px solid #ccc; font-weight: bold;">
                      <td style="text-align: left;">Total</td>
                      <td style="text-align: center;">{{ votesSummary.totalVoters }}</td>
                      <td style="text-align: center;">{{ votesSummary.totalVotes }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>

              <!-- Votes par catégorie -->
              <v-col cols="12" md="6">
                <div style="font-weight: bold; margin-bottom: 10px; color: #555;">Votes par catégorie</div>
                <v-table density="compact" style="font-size: 0.85em;">
                  <thead>
                    <tr>
                      <th style="text-align: left;">Catégorie</th>
                      <th style="text-align: center;" title="Famille Gueudelot">Gd</th>
                      <th style="text-align: center;" title="Famille Guibert">Gb</th>
                      <th style="text-align: center;" title="Famille Guyomard">Gy</th>
                      <th style="text-align: center;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="cat in votesSummary.byCategory" :key="cat.id">
                      <td style="text-align: left;">{{ cat.name }}</td>
                      <td style="text-align: center;">{{ cat.gueudelot || '-' }}</td>
                      <td style="text-align: center;">{{ cat.guibert || '-' }}</td>
                      <td style="text-align: center;">{{ cat.guyomard || '-' }}</td>
                      <td style="text-align: center; font-weight: 500;">{{ cat.total }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
            </v-row>
          </v-card>

          <v-table style="text-align: left; font-size: 0.8em; margin: 10px">
            <template #default>
              <thead>
                <tr style="vertical-align: baseline;">
                  <th>Juré</th>
                  <th
                    v-for="catId of votesCategories"
                    :key="catId"
                  >
                    {{ data.categories[catId].title }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="vUser of votes"
                  :key="vUser.id"
                >
                  <td>{{ vUser.username }} <span style="opacity: 0.5">- {{ vUser.age }} ans</span></td>
                  <td
                    v-for="(cat, idx) of vUser.votes"
                    :key="idx"
                  >
                    <a
                      v-if="cat"
                      style="display: block"
                      @click="displayVotesDetails(cat)"
                    >
                      <i
                        v-if="cat.valid"
                        class="fas fa-check"
                        style="color: #2e7d32"
                      />
                      <i
                        v-else
                        class="fas fa-exclamation-triangle"
                        style="color: #ff8f00"
                      />
                      &nbsp; {{ cat.votes.length }}
                    </a>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </v-window-item>

        <!-- Notes des photos -->
        <v-window-item>
          <div
            class="row"
            style="margin: 0 10px 0 0;"
          >
            <h2>Calcul des notes</h2>
            <v-spacer />
            <v-text-field
              v-model="notesFilter.quickFilter"
              prepend-icon="fas fa-search"
              label="Rechercher"
              single-line
              hide-details
              style="width: 200px"
            />
                        &nbsp;
            <v-select
              :items="notesCategories"
              label="Catégorie"
              item-title="label"
              item-value="id"
              style="width: 200px"
              @change="updateNotesList($event)"
            />
          </div>

          <v-data-table
            :headers="notesHeaders"
            :items="notes"
            :search="notesFilter.quickFilter"
            :loading="isLoading"
            loading-text="Récupération des données..."
          >
            <template #[`item.category`]="{ item }">
              {{ data.categories[item.categoryId].title }}
            </template>

            <template #[`item.author`]="{ item }">
              {{ item.username }}
            </template>

            <template #[`item.photo`]="{ item }">
              {{ item.title }} <br />({{ item.id }})
            </template>

            <template #[`item.votes`]="{ item }">
              {{ item.score }} pts <span style="opacity: 0.5">({{ item.votes }} votes)</span><br>
              <span style="color: red;">{{ item.formerStats.score }} pts <span style="opacity: 0.5">({{ item.formerStats.votes }} votes)</span></span>
            </template>

            <template #[`item.title`]="{ item }">
              {{ item.votesTitle }}<br>
              <span style="color: red;">{{ item.formerStats.votesTitle }}</span>
            </template>

            <template #[`item.score`]="{ item }">
              {{ item.gscore }}<br>
              <span style="color: red;">{{ item.formerStats.gscore }}</span>
            </template>

            <template #[`item.awards`]="{ item }">
              <span
                v-for="a of item.awards"
                :key="a.categoryId"
              >
                <v-tooltip bottom>
                  <template #activator="{ props }">
                    <i
                      v-if="a.award === 'diamond'"
                      class="fas fa-circle"
                      style="color: #c3f1ff"
                      v-bind="props"
                    />
                    <i
                      v-if="a.award === 'gold'"
                      class="fas fa-circle"
                      style="color: #c68b00"
                      v-bind="props"
                    />
                    <i
                      v-if="a.award === 'sylver'"
                      class="fas fa-circle"
                      style="color: #9b9b9b"
                      v-bind="props"
                    />
                    <i
                      v-if="a.award === 'bronze'"
                      class="fas fa-circle"
                      style="color: #964c31"
                      v-bind="props"
                    />
                    <i
                      v-if="a.award === 'nominated'"
                      class="far fa-circle"
                      v-bind="props"
                    />
                    <i
                      v-if="a.award === 'honor'"
                      class="far fa-smile"
                      v-bind="props"
                    />
                  </template>
                  {{ data.categories[a.categoryId].title }}
                </v-tooltip>
              </span>
            </template>
          </v-data-table>
        </v-window-item>

        <!-- Palmarès -->
        <v-window-item>
          <h2>Etablissement du palmarès</h2>
          <v-data-table
            :headers="palmaresHeaders"
            :items="palmares"
            :search="palmaresFilter.quickFilter"
            :loading="isLoading"
            loading-text="Récupération des données..."
            no-data-text="Aucun palmarès disponible."
            no-results-text="Aucune personne trouvée."
          >
            <template #[`item.photographe`]="{ item }">
              <img
                :src="item.url"
                style="height: 40px; margin-right: 15px; vertical-align: middle"
              >
              <span style="font-size: 1.2em">{{ item.username }}</span>
            </template>

            <template #[`item.awards`]="{ item }">
              <template v-if="item.rewards.diamond">
                <i
                  class="fas fa-circle"
                  style="color: #c3f1ff"
                /> {{ item.rewards.diamond }}
              </template>
              <template v-if="item.rewards.gold">
                <i
                  class="fas fa-circle"
                  style="color: #c68b00"
                /> {{ item.rewards.gold }}
              </template>
              <template v-if="item.rewards.sylver">
                <i
                  class="fas fa-circle"
                  style="color: #9b9b9b"
                /> {{ item.rewards.sylver }}
              </template>
              <template v-if="item.rewards.bronze">
                <i
                  class="fas fa-circle"
                  style="color: #964c31"
                /> {{ item.rewards.bronze }}
              </template>
              <template v-if="item.rewards.nominated">
                <i class="far fa-circle" /> {{ item.rewards.nominated }}
              </template>
              <template v-if="item.rewards.honor">
                <i class="far fa-smile" /> {{ item.rewards.honor }}
              </template>
            </template>

            <template #[`item.scoreOf8`]="{ item }">
              <span style="font-weight: bold">{{ item.scoreOf8 }} </span> <template v-if="item.scoreOf8 > 1">
                pts
              </template><template v-else>
                pt
              </template>
            </template>

            <template #[`item.average`]="{ item }">
              <span>{{ item.average }} </span> <template v-if="item.average > 1">
                pts
              </template><template v-else>
                pt
              </template>
            </template>

            <template #[`item.lower`]="{ item }">
              <span>{{ item.lower }} </span> <template v-if="item.lower > 1">
                pts
              </template><template v-else>
                pt
              </template>
            </template>

            <template #[`item.score`]="{ item }">
              <span style="font-weight: bold">{{ item.palmares }} </span> <template v-if="item.palmares > 1">
                pts
              </template><template v-else>
                pt
              </template>
            </template>

            <template #[`item.formerPalmares`]="{ item }">
              <span>{{ item.formerPalmares }} </span> <template v-if="item.formerPalmares > 1">
                pts
              </template><template v-else>
                pt
              </template>
            </template>

            <template #[`item.newPalmares`]="{ item }">
              <span>{{ item.formerPalmares + item.palmares }} </span> <template v-if="item.formerPalmares + item.palmares > 1">
                pts
              </template><template v-else>
                pt
              </template>
            </template>
          </v-data-table>
        </v-window-item>

        <!-- Stats -->
        <v-window-item>
          <h2>Participation</h2>
          <div :style="{ display: 'flex', flexDirection: $vuetify.display.mobile ? 'column' : 'row' }">
            <div :style="{ flex: $vuetify.display.mobile ? '1 1 auto' : '1 0 0', overflowX: 'auto' }">
              <table style="width: 100%; font-size: 0.8em;">
                <thead>
                  <tr>
                    <th>&nbsp;</th>
                    <th>Gueudelot</th>
                    <th>Guibert</th>
                    <th>Guyomard</th>
                    <th>Adultes | Enfants</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in (data && data.photosStats) || []"
                    :key="row.catId"
                  >
                    <td style="text-align: right; font-weight: bold">
                      {{ row.name }}
                    </td>
                    <td>{{ row.totalByFamilies.gueudelot }}</td>
                    <td>{{ row.totalByFamilies.guibert }}</td>
                    <td>{{ row.totalByFamilies.guyomard }}</td>
                    <td>{{ row.totalByAge.adults }} | {{ row.totalByAge.childdren }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div :style="{ flex: $vuetify.display.mobile ? '1 1 auto' : '0 1 0', marginTop: $vuetify.display.mobile ? '20px' : '0' }">
              <highcharts
                v-if="participationGraph"
                :options="participationGraph"
              />
            </div>
          </div>
          <div :style="{ marginTop: '20px' }">
            <h2>Votes</h2>

            <!-- Partie 1: Sélection du photographe + Indicateurs globaux -->
            <v-card style="margin-bottom: 20px;">
              <v-card-text>
                <div :style="{ display: 'flex', flexDirection: $vuetify.display.mobile ? 'column' : 'row', gap: '20px', alignItems: $vuetify.display.mobile ? 'stretch' : 'center' }">
                  <div :style="{ flex: '0 0 250px', minWidth: $vuetify.display.mobile ? '100%' : '250px' }">
                    <v-select
                      v-model="votesFilter.selectedUser"
                      :items="photographersList"
                      item-title="label"
                      item-value="username"
                      label="Sélectionner un photographe"
                      clearable
                      density="compact"
                    >
                      <template v-slot:item="{ props, item }">
                        <v-list-subheader v-if="item.raw.header" :key="item.raw.header">
                          {{ item.raw.header }}
                        </v-list-subheader>
                        <v-list-item v-else v-bind="props" :key="item.raw.username" />
                      </template>
                    </v-select>
                  </div>

                  <!-- Indicateurs globaux -->
                  <div v-if="votesFilter.selectedUser && votesUserStats" :style="{ flex: '1 1 auto', display: 'flex', gap: '30px', flexWrap: 'wrap' }">
                    <div>
                      <div style="font-size: 0.75em; color: #666; text-transform: uppercase;">Points donnés</div>
                      <div style="font-size: 1.5em; font-weight: bold; color: #1976d2;">{{ votesUserStats.given.total }}</div>
                    </div>
                    <div>
                      <div style="font-size: 0.75em; color: #666; text-transform: uppercase;">Points reçus</div>
                      <div style="font-size: 1.5em; font-weight: bold; color: #388e3c;">{{ votesUserStats.received.total }}</div>
                    </div>
                    <div>
                      <div style="font-size: 0.75em; color: #666; text-transform: uppercase;">Ratio</div>
                      <div style="font-size: 1.5em; font-weight: bold; color: #f57c00;">{{ votesUserStats.received.total > 0 ? (votesUserStats.given.total / votesUserStats.received.total).toFixed(2) : '-' }}</div>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <div v-if="votesFilter.selectedUser && votesUserStats" :style="{ display: 'flex', flexDirection: $vuetify.display.mobile ? 'column' : 'row', gap: '20px' }">

              <!-- Partie 2: Tableaux votes donnés/reçus -->
              <v-card :style="{ flex: $vuetify.display.mobile ? '1 1 auto' : '1 1 50%', minWidth: $vuetify.display.mobile ? '100%' : '400px', maxWidth: $vuetify.display.mobile ? '100%' : '600px' }">
                <v-card-text>
                  <!-- Layout en 2 colonnes -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8em;">

                        <!-- Colonne Points Donnés -->
                        <div>
                          <div style="font-weight: bold; margin-bottom: 8px; text-align: center; background: #f5f5f5; padding: 4px;">
                            Points donnés
                          </div>

                          <!-- Stats par famille -->
                          <div style="margin-bottom: 8px; padding: 4px; background: #fafafa;">
                            <div style="font-size: 0.9em; margin-bottom: 4px;">
                              Total: {{ votesUserStats.given.total }} pts
                            </div>
                            <div v-for="item in votesUserStats.given.byFamily" :key="'given-fam-'+item.family" style="font-size: 0.85em; color: #666; padding-left: 8px;">
                              {{ item.family }}: {{ item.points }} pts ({{ Math.round(item.points / votesUserStats.given.total * 100) }}%)
                            </div>
                          </div>

                          <!-- Tableau détaillé par personne -->
                          <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                              <tr style="border-bottom: 1px solid #ddd;">
                                <th style="text-align: left; padding: 2px; font-size: 0.85em;">Personne</th>
                                <th style="text-align: right; padding: 2px; font-size: 0.85em;">Points (%)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="person in votesUserStats.given.byPerson" :key="'given-'+person.username" style="border-bottom: 1px solid #eee;">
                                <td style="padding: 2px; font-size: 0.85em; text-align: left;">
                                  <span :style="{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getUserColor(person.username), marginRight: '6px' }"></span>
                                  {{ person.username }}
                                </td>
                                <td style="text-align: right; padding: 2px; font-size: 0.85em;">{{ person.points }} ({{ Math.round(person.points / votesUserStats.given.total * 100) }}%)</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <!-- Colonne Points Reçus -->
                        <div>
                          <div style="font-weight: bold; margin-bottom: 8px; text-align: center; background: #f5f5f5; padding: 4px;">
                            Points reçus
                          </div>

                          <!-- Stats par famille -->
                          <div style="margin-bottom: 8px; padding: 4px; background: #fafafa;">
                            <div style="font-size: 0.9em; margin-bottom: 4px;">
                              Total: {{ votesUserStats.received.total }} pts
                            </div>
                            <div v-for="item in votesUserStats.received.byFamily" :key="'received-fam-'+item.family" style="font-size: 0.85em; color: #666; padding-left: 8px;">
                              {{ item.family }}: {{ item.points }} pts ({{ Math.round(item.points / votesUserStats.received.total * 100) }}%)
                            </div>
                          </div>

                          <!-- Tableau détaillé par personne -->
                          <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                              <tr style="border-bottom: 1px solid #ddd;">
                                <th style="text-align: left; padding: 2px; font-size: 0.85em;">Personne</th>
                                <th style="text-align: right; padding: 2px; font-size: 0.85em;">Points (%)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="person in votesUserStats.received.byPerson" :key="'received-'+person.username" style="border-bottom: 1px solid #eee;">
                                <td style="padding: 2px; font-size: 0.85em; text-align: left;">
                                  <span :style="{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getUserColor(person.username), marginRight: '6px' }"></span>
                                  {{ person.username }}
                                </td>
                                <td style="text-align: right; padding: 2px; font-size: 0.85em;">{{ person.points }} ({{ Math.round(person.points / votesUserStats.received.total * 100) }}%)</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                      </div>
                  </v-card-text>
                </v-card>

                <!-- Partie 3: Diagramme -->
                <v-card :style="{ flex: $vuetify.display.mobile ? '1 1 auto' : '1 1 50%', minWidth: $vuetify.display.mobile ? '100%' : '400px' }">
                  <v-card-text>
                    <highcharts
                      v-if="votesGraph"
                      :options="votesGraph"
                    />
                  </v-card-text>
                </v-card>

              </div>

          </div>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Détails photo -->
    <v-dialog
      v-model="photoDetails.displayed"
      width="800px"
    >
      <v-card v-if="photoDetails.photo">
        <v-card-title class="bg-grey-lighten-4">
          Informations sur la photo {{ photoDetails.photo.id }}
        </v-card-title>
        <div style="display: flex; margin: 0 24px">
          <v-table
            v-if="photoDetails.votes.length > 0"
              density="compact"
              style="text-align: left; font-size: 0.8em; margin: 10px"
            >
              <template #default>
                <thead>
                  <tr style="vertical-align: baseline;">
                    <th>Juré</th>
                    <th>Vote</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="vote of photoDetails.votes"
                    :key="vote.id"
                  >
                    <td>
                      {{ vote.username }}
                    </td>
                    <td>
                      <i
                        v-if="vote.categoryId === -3"
                        class="fas fa-feather-alt"
                      />
                      <i
                        v-else
                        class="fas fa-star"
                      >{{ vote.score }}</i>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-table>
        </div>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            @click="photoDetails.displayed = false"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Photo Edition -->
    <v-dialog
      v-model="photoEdition.displayed"
      width="800px"
    >
      <v-card v-if="photoEdition.photo">
        <v-card-title class="bg-grey-lighten-4">
          Modification de la photo {{ photoEdition.photo.id }}
        </v-card-title>
        <v-container class="pa-4">
          <v-row>
            <v-col cols="12" md="6">
              <!-- Prévisualisation de l'image -->
              <div style="text-align: center; margin-bottom: 20px;">
                <img
                  :src="photoEdition.photo.thumb"
                  :style="{
                    transform: `rotate(${photoEdition.rotation}deg)`,
                    transition: 'transform 0.3s ease',
                    maxWidth: '100%',
                    maxHeight: '300px'
                  }"
                  class="thumb"
                >
              </div>

              <!-- Boutons de rotation -->
              <div style="text-align: center;">
                <v-btn-group>
                  <v-btn
                    @click="rotatePhoto(-90)"
                    :disabled="photoEdition.isLoading"
                  >
                    <v-icon start>fas fa-undo</v-icon>
                    Rotation -90°
                  </v-btn>
                  <v-btn
                    @click="rotatePhoto(90)"
                    :disabled="photoEdition.isLoading"
                  >
                    <v-icon start>fas fa-redo</v-icon>
                    Rotation +90°
                  </v-btn>
                </v-btn-group>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <!-- Titre -->
              <v-text-field
                v-model="photoEdition.title"
                label="Titre"
                prepend-icon="fas fa-feather-alt"
                :disabled="photoEdition.isLoading"
              />

              <!-- Catégorie -->
              <v-select
                v-model="photoEdition.categoryId"
                :items="categoriesOptions"
                item-title="title"
                item-value="id"
                label="Catégorie"
                prepend-icon="fas fa-tag"
                :disabled="photoEdition.isLoading"
              />

              <!-- Auteur (lecture seule) -->
              <v-text-field
                :model-value="photoEdition.photo.username"
                label="Auteur"
                prepend-icon="fas fa-user"
                readonly
                disabled
              />

              <!-- Progress indicator -->
              <v-progress-linear
                v-if="photoEdition.isLoading"
                :model-value="photoEdition.progress"
                color="accent"
                height="25"
                striped
              >
                <template v-slot:default="{ value }">
                  <strong>{{ Math.ceil(value) }}%</strong>
                </template>
              </v-progress-linear>
            </v-col>
          </v-row>
        </v-container>
        <v-card-actions>
          <v-btn
            variant="text"
            color="error"
            @click="deletePhotoFromEdition()"
            :disabled="photoEdition.isLoading"
          >
            <v-icon start>fas fa-trash</v-icon>
            Supprimer
          </v-btn>
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            @click="cancelPhotoEdition()"
            :disabled="photoEdition.isLoading"
          >
            Annuler
          </v-btn>
          <v-btn
            color="accent"
            @click="savePhotoEdition()"
            :disabled="photoEdition.isLoading"
            :loading="photoEdition.isLoading"
          >
            <v-icon start>fas fa-save</v-icon>
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Détails votes -->
    <v-dialog
      v-model="voteDetails.displayed"
      width="800px"
    >
      <v-card v-if="voteDetails.vote">
        <v-card-title class="bg-grey-lighten-4">
          Votes {{ voteDetails.vote.username }}, catégorie {{ voteDetails.vote.categoryTitle }}
        </v-card-title>
        <p style="opacity: 0.5; padding: 0 24px">
          Le tableau de gauche montre tout les votes du juré pour la catégorie concerné.
          Les informations à droite permettent de controler la validité de ces votes pour le calcule des notes ensuite.
        </p>
        <div style="display: flex; margin: 0 24px">
          <div style="flex: 1 1 auto">
            <v-table
              density="compact"
              style="text-align: left; font-size: 0.8em; margin: 10px"
            >
              <template #default>
                <thead>
                  <tr style="vertical-align: baseline;">
                    <th>Photo</th>
                    <th>Vote</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="vote of voteDetails.vote.votes"
                    :key="vote.id"
                  >
                    <td>
                      {{ vote.photoId }} - {{ vote.title }}<br>
                      <span style="opacity: 0.5">uId: {{ vote.pUserId }} | catId: {{ vote.pCategoryId }} | year: {{ vote.pYear }}</span>
                    </td>
                    <td>
                      <i
                        v-if="voteDetails.vote.categoryId === -3"
                        class="fas fa-feather-alt"
                      />
                      <i
                        v-else
                        class="fas fa-star"
                      >{{ vote.score }}</i>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-table>
          </div>

          <div style="flex: 1 1 auto;">
            <b>Catégorie:</b><ul>
              <li>Titre: {{ voteDetails.vote.categoryTitle }} </li>
              <li>Id: {{ voteDetails.vote.categoryId }} </li>
              <li>Max votes: {{ voteDetails.vote.maxVote }} </li>
            </ul>

            <b>Juré:</b><ul>
              <li>Nom: {{ voteDetails.vote.username }} </li>
              <li>Id: {{ voteDetails.vote.userId }} </li>
              <li>Age: {{ voteDetails.vote.age }} </li>
            </ul>

            <b>Erreurs détectées:</b><ul>
              <li>authorError: {{ voteDetails.vote.errors.authorError }} </li>
              <li>categoryError: {{ voteDetails.vote.errors.categoryError }} </li>
              <li>childError: {{ voteDetails.vote.errors.childError }} </li>
              <li>scoreError: {{ voteDetails.vote.errors.scoreError }} </li>
              <li>votesNumberError: {{ voteDetails.vote.errors.votesNumberError }} </li>
              <li>yearError: {{ voteDetails.vote.errors.yearError }} </li>
            </ul>
          </div>
        </div>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            @click="voteDetails.displayed = false"
          >
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>

  <section v-else>
    <div style="text-align: center; margin-top: 20px">
      Accès réservé aux administrateurs
    </div>
  </section>
</template>


<script>
import axios from 'axios';
import { mapState } from '../../stores/helpers';
import { getModuleInfo, getPeopleAvatar, parseAxiosResponse } from '../../middleware/CommonHelper';
import { format } from 'date-fns';
import { fr } from "date-fns/locale";
import { agpaPhotoToGalleryPhoto } from '../../middleware/AgpaHelper';
import PhotoWidget from './components/PhotoWidget.vue';
import store from '../../stores/helpers';
import {Chart} from 'highcharts-vue';
import Highcharts from 'highcharts';
import HC_sankey from 'highcharts/modules/sankey';
import HC_depwheel from 'highcharts/modules/dependency-wheel';
HC_sankey(Highcharts);
HC_depwheel(Highcharts);

export default {
    components: {
        highcharts: Chart
    },
    store,
    data: () => ({
        currentTab: 0,
        isLoading: false,
        waitingScreen: false,
        isAdmin: false,
        end: "",

        photoFilter: "",
        photos: [],
        photoDetails: {
          displayed: false,
          votes: [],
          photo: null
        },
        photoEdition: {
          displayed: false,
          photo: null,
          title: '',
          categoryId: null,
          rotation: 0,
          isLoading: false,
          progress: 0
        },

        votes: [],
        votesCategories: [],
        voteDetails: {
            displayed: false,
            vote: null
        },

        notesHeaders: [
            { text: 'Catégorie', value: 'category' },
            { text: 'Auteur', value: 'author' },
            { text: 'Photo', value: 'photo' },
            { text: 'Votes', value: 'votes' },
            { text: 'Titre', value: 'title' },
            { text: 'Score Global', value: 'score' },
            { text: 'AGPA', value: 'awards' }
        ],
        notesFilter: {
            quickfilter: null, // un filtre par recherche de mot clés multichamps: cf construction du champs quickfilter dans mounted()
            categoryId: null, // si on filtre une catégorie en particulier
        },
        notesCategories: [{ label: "Toutes", id: null }],
        notes: [],
        notesAll: [],

        palmaresHeaders: [
            { text: 'Photographe', value: 'photographe' },
            { text: 'Récompenses', value: 'awards' },
            { text: '8 meilleurs photos', value: 'scoreOf8' },
            { text: 'Moyenne des photos', value: 'average' },
            { text: 'Moins bonne photo', value: 'lower' },
            { text: 'Score', value: 'score' },
            { text: 'Palmarès précédant', value: 'formerPalmares' },
            { text: 'Nouveau Palmarès', value: 'newPalmares' },
        ],
        palmaresFilter: {
            quickfilter: null, // un filtre par recherche de mot clés multichamps: cf construction du champs quickfilter dans mounted()
            categoryId: null, // si on filtre une catégorie en particulier
        },
        palmares: [],

        data: {
            categories: {},
            photosStats: [],
            usersOrder: [],
            votesStats: [],
            votesStatsAll: [], // Copie complète des stats de votes
            categoriesOrders: []
        },
        participationGraph: null,
        votesGraph: null,
        votesFilter: {
            selectedUser: null
        },
    }),
    computed: {
        ...mapState([
            'agpaMeta',
            'user'
        ]),
        categoriesOptions() {
            if (!this.data || !this.data.categories) return [];
            return this.data.categoriesOrders
                .map(id => this.data.categories[id])
                .filter(cat => cat && cat.id > 0);
        },
        photographersList() {
            if (!this.data || !this.data.users) return [];

            // Grouper les utilisateurs par famille
            const usersByFamily = {};
            Object.values(this.data.users).forEach(u => {
                const family = (u.rootFamily || 'autre').toLowerCase();
                if (!usersByFamily[family]) {
                    usersByFamily[family] = [];
                }
                usersByFamily[family].push({
                    username: u.username,
                    label: u.username,
                    rootFamily: family
                });
            });

            // Trier les utilisateurs dans chaque famille
            Object.keys(usersByFamily).forEach(family => {
                usersByFamily[family].sort((a, b) => a.username.localeCompare(b.username));
            });

            // Créer la liste avec headers de groupe
            const result = [];
            const familyOrder = ['gueudelot', 'guibert', 'guyomard', 'autre'];

            familyOrder.forEach(family => {
                if (usersByFamily[family]) {
                    // Ajouter le header de groupe
                    result.push({
                        header: family.charAt(0).toUpperCase() + family.slice(1)
                    });
                    // Ajouter les utilisateurs de cette famille
                    result.push(...usersByFamily[family]);
                }
            });

            return result;
        },
        votesUserStats() {
            if (!this.votesFilter.selectedUser || !this.data.votesStatsAll) return null;

            const username = this.votesFilter.selectedUser;
            const stats = {
                given: { total: 0, totalVotes: 0, byFamily: {}, byPerson: {} },
                received: { total: 0, totalVotes: 0, byFamily: {}, byPerson: {} }
            };

            // Calculer les points donnés et reçus
            this.data.votesStatsAll.forEach(vote => {
                const [from, to, weight] = vote;

                // Points donnés par le photographe
                if (from === username) {
                    stats.given.total += weight;
                    stats.given.totalVotes += 1;
                    // Trouver la famille du destinataire
                    const toUser = Object.values(this.data.users).find(u => u.username === to);
                    if (toUser) {
                        const family = toUser.rootFamily || 'Autre';
                        if (!stats.given.byFamily[family]) {
                            stats.given.byFamily[family] = { points: 0, votes: 0 };
                        }
                        stats.given.byFamily[family].points += weight;
                        stats.given.byFamily[family].votes += 1;

                        // Ajouter au compteur par personne
                        if (!stats.given.byPerson[to]) {
                            stats.given.byPerson[to] = { username: to, voteCount: 0, points: 0 };
                        }
                        stats.given.byPerson[to].voteCount += 1;
                        stats.given.byPerson[to].points += weight;
                    }
                }

                // Points reçus par le photographe
                if (to === username) {
                    stats.received.total += weight;
                    stats.received.totalVotes += 1;
                    // Trouver la famille de l'expéditeur
                    const fromUser = Object.values(this.data.users).find(u => u.username === from);
                    if (fromUser) {
                        const family = fromUser.rootFamily || 'Autre';
                        if (!stats.received.byFamily[family]) {
                            stats.received.byFamily[family] = { points: 0, votes: 0 };
                        }
                        stats.received.byFamily[family].points += weight;
                        stats.received.byFamily[family].votes += 1;

                        // Ajouter au compteur par personne
                        if (!stats.received.byPerson[from]) {
                            stats.received.byPerson[from] = { username: from, voteCount: 0, points: 0 };
                        }
                        stats.received.byPerson[from].voteCount += 1;
                        stats.received.byPerson[from].points += weight;
                    }
                }
            });

            // Convertir les objets byPerson en tableaux triés par nombre de points décroissant
            stats.given.byPerson = Object.values(stats.given.byPerson)
                .sort((a, b) => b.points - a.points);
            stats.received.byPerson = Object.values(stats.received.byPerson)
                .sort((a, b) => b.points - a.points);

            // Convertir les objets byFamily en tableaux triés par nombre de points décroissant
            stats.given.byFamily = Object.entries(stats.given.byFamily)
                .map(([family, data]) => ({ family, ...data }))
                .sort((a, b) => b.points - a.points);
            stats.received.byFamily = Object.entries(stats.received.byFamily)
                .map(([family, data]) => ({ family, ...data }))
                .sort((a, b) => b.points - a.points);

            // Recalculer les totaux à partir des données par personne pour éviter les incohérences
            stats.given.total = stats.given.byPerson.reduce((sum, p) => sum + p.points, 0);
            stats.received.total = stats.received.byPerson.reduce((sum, p) => sum + p.points, 0);

            return stats;
        },
        participationSummary() {
            if (!this.data || !this.data.photosStats || !this.data.users) return null;

            // Calculer les participants par famille
            const familyStats = {
                gueudelot: { participants: new Set(), photos: 0 },
                guibert: { participants: new Set(), photos: 0 },
                guyomard: { participants: new Set(), photos: 0 }
            };

            // Parcourir les photos pour compter participants et photos par famille
            this.photos.forEach(photo => {
                const user = this.data.users[photo.userId];
                if (user && user.rootFamily) {
                    const family = user.rootFamily.toLowerCase();
                    if (familyStats[family]) {
                        familyStats[family].participants.add(photo.userId);
                        familyStats[family].photos += 1;
                    }
                }
            });

            // Convertir en tableau pour l'affichage
            const byFamily = [
                {
                    name: 'Gueudelot',
                    participants: familyStats.gueudelot.participants.size,
                    photos: familyStats.gueudelot.photos
                },
                {
                    name: 'Guibert',
                    participants: familyStats.guibert.participants.size,
                    photos: familyStats.guibert.photos
                },
                {
                    name: 'Guyomard',
                    participants: familyStats.guyomard.participants.size,
                    photos: familyStats.guyomard.photos
                }
            ];

            // Calculer les photos par catégorie (en excluant la ligne "Total" qui a catId = 0)
            const byCategory = this.data.photosStats
                .filter(stat => stat.catId !== 0)
                .map(stat => ({
                    id: stat.catId,
                    name: stat.name,
                    gueudelot: stat.totalByFamilies?.gueudelot || 0,
                    guibert: stat.totalByFamilies?.guibert || 0,
                    guyomard: stat.totalByFamilies?.guyomard || 0,
                    total: stat.total
                }));

            // Calcul des totaux
            const totalParticipants = byFamily.reduce((sum, f) => sum + f.participants, 0);
            const totalPhotos = byFamily.reduce((sum, f) => sum + f.photos, 0);

            return {
                byFamily,
                byCategory,
                totalParticipants,
                totalPhotos
            };
        },
        photosByAuthorAndCategory() {
            if (!this.photos || !this.data.categories) return [];

            // Grouper les photos par userId + categoryId
            const groups = {};

            this.photos.forEach(photo => {
                const key = `${photo.userId}-${photo.categoryId}`;

                if (!groups[key]) {
                    groups[key] = {
                        userId: photo.userId,
                        username: photo.username,
                        categoryId: photo.categoryId,
                        categoryTitle: this.data.categories[photo.categoryId]?.title || 'N/A',
                        photos: []
                    };
                }

                groups[key].photos.push(photo);
            });

            // Convertir en tableau et trier par username puis par categoryId
            return Object.values(groups).sort((a, b) => {
                const usernameCompare = a.username.localeCompare(b.username);
                if (usernameCompare !== 0) return usernameCompare;
                return a.categoryId - b.categoryId;
            });
        },
        filteredPhotosByAuthorAndCategory() {
            if (!this.photoFilter || this.photoFilter.trim() === '') {
                return this.photosByAuthorAndCategory;
            }

            const search = this.photoFilter.toLowerCase();

            return this.photosByAuthorAndCategory.filter(group => {
                // Check username
                if (group.username.toLowerCase().includes(search)) return true;

                // Check category title
                if (group.categoryTitle.toLowerCase().includes(search)) return true;

                // Check photo titles
                return group.photos.some(photo =>
                    photo.title.toLowerCase().includes(search)
                );
            });
        },
        votesSummary() {
            if (!this.votes || !this.data.users || !this.data.categories) return null;

            // Calculer les votants par famille
            const familyStats = {
                gueudelot: { voters: new Set(), votes: 0 },
                guibert: { voters: new Set(), votes: 0 },
                guyomard: { voters: new Set(), votes: 0 }
            };

            // Initialiser les catégories
            const categoryStats = {};
            this.votesCategories.forEach(catId => {
                categoryStats[catId] = {
                    id: catId,
                    name: this.data.categories[catId]?.title || 'N/A',
                    gueudelot: 0,
                    guibert: 0,
                    guyomard: 0,
                    total: 0
                };
            });

            // Parcourir les votes pour compter votants et votes par famille et catégorie
            this.votes.forEach(voter => {
                const user = this.data.users[voter.id];
                if (user && user.rootFamily) {
                    const family = user.rootFamily.toLowerCase();
                    if (familyStats[family]) {
                        familyStats[family].voters.add(voter.id);

                        // Compter les votes par catégorie
                        voter.votes.forEach((voteData, idx) => {
                            if (voteData && voteData.votes && voteData.votes.length > 0) {
                                const catId = this.votesCategories[idx];
                                const voteCount = voteData.votes.length;

                                familyStats[family].votes += voteCount;

                                if (categoryStats[catId]) {
                                    categoryStats[catId][family] += voteCount;
                                    categoryStats[catId].total += voteCount;
                                }
                            }
                        });
                    }
                }
            });

            // Convertir en tableaux pour l'affichage
            const byFamily = [
                {
                    name: 'Gueudelot',
                    voters: familyStats.gueudelot.voters.size,
                    votes: familyStats.gueudelot.votes
                },
                {
                    name: 'Guibert',
                    voters: familyStats.guibert.voters.size,
                    votes: familyStats.guibert.votes
                },
                {
                    name: 'Guyomard',
                    voters: familyStats.guyomard.voters.size,
                    votes: familyStats.guyomard.votes
                }
            ];

            const byCategory = Object.values(categoryStats);

            // Calcul des totaux
            const totalVoters = byFamily.reduce((sum, f) => sum + f.voters, 0);
            const totalVotes = byFamily.reduce((sum, f) => sum + f.votes, 0);

            return {
                byFamily,
                byCategory,
                totalVoters,
                totalVotes
            };
        }
    },
    watch: {
        $route(to, from) {
                this.refresh();
        },
        'agpaMeta': function () {
            if (!this.isLoading && !this.end) {
                this.refresh();
            }
        },
        'votesFilter.selectedUser': function(newUser) {
            this.updateVotesGraph();
        }
    },
    mounted () {
        this.isAdmin = this.user.roles.indexOf("admin") > -1;
        if (this.agpaMeta && !this.end) {
            this.refresh();
        } else {
            store.dispatch('initAGPA');
        }
    },
    methods: {
        refresh() {
            if (!this.isAdmin) {
                return;
            }

            this.isLoading = true;

            // Fin de la phase 4
            this.end = format(new Date(this.agpaMeta.boudaries[3].endDate), "dd MMM 'à' HH'h'mm", {locale: fr});

            axios.get(`/api/agpa/monitoring/${this.agpaMeta.year}`).then(response => {
                this.data = parseAxiosResponse(response);
                
                // Vérifier que les données sont valides
                if (!this.data || !this.data.categories) {
                    console.error('Invalid monitoring data received:', this.data);
                    this.isLoading = false;
                    return;
                }
                
                const categories = Object.values(this.data.categories);

                // On reformate les photos pour les présenter sous forme de tableau "users x categories"
                this.photos.splice(0);
                for (const pId of Object.keys(this.data.photos)) {
                  this.photos.push(this.data.photos[pId]);
                }
                this.photos.sort((a,b) => {
                  const uCompare = a.userId - b.userId;
                  return uCompare === 0 ? a.categoryId - b.categoryId : uCompare;
                })
                store.commit('photosGalleryReset', this.photos);

                // On reformate les votes pour les présenter sous forme de tableau "users x catégories"
                const votes = {};
                this.votesCategories = [...this.data.categoriesOrders, -3];
                for (const catIdx in this.data.categories) {
                    const cat = this.data.categories[catIdx];
                    if (cat.id !== -3 && cat.id < 0) continue;

                    for (const userIdx in cat.votes) {
                        const user = cat.votes[userIdx];
                        if (!votes[user.userId]) {
                            votes[user.userId] = {
                                id: user.userId,
                                username: user.username,
                                age: user.age,
                                photos: Array(this.votesCategories.length),
                                votes: Array(this.votesCategories.length).fill(null, 0, this.votesCategories.length)
                            };
                        }
                        user.categoryId = cat.id;
                        user.categoryTitle = cat.title;
                        user.maxVote = cat.maxVotePhoto;
                        votes[user.userId].votes[this.votesCategories.findIndex(id => id === cat.id)] = user;
                    }
                }
                this.votes = votes;

                // On reformate les notes
                this.notesCategories = this.notesCategories.concat(categories.filter(c => c.id === -3 || c.id > 0).map(e => ({ label: e.title, id: e.id })));
                this.notesAll = this.data.photosOrder.map(id => {
                    const res = this.data.photos[id];
                    return {
                        ... res,
                        quicksearch: `${res.username} ${res.title}`.toLowerCase()
                    }
                });
                this.updateNotesList();

                // On reformate le palmares par catégories
                this.palmares = Object.values(this.data.users).map( u => ({
                    ...u,
                    ...getPeopleAvatar(u),
                    average: Math.round(u.average),
                    rewards: this.reformatAward(u.awards)
                })).sort((a, b) => this.data.usersOrder.findIndex(e => e === a.id) - this.data.usersOrder.findIndex(e => e === b.id));

                const pData = this.data.photosStats.filter(c => c.catId === 0)[0];
                const pCats = this.data.photosStats.filter(c => c.catId !== 0);
                this.participationGraph = {
                    title: null,
                    subtitle: null,
                    chart: {
                        type: 'pie',
                        height: 300,
                        width: 300
                    },
                    plotOptions: {
                        pie: {
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false
                            }
                        }
                    },
                    accessibility: {
                        announceNewData: {
                            enabled: true
                        },
                    },
                    series: [
                      {
                          name: "Famille",
                          colorByPoint: true,
                          data: [
                              {
                                  name: "Gueudelot",
                                  y: pData.totalByFamilies.gueudelot,
                                  drilldown: "Gueudelot"
                              },
                              {
                                  name: "Guibert",
                                  y: pData.totalByFamilies.guibert,
                                  drilldown: "Guibert"
                              },
                              {
                                  name: "Guyomard",
                                  y: pData.totalByFamilies.guyomard,
                                  drilldown: "Guyomard"
                              }
                          ]
                      }
                  ],

                  drilldown: {
                    series: [
                        {
                            name: "Gueudelot",
                            id: "Gueudelot",
                            data: pCats.map(c => ([
                              c.name,
                              c.totalByFamilies.gueudelot
                            ]))
                        },
                        {
                            name: "Guibert",
                            id: "Guibert",
                            data: pCats.map(c => ([
                              c.name,
                              c.totalByFamilies.guibert
                            ]))
                        },
                        {
                            name: "Guyomard",
                            id: "Guyomard",
                            data: pCats.map(c => ([
                              c.name,
                              c.totalByFamilies.guyomard
                            ]))
                        }
                    ]
                  },


                    tooltip: {
                        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y} photos</b><br/>'
                    },
                };

                // Sauvegarder une copie complète des stats de votes
                this.data.votesStatsAll = [...this.data.votesStats];

                // Créer le graphique de votes
                this.updateVotesGraph();

                console.log(this.data)
                this.isLoading = false;
            }).catch( err => {
                store.commit("onError", err);
                this.isLoading = false;
            });
        },

        photosGalleryDisplay(photo) {
            const index = this.photos.filter(p => p.id > -1).findIndex(p => p.id === photo.id);
            if (index > -1) {
                store.commit('photosGallerySetIndex', index);
                store.commit('photosGalleryDisplay');
            }
        },

        reformatAward(awards) {
            const rewards = {
                diamond: 0,
                gold: 0,
                sylver: 0,
                bronze: 0,
                nominated: 0,
                honor: 0
            };
            if (Array.isArray(awards)) {
                awards.forEach(a => {
                    switch(a.award) {
                        case "diamond":
                            rewards.diamond += 1;
                            break;
                        case "gold":
                            rewards.gold += 1;
                            break;
                        case "sylver":
                            rewards.sylver += 1;
                            break;
                        case "bronze":
                            rewards.bronze += 1;
                            break;
                        case "nominated":
                            rewards.nominated += 1;
                            break;
                        case "honor":
                            rewards.honor += 1;
                            break;
                    }
                });
            }
            return rewards;
        },

        displayPhotoDetails(photo)  {
          // Safety check: ensure data is loaded
          if (!this.data || !this.data.categories) {
            console.warn('Cannot display photo details: data not loaded yet');
            return;
          }

          this.photoDetails.photo = photo;
          // On récupère les votes de la photo
          this.photoDetails.votes.splice(0);

          // Check if category and votes exist
          const category = this.data.categories?.[photo.categoryId];
          if (category && Array.isArray(category.votes)) {
            for (const u of category.votes) {
              if (u.votes && Array.isArray(u.votes)) {
                this.photoDetails.votes.push(...u.votes.filter(v => v.photoId === photo.id))
              }
            }
          }

          this.photoDetails.displayed = true;
        },

        displayPhotoEdition(photo) {
          this.photoEdition.photo = photo;
          this.photoEdition.title = photo.title || '';
          this.photoEdition.categoryId = photo.categoryId;
          this.photoEdition.rotation = 0;
          this.photoEdition.isLoading = false;
          this.photoEdition.progress = 0;
          this.photoEdition.displayed = true;
        },

        rotatePhoto(degrees) {
          this.photoEdition.rotation = (this.photoEdition.rotation + degrees) % 360;
        },

        cancelPhotoEdition() {
          this.photoEdition.displayed = false;
          this.photoEdition.photo = null;
        },

        async deletePhotoFromEdition() {
          if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
            return;
          }

          try {
            await axios.delete(`/api/agpa/photo/${this.photoEdition.photo.id}`);
            this.photoEdition.displayed = false;
            this.photoEdition.photo = null;
            this.refresh();
          } catch (err) {
            store.commit("onError", err);
          }
        },

        async savePhotoEdition() {
          this.photoEdition.isLoading = true;
          this.photoEdition.progress = 0;

          try {
            const formData = new FormData();
            formData.append('id', this.photoEdition.photo.id);
            formData.append('catId', this.photoEdition.categoryId);
            formData.append('title', this.photoEdition.title);
            formData.append('rotation', this.photoEdition.rotation);

            await axios.post('/api/agpa/photo', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              },
              onUploadProgress: progressEvent => {
                this.photoEdition.progress = (progressEvent.loaded / progressEvent.total * 100) || 0;
              }
            });

            this.photoEdition.displayed = false;
            this.photoEdition.photo = null;
            this.refresh();
          } catch (err) {
            store.commit("onError", err);
          } finally {
            this.photoEdition.isLoading = false;
          }
        },

        displayVotesDetails(data) {
            this.voteDetails.vote = data;
            this.voteDetails.displayed = true;
        },

        updateNotesList(catId) {
            if (catId > -1) {
                this.notes = this.notesAll.filter(e => e.categoryId === catId);
            } else if (catId === -3) {
                this.notes = this.notesAll.filter(e => e.votesTitle > 0);
            } else {
                this.notes = this.notesAll;
            }
        },

        notesSearchMethod(items, search) {
            console.log("search", items, search)
            if (!search) {
                return items;
            }
            if (!items) {
                return [];
            }
            return items.filter(e => e != null && e.quicksearch.indexOf(search.toLowerCase()) > -1);
        },

        getFamilyColors() {
            return {
                'gueudelot': '#7cb5ec',  // Bleu
                'guibert': '#434348',    // Gris foncé
                'guyomard': '#90ed7d',   // Vert
                'autre': '#f7a35c'       // Orange
            };
        },

        getUserColor(username) {
            const user = Object.values(this.data.users).find(u => u.username === username);
            if (!user) return '#f7a35c'; // Orange par défaut

            const family = user.rootFamily || 'autre';
            const familyColors = this.getFamilyColors();
            return familyColors[family] || familyColors['autre'];
        },

        updateVotesGraph() {
            if (!this.data.votesStatsAll) return;

            // Filtrer les données si un utilisateur est sélectionné
            let votesData = this.data.votesStatsAll;
            if (this.votesFilter.selectedUser) {
                const username = this.votesFilter.selectedUser;
                votesData = this.data.votesStatsAll.filter(vote => {
                    const [from, to] = vote;
                    return from === username || to === username;
                });
            }

            // Définir les couleurs par famille (correspondant au graphique de participation)
            // Utiliser les couleurs exactes de Highcharts par défaut
            const familyColors = this.getFamilyColors();

            // Créer une map de couleurs pour chaque nœud (personne)
            const nodeColors = [];
            if (this.votesFilter.selectedUser) {
                // Récupérer tous les noms uniques du graphique filtré
                const uniqueNames = new Set();
                votesData.forEach(vote => {
                    const [from, to] = vote;
                    uniqueNames.add(from);
                    uniqueNames.add(to);
                });

                // Assigner les couleurs en fonction de la famille
                uniqueNames.forEach(username => {
                    const user = Object.values(this.data.users).find(u => u.username === username);
                    if (user) {
                        const family = user.rootFamily || 'autre';
                        const color = username === this.votesFilter.selectedUser
                            ? '#f15c80'  // Rouge pour la personne sélectionnée
                            : familyColors[family] || familyColors['autre'];

                        nodeColors.push({
                            id: username,
                            color: color
                        });
                    }
                });
            }

            // Créer ou mettre à jour le graphique
            this.votesGraph = {
                title: null,
                exporting: {
                    buttons: {
                        contextButton: {
                            menuItems: ['downloadPNG', 'downloadJPEG', 'downloadPDF']
                        }
                    }
                },

                accessibility: {
                    point: {
                        valueDescriptionFormat: '{index}. From {point.from} to {point.to}: {point.weight}.'
                    }
                },

                series: [{
                    keys: ['from', 'to', 'weight'],
                    data: votesData,
                    type: 'dependencywheel',
                    nodes: nodeColors.length > 0 ? nodeColors : undefined,
                    dataLabels: {
                        color: '#333',
                        textPath: {
                            enabled: true,
                            attributes: {
                                dy: 5
                            }
                        },
                        distance: 15
                    },
                    size: '95%'
                }]
            };
        },

        closeEdition() {
            axios.get(`/api/agpa/close-edition`);
        }

    }
};
</script>


<style lang="scss" scoped>
@use '../../themes/global.scss' as *;
@use '../../themes/agpa.scss' as *;

#content {
    text-align: center;
}

h2, .h2 {
    text-align: left;
    margin: 10px;
    font-weight: normal;
    opacity: 0.5;
}
.h2 {
    display: inline-block;
}

.phase-left-header {
    margin: -5px 0 -10px 0;
    cursor: pointer;

    h2 {
        font-size: 20px;
        line-height: 20px;
        text-align: left;
    }
    p {
        text-align: left;
        font-size: 15px;
        line-height: 20px;
        opacity: 0.5;
        margin: 0;
    }
}
.phase-right-header {
    margin: -5px 0 -10px 0;
    opacity: 0.5;
    cursor: pointer;

    h2 {
        font-size: 20px;
        line-height: 20px;
        text-align: right;
    }
    p {
        text-align: right;
        font-size: 15px;
        line-height: 20px;
        margin: 0;
    }
}
.p4 {
    p {
        width: 500px;
        margin: auto;
        margin-top: 30px;
        text-align: justify;
    }
    a, .endDate {
        font-weight: bold;
        text-decoration: none;
        color: #26a69a;
    }
}

.thumb {
    background: white;
    padding: 1px;
    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
    cursor: pointer;
}
</style>
