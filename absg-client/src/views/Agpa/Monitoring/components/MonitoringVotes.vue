<template>
  <div class="monitoring-votes pa-4">
    <h2>Vérification des votes</h2>

    <!-- Résumé des votes -->
    <v-card v-if="votesSummary" class="mb-4" elevation="2">
      <v-card-text>
        <h3 class="mb-3" style="color: #666;">Résumé des votes</h3>

        <v-row dense>
          <!-- Votants par famille -->
          <v-col cols="12" md="6">
            <div class="font-weight-bold mb-2" style="color: #555;">Votants par famille</div>
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
            <div class="font-weight-bold mb-2" style="color: #555;">Votes par catégorie</div>
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
      </v-card-text>
    </v-card>

    <!-- Tableau des votes par juré -->
    <v-table style="text-align: left; font-size: 0.8em;">
      <template #default>
        <thead>
          <tr style="vertical-align: baseline;">
            <th>Juré</th>
            <th
              v-for="catId of votesCategories"
              :key="catId"
            >
              {{ data.categories[catId]?.title || catId }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="voter of formattedVotes"
            :key="voter.id"
          >
            <td>
              {{ voter.username }}
              <span style="opacity: 0.5">- {{ voter.age }} ans</span>
            </td>
            <td
              v-for="(cat, idx) of voter.votes"
              :key="idx"
            >
              <a
                v-if="cat"
                style="display: block; cursor: pointer;"
                @click="showVoteDetails(cat)"
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

    <!-- Dialog détails du vote -->
    <v-dialog v-model="voteDetailsDialog" width="800px">
      <v-card v-if="selectedVote">
        <v-card-title class="bg-grey-lighten-4">
          Votes {{ selectedVote.username }}, catégorie {{ selectedVote.categoryTitle }}
        </v-card-title>
        <v-card-text>
          <p style="opacity: 0.5;">
            Le tableau de gauche montre tous les votes du juré pour la catégorie concernée.
            Les informations à droite permettent de contrôler la validité de ces votes.
          </p>
          <div style="display: flex; gap: 20px;">
            <div style="flex: 1;">
              <v-table density="compact" style="font-size: 0.8em;">
                <thead>
                  <tr>
                    <th style="text-align: left;">Photo</th>
                    <th style="text-align: center;">Vote</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="vote of selectedVote.votes" :key="vote.id">
                    <td style="text-align: left;">
                      {{ vote.photoId }} - {{ vote.title }}<br>
                      <span style="opacity: 0.5; font-size: 0.85em;">
                        uId: {{ vote.pUserId }} | catId: {{ vote.pCategoryId }}
                      </span>
                    </td>
                    <td style="text-align: center;">
                      <i v-if="selectedVote.categoryId === -3" class="fas fa-feather-alt" />
                      <template v-else>
                        <i class="fas fa-star" /> {{ vote.score }}
                      </template>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
            <div style="flex: 1;">
              <b>Catégorie:</b>
              <ul>
                <li>Titre: {{ selectedVote.categoryTitle }}</li>
                <li>Id: {{ selectedVote.categoryId }}</li>
                <li>Max votes: {{ selectedVote.maxVote }}</li>
              </ul>

              <b>Juré:</b>
              <ul>
                <li>Nom: {{ selectedVote.username }}</li>
                <li>Id: {{ selectedVote.userId }}</li>
                <li>Age: {{ selectedVote.age }}</li>
              </ul>

              <b>Erreurs détectées:</b>
              <ul v-if="selectedVote.errors">
                <li v-for="(val, key) in selectedVote.errors" :key="key">
                  {{ key }}: <span :style="{ color: val ? 'red' : 'green' }">{{ val }}</span>
                </li>
              </ul>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" color="primary" @click="voteDetailsDialog = false">
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  },
  data: () => ({
    voteDetailsDialog: false,
    selectedVote: null
  }),
  computed: {
    votesCategories() {
      if (!this.data || !this.data.categoriesOrders) return [];
      // Inclure les catégories normales + meilleur titre (-3)
      return [...this.data.categoriesOrders, -3];
    },
    formattedVotes() {
      if (!this.data || !this.data.users || !this.data.categories) return [];

      // Transformer les données de votes pour l'affichage
      const voters = [];
      for (const userId in this.data.users) {
        const user = this.data.users[userId];
        if (!user.votesDetails) continue;

        const voterData = {
          id: userId,
          username: user.username,
          age: user.age,
          votes: []
        };

        // Pour chaque catégorie
        for (const catId of this.votesCategories) {
          const catVotes = user.votesDetails?.[catId];
          if (catVotes) {
            voterData.votes.push({
              categoryId: catId,
              categoryTitle: this.data.categories[catId]?.title || `Cat ${catId}`,
              votes: catVotes.votes || [],
              valid: catVotes.valid !== false,
              errors: catVotes.errors || {},
              maxVote: catVotes.maxVote || 0,
              userId: userId,
              username: user.username,
              age: user.age
            });
          } else {
            voterData.votes.push(null);
          }
        }

        voters.push(voterData);
      }

      return voters.sort((a, b) => a.username.localeCompare(b.username));
    },
    votesSummary() {
      if (!this.formattedVotes || !this.data.users || !this.data.categories) return null;

      const familyStats = {
        gueudelot: { voters: new Set(), votes: 0 },
        guibert: { voters: new Set(), votes: 0 },
        guyomard: { voters: new Set(), votes: 0 }
      };

      const categoryStats = {};
      this.votesCategories.forEach(catId => {
        categoryStats[catId] = {
          id: catId,
          name: this.data.categories[catId]?.title || `Cat ${catId}`,
          gueudelot: 0,
          guibert: 0,
          guyomard: 0,
          total: 0
        };
      });

      this.formattedVotes.forEach(voter => {
        const user = this.data.users[voter.id];
        if (user && user.rootFamily) {
          const family = user.rootFamily.toLowerCase();
          if (familyStats[family]) {
            familyStats[family].voters.add(voter.id);

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

      const byFamily = [
        { name: 'Gueudelot', voters: familyStats.gueudelot.voters.size, votes: familyStats.gueudelot.votes },
        { name: 'Guibert', voters: familyStats.guibert.voters.size, votes: familyStats.guibert.votes },
        { name: 'Guyomard', voters: familyStats.guyomard.voters.size, votes: familyStats.guyomard.votes }
      ];

      return {
        byFamily,
        byCategory: Object.values(categoryStats),
        totalVoters: byFamily.reduce((sum, f) => sum + f.voters, 0),
        totalVotes: byFamily.reduce((sum, f) => sum + f.votes, 0)
      };
    }
  },
  methods: {
    showVoteDetails(vote) {
      this.selectedVote = vote;
      this.voteDetailsDialog = true;
    }
  }
};
</script>
