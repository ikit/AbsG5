<template>
  <div class="monitoring-palmares pa-4">
    <h2>Établissement du palmarès</h2>

    <v-data-table
      :headers="headers"
      :items="palmares"
      :search="searchFilter"
      :loading="!data"
      loading-text="Chargement des données..."
      no-data-text="Aucun palmarès disponible."
      density="compact"
    >
      <template #[`item.photographe`]="{ item }">
        <div class="d-flex align-center">
          <img
            v-if="item.url"
            :src="item.url"
            class="monitoring-pal__avatar"
          >
          <span class="monitoring-pal__username">{{ item.username }}</span>
          <v-chip v-if="item.rootFamily" size="x-small" :color="getFamilyColor(item.rootFamily)" class="ml-2">
            {{ item.rootFamily?.substring(0, 2).toUpperCase() }}
          </v-chip>
        </div>
      </template>

      <template #[`item.awards`]="{ item }">
        <div class="d-flex ga-1 align-center">
          <template v-if="item.rewards.diamond">
            <v-icon color="cyan-lighten-2" size="small">fas fa-circle</v-icon>
            <span class="mr-2">{{ item.rewards.diamond }}</span>
          </template>
          <template v-if="item.rewards.gold">
            <v-icon color="amber-darken-2" size="small">fas fa-circle</v-icon>
            <span class="mr-2">{{ item.rewards.gold }}</span>
          </template>
          <template v-if="item.rewards.sylver">
            <v-icon color="grey" size="small">fas fa-circle</v-icon>
            <span class="mr-2">{{ item.rewards.sylver }}</span>
          </template>
          <template v-if="item.rewards.bronze">
            <v-icon color="brown" size="small">fas fa-circle</v-icon>
            <span class="mr-2">{{ item.rewards.bronze }}</span>
          </template>
          <template v-if="item.rewards.nominated">
            <v-icon color="grey" size="small">far fa-circle</v-icon>
            <span class="mr-2">{{ item.rewards.nominated }}</span>
          </template>
          <template v-if="item.rewards.honor">
            <v-icon color="grey" size="small">far fa-smile</v-icon>
            <span>{{ item.rewards.honor }}</span>
          </template>
        </div>
      </template>

      <template #[`item.scoreOf8`]="{ item }">
        <strong>{{ item.scoreOf8?.toFixed(0) }}</strong> pts
      </template>

      <template #[`item.average`]="{ item }">
        {{ item.average?.toFixed(1) }} pts
      </template>

      <template #[`item.lower`]="{ item }">
        {{ item.lower?.toFixed(0) }} pts
      </template>

      <template #[`item.score`]="{ item }">
        <strong>{{ item.palmares }}</strong> pts
      </template>

      <template #[`item.formerPalmares`]="{ item }">
        {{ item.formerPalmares }} pts
      </template>

      <template #[`item.newPalmares`]="{ item }">
        <strong>{{ item.formerPalmares + item.palmares }}</strong> pts
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { getPeopleAvatar } from '../../../../middleware/CommonHelper';

export default {
  props: {
    data: {
      type: Object,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    algorithm: {
      type: String,
      default: 'V2026'
    }
  },
  data: () => ({
    searchFilter: '',
    headers: [
      { title: 'Photographe', key: 'photographe' },
      { title: 'Récompenses', key: 'awards', sortable: false },
      { title: '8 meilleures', key: 'scoreOf8' },
      { title: 'Moyenne', key: 'average' },
      { title: 'Plus basse', key: 'lower' },
      { title: 'Édition', key: 'score' },
      { title: 'Ancien', key: 'formerPalmares' },
      { title: 'Nouveau', key: 'newPalmares' }
    ]
  }),
  computed: {
    palmares() {
      if (!this.data || !this.data.users || !this.data.usersOrder) return [];

      return this.data.usersOrder.map(userId => {
        const user = this.data.users[userId];
        if (!user) return null;

        // Compter les récompenses
        const rewards = { diamond: 0, gold: 0, sylver: 0, bronze: 0, nominated: 0, honor: 0 };
        if (user.awards) {
          user.awards.forEach(a => {
            if (rewards[a.award] !== undefined) {
              rewards[a.award]++;
            }
          });
        }
        // Ajouter l'award principal si présent
        if (user.award && rewards[user.award] !== undefined) {
          rewards[user.award]++;
        }

        return {
          id: userId,
          username: user.username,
          rootFamily: user.rootFamily,
          url: getPeopleAvatar(user),
          rewards,
          scoreOf8: user.scoreOf8 || 0,
          scoreOf4: user.scoreOf4 || 0,
          average: user.average || 0,
          lower: user.lower || 0,
          palmares: user.palmares || 0,
          formerPalmares: user.formerPalmares || 0
        };
      }).filter(Boolean);
    }
  },
  methods: {
    getFamilyColor(family) {
      const colors = {
        gueudelot: 'blue-lighten-4',
        guibert: 'grey-lighten-1',
        guyomard: 'green-lighten-4'
      };
      return colors[(family || '').toLowerCase()] || 'grey-lighten-3';
    }
  }
};
</script>

<style lang="scss" scoped>
.monitoring-pal__avatar {
  height: 40px;
  margin-right: 15px;
  border-radius: 50%;
}
.monitoring-pal__username {
  font-size: 1.1em;
}
</style>
