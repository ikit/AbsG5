<template>
  <div class="monitoring-stats pa-4">
    <h2>Statistiques</h2>

    <!-- Participation par famille et catégorie -->
    <v-row class="mb-4">
      <v-col cols="12" :md="participationGraph ? 6 : 12">
        <v-card>
          <v-card-title>Participation</v-card-title>
          <v-card-text>
            <v-table density="compact" class="monitoring-stats__compact-table">
              <thead>
                <tr>
                  <th class="text-right">Catégorie</th>
                  <th class="text-center">Gueudelot</th>
                  <th class="text-center">Guibert</th>
                  <th class="text-center">Guyomard</th>
                  <th class="text-center">Adultes | Enfants</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in photosStats" :key="row.catId">
                  <td class="text-right font-weight-bold">{{ row.name }}</td>
                  <td class="text-center">{{ row.totalByFamilies?.gueudelot || 0 }}</td>
                  <td class="text-center">{{ row.totalByFamilies?.guibert || 0 }}</td>
                  <td class="text-center">{{ row.totalByFamilies?.guyomard || 0 }}</td>
                  <td class="text-center">
                    {{ row.totalByAge?.adults || 0 }} | {{ row.totalByAge?.childdren || 0 }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="participationGraph" cols="12" md="6">
        <v-card>
          <v-card-text>
            <highcharts :options="participationGraph" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Analyse des votes -->
    <v-card class="mb-4">
      <v-card-title>Analyse des votes</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedUser"
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
          </v-col>

          <v-col v-if="selectedUser && userStats" cols="12" md="8">
            <div class="d-flex ga-6 flex-wrap">
              <div>
                <div class="text-caption text-grey">Points donnés</div>
                <div class="text-h5 text-primary font-weight-bold">{{ userStats.given.total }}</div>
              </div>
              <div>
                <div class="text-caption text-grey">Points reçus</div>
                <div class="text-h5 text-success font-weight-bold">{{ userStats.received.total }}</div>
              </div>
              <div>
                <div class="text-caption text-grey">Ratio</div>
                <div class="text-h5 text-warning font-weight-bold">
                  {{ userStats.received.total > 0 ? (userStats.given.total / userStats.received.total).toFixed(2) : '-' }}
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Détails des votes -->
        <v-row v-if="selectedUser && userStats" class="mt-4">
          <v-col cols="12" md="6">
            <v-card variant="outlined">
              <v-card-text>
                <div class="font-weight-bold mb-2 text-center monitoring-stats__section-header">
                  Points donnés
                </div>

                <!-- Par famille -->
                <div class="mb-3 pa-2 monitoring-stats__family-bg">
                  <div class="text-body-2 mb-1">Total: {{ userStats.given.total }} pts</div>
                  <div v-for="fam in userStats.given.byFamily" :key="'g-'+fam.family" class="text-caption text-grey pl-2">
                    {{ fam.family }}: {{ fam.points }} pts ({{ Math.round(fam.points / userStats.given.total * 100) || 0 }}%)
                  </div>
                </div>

                <!-- Par personne -->
                <v-table density="compact" class="monitoring-stats__v-table">
                  <thead>
                    <tr>
                      <th class="text-left">Personne</th>
                      <th class="text-right">Points (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="person in userStats.given.byPerson" :key="'gp-'+person.username">
                      <td class="text-left">{{ person.username }}</td>
                      <td class="text-right">
                        {{ person.points }} ({{ Math.round(person.points / userStats.given.total * 100) || 0 }}%)
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card variant="outlined">
              <v-card-text>
                <div class="font-weight-bold mb-2 text-center monitoring-stats__section-header">
                  Points reçus
                </div>

                <!-- Par famille -->
                <div class="mb-3 pa-2 monitoring-stats__family-bg">
                  <div class="text-body-2 mb-1">Total: {{ userStats.received.total }} pts</div>
                  <div v-for="fam in userStats.received.byFamily" :key="'r-'+fam.family" class="text-caption text-grey pl-2">
                    {{ fam.family }}: {{ fam.points }} pts ({{ Math.round(fam.points / userStats.received.total * 100) || 0 }}%)
                  </div>
                </div>

                <!-- Par personne -->
                <v-table density="compact" class="monitoring-stats__v-table">
                  <thead>
                    <tr>
                      <th class="text-left">Personne</th>
                      <th class="text-right">Points (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="person in userStats.received.byPerson" :key="'rp-'+person.username">
                      <td class="text-left">{{ person.username }}</td>
                      <td class="text-right">
                        {{ person.points }} ({{ Math.round(person.points / userStats.received.total * 100) || 0 }}%)
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { Chart } from 'highcharts-vue';

export default {
  components: {
    highcharts: Chart
  },
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
    selectedUser: null
  }),
  computed: {
    photosStats() {
      return this.data?.photosStats || [];
    },
    photographersList() {
      if (!this.data?.users) return [];

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

      Object.keys(usersByFamily).forEach(family => {
        usersByFamily[family].sort((a, b) => a.username.localeCompare(b.username));
      });

      const result = [];
      const familyOrder = ['gueudelot', 'guibert', 'guyomard', 'autre'];

      familyOrder.forEach(family => {
        if (usersByFamily[family]) {
          result.push({ header: family.charAt(0).toUpperCase() + family.slice(1) });
          result.push(...usersByFamily[family]);
        }
      });

      return result;
    },
    userStats() {
      if (!this.selectedUser || !this.data?.votesStats) return null;

      const username = this.selectedUser;
      const stats = {
        given: { total: 0, byFamily: {}, byPerson: {} },
        received: { total: 0, byFamily: {}, byPerson: {} }
      };

      this.data.votesStats.forEach(vote => {
        const [from, to, weight] = vote;

        if (from === username) {
          stats.given.total += weight;
          const toUser = Object.values(this.data.users).find(u => u.username === to);
          if (toUser) {
            const family = toUser.rootFamily || 'Autre';
            if (!stats.given.byFamily[family]) {
              stats.given.byFamily[family] = { points: 0 };
            }
            stats.given.byFamily[family].points += weight;

            if (!stats.given.byPerson[to]) {
              stats.given.byPerson[to] = { username: to, points: 0 };
            }
            stats.given.byPerson[to].points += weight;
          }
        }

        if (to === username) {
          stats.received.total += weight;
          const fromUser = Object.values(this.data.users).find(u => u.username === from);
          if (fromUser) {
            const family = fromUser.rootFamily || 'Autre';
            if (!stats.received.byFamily[family]) {
              stats.received.byFamily[family] = { points: 0 };
            }
            stats.received.byFamily[family].points += weight;

            if (!stats.received.byPerson[from]) {
              stats.received.byPerson[from] = { username: from, points: 0 };
            }
            stats.received.byPerson[from].points += weight;
          }
        }
      });

      stats.given.byPerson = Object.values(stats.given.byPerson).sort((a, b) => b.points - a.points);
      stats.received.byPerson = Object.values(stats.received.byPerson).sort((a, b) => b.points - a.points);
      stats.given.byFamily = Object.entries(stats.given.byFamily)
        .map(([family, d]) => ({ family, ...d }))
        .sort((a, b) => b.points - a.points);
      stats.received.byFamily = Object.entries(stats.received.byFamily)
        .map(([family, d]) => ({ family, ...d }))
        .sort((a, b) => b.points - a.points);

      return stats;
    },
    participationGraph() {
      if (!this.photosStats || this.photosStats.length === 0) return null;

      const categories = this.photosStats
        .filter(s => s.catId !== 0)
        .map(s => s.name);

      const gueudelotData = this.photosStats
        .filter(s => s.catId !== 0)
        .map(s => s.totalByFamilies?.gueudelot || 0);
      const guibertData = this.photosStats
        .filter(s => s.catId !== 0)
        .map(s => s.totalByFamilies?.guibert || 0);
      const guyomardData = this.photosStats
        .filter(s => s.catId !== 0)
        .map(s => s.totalByFamilies?.guyomard || 0);

      return {
        chart: { type: 'bar', height: 300 },
        title: { text: null },
        xAxis: { categories },
        yAxis: { title: { text: 'Photos' } },
        legend: { reversed: true },
        plotOptions: { series: { stacking: 'normal' } },
        series: [
          { name: 'Guyomard', data: guyomardData, color: '#90ed7d' },
          { name: 'Guibert', data: guibertData, color: '#434348' },
          { name: 'Gueudelot', data: gueudelotData, color: '#7cb5ec' }
        ]
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.monitoring-stats__section-header {
  background: rgba(var(--v-theme-on-surface), 0.05);
  padding: 4px;
}

.monitoring-stats__family-bg {
  background: rgba(var(--v-theme-on-surface), 0.03);
}

.monitoring-stats__v-table {
  font-size: 0.8em;
}

.monitoring-stats__compact-table {
  font-size: 0.85em;
}
</style>
