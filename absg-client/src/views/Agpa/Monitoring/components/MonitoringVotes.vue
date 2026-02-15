<template>
  <div class="monitoring-votes pa-4">
    <h2>Vérification des votes</h2>

    <!-- Résumé des votes -->
    <v-card v-if="votesSummary" class="mb-4" elevation="2">
      <v-card-text>
        <h3 class="mb-3 monitoring-section-title">Résumé des votes</h3>

        <v-row dense>
          <!-- Votants par famille -->
          <v-col cols="12" md="6">
            <div class="font-weight-bold mb-2 monitoring-subtitle">Votants par famille</div>
            <v-table density="compact" class="monitoring-compact-table">
              <thead>
                <tr>
                  <th class="text-left">Famille</th>
                  <th class="text-center">Votants</th>
                  <th class="text-center">Votes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="family in votesSummary.byFamily" :key="family.name">
                  <td class="text-left">{{ family.name }}</td>
                  <td class="text-center font-weight-medium">{{ family.voters }}</td>
                  <td class="text-center">{{ family.votes }}</td>
                </tr>
                <tr class="monitoring-total-row">
                  <td class="text-left">Total</td>
                  <td class="text-center">{{ votesSummary.totalVoters }}</td>
                  <td class="text-center">{{ votesSummary.totalVotes }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-col>

          <!-- Votes par catégorie -->
          <v-col cols="12" md="6">
            <div class="font-weight-bold mb-2 monitoring-subtitle">Votes par catégorie</div>
            <v-table density="compact" class="monitoring-compact-table">
              <thead>
                <tr>
                  <th class="text-left">Catégorie</th>
                  <th class="text-center" title="Famille Gueudelot">Gd</th>
                  <th class="text-center" title="Famille Guibert">Gb</th>
                  <th class="text-center" title="Famille Guyomard">Gy</th>
                  <th class="text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cat in votesSummary.byCategory" :key="cat.id">
                  <td class="text-left">{{ cat.name }}</td>
                  <td class="text-center">{{ cat.gueudelot || '-' }}</td>
                  <td class="text-center">{{ cat.guibert || '-' }}</td>
                  <td class="text-center">{{ cat.guyomard || '-' }}</td>
                  <td class="text-center font-weight-medium">{{ cat.total }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tableau des votes par juré -->
    <v-table class="text-left monitoring-votes-table">
      <template #default>
        <thead>
          <tr class="monitoring-header-row">
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
              <span class="monitoring-muted">- {{ voter.age }} ans</span>
            </td>
            <td
              v-for="(cat, idx) of voter.votes"
              :key="idx"
            >
              <a
                v-if="cat"
                class="d-block monitoring-clickable"
                @click="showVoteDetails(cat)"
              >
                <i
                  v-if="cat.valid"
                  class="fas fa-check text-success"
                />
                <i
                  v-else
                  class="fas fa-exclamation-triangle text-warning"
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
          <p class="monitoring-muted">
            Le tableau de gauche montre tous les votes du juré pour la catégorie concernée.
            Les informations à droite permettent de contrôler la validité de ces votes.
          </p>
          <div class="monitoring-dialog-layout">
            <div class="monitoring-dialog-col">
              <v-table density="compact" class="monitoring-votes-table">
                <thead>
                  <tr>
                    <th class="text-left">Photo</th>
                    <th class="text-center">Vote</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="vote of selectedVote.votes" :key="vote.id">
                    <td class="text-left">
                      {{ vote.photoId }} - {{ vote.title }}<br>
                      <span class="monitoring-muted monitoring-compact-text">
                        uId: {{ vote.pUserId }} | catId: {{ vote.pCategoryId }}
                      </span>
                    </td>
                    <td class="text-center">
                      <i v-if="selectedVote.categoryId === -3" class="fas fa-feather-alt" />
                      <template v-else>
                        <i class="fas fa-star" /> {{ vote.score }}
                      </template>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
            <div class="monitoring-dialog-col">
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
                  {{ key }}: <span :class="val ? 'text-error' : 'text-success'">{{ val }}</span>
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

<style lang="scss" scoped>
.monitoring-section-title {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.monitoring-subtitle {
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.monitoring-compact-table {
  font-size: 0.85em;
}

.monitoring-total-row {
  border-top: 2px solid rgba(var(--v-theme-on-surface), 0.2);
  font-weight: bold;
}

.monitoring-votes-table {
  font-size: 0.8em;
}

.monitoring-header-row {
  vertical-align: baseline;
}

.monitoring-muted {
  opacity: 0.5;
}

.monitoring-compact-text {
  font-size: 0.85em;
}

.monitoring-clickable {
  cursor: pointer;
}

.monitoring-dialog-layout {
  display: flex;
  gap: 20px;
}

.monitoring-dialog-col {
  flex: 1;
}
</style>
