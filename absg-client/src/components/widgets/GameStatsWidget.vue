<template>
  <v-card class="widget-card">
    <v-card-title class="widget-title">
      <v-icon start color="accent">fas fa-gamepad</v-icon>
      <span class="title-text">Mes Jeux</span>
    </v-card-title>

    <v-card-text class="widget-content">
      <!-- Classement familial -->
      <div v-if="stats" class="ranking-section">
        <div class="section-title">Classement</div>
        <div class="ranking-list">
          <div
            v-for="player in stats.ranking.slice(0, 5)"
            :key="player.userId"
            class="ranking-item"
            :class="{ 'is-current-user': player.userId === currentUserId }"
          >
            <span class="rank-badge" :class="getRankClass(player.rank)">
              {{ player.rank }}
            </span>
            <span class="player-name">{{ player.username }}</span>
            <v-chip
              size="x-small"
              :color="getFamilyColor(player.rootFamily)"
              variant="tonal"
            >
              {{ player.rootFamily.charAt(0) }}
            </v-chip>
            <div class="player-scores">
              <span class="mini-score" title="Sudokus">
                <v-icon size="x-small" color="primary">fas fa-th</v-icon>
                {{ player.sudokuCount }}
              </span>
              <span class="mini-score" title="Mots mystères">
                <v-icon size="x-small" color="accent">fas fa-question-circle</v-icon>
                {{ player.wikiMysteryCount }}
              </span>
            </div>
          </div>
        </div>

        <!-- Message si pas de classement -->
        <div v-if="stats.ranking.length === 0" class="no-ranking">
          Complétez un jeu pour apparaître au classement !
        </div>
      </div>

      <!-- Jeux externes -->
      <div class="external-games-section">
        <div class="section-title">Autres jeux</div>
        <div class="external-games-grid">
          <a
            v-for="game in externalGames"
            :key="game.name"
            :href="game.url"
            target="_blank"
            rel="noopener noreferrer"
            class="external-game-link"
          >
            <v-icon :color="game.color" size="small">{{ game.icon }}</v-icon>
            <span>{{ game.name }}</span>
          </a>
        </div>
      </div>
    </v-card-text>

    <!-- État de chargement -->
    <v-card-text v-if="loading" class="loading-state">
      <v-progress-circular indeterminate color="accent" size="32" />
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";
import { parseAxiosResponse } from "../../middleware/CommonHelper";

export default {
  name: "GameStatsWidget",
  props: {
    currentUserId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      stats: null,
      loading: true,
      externalGames: [
        {
          name: "Cemantix",
          url: "https://cemantix.certideal.com/",
          icon: "fas fa-brain",
          color: "purple"
        },
        {
          name: "Tusmo",
          url: "https://www.tusmo.xyz/",
          icon: "fas fa-spell-check",
          color: "green"
        },
        {
          name: "Wordle",
          url: "https://www.nytimes.com/games/wordle/index.html",
          icon: "fas fa-square",
          color: "teal"
        },
        {
          name: "GeoGuessr",
          url: "https://www.geoguessr.com/",
          icon: "fas fa-globe-europe",
          color: "blue"
        }
      ]
    };
  },
  mounted() {
    this.loadStats();
  },
  methods: {
    async loadStats() {
      this.loading = true;
      try {
        const response = await axios.get("/api/daily-games/stats");
        const data = parseAxiosResponse(response);
        if (data) {
          this.stats = data;
        }
      } catch (error) {
        console.error("Error loading game stats:", error);
      } finally {
        this.loading = false;
      }
    },
    getRankClass(rank) {
      if (rank === 1) return "gold";
      if (rank === 2) return "silver";
      if (rank === 3) return "bronze";
      return "";
    },
    getFamilyColor(family) {
      const colors = {
        "Gueudelot": "group1",
        "Guibert": "group2",
        "Guyomard": "group3"
      };
      return colors[family] || "grey";
    },
    refresh() {
      this.loadStats();
    }
  }
};
</script>

<style lang="scss" scoped>
.widget-card {
  height: 100%;
}

.widget-title {
  font-family: "Comfortaa", sans-serif;
  font-size: 1.1em;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
}

.title-text {
  flex-shrink: 0;
}

.widget-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 16px;
}

.section-title {
  font-size: 0.8em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.6;
  margin-bottom: 8px;
}

.ranking-section {
  .no-ranking {
    text-align: center;
    font-size: 0.85em;
    opacity: 0.6;
    padding: 12px;
  }

  .ranking-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .ranking-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;

    &.is-current-user {
      background: rgba(var(--v-theme-accent), 0.1);
    }
  }

  .rank-badge {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 0.75em;
    font-weight: bold;
    background: rgba(0, 0, 0, 0.1);

    &.gold {
      background: #ffd700;
      color: #333;
    }

    &.silver {
      background: #c0c0c0;
      color: #333;
    }

    &.bronze {
      background: #cd7f32;
      color: #fff;
    }
  }

  .player-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .player-scores {
    display: flex;
    gap: 8px;
  }

  .mini-score {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 0.8em;
    font-weight: 600;
  }
}

.external-games-section {
  .external-games-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .external-game-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: rgba(var(--v-theme-surface-variant), 0.5);
    border-radius: 16px;
    text-decoration: none;
    color: inherit;
    font-size: 0.85em;
    transition: background-color 0.2s, transform 0.1s;

    &:hover {
      background: rgba(var(--v-theme-accent), 0.15);
      transform: translateY(-1px);
    }
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px;
}
</style>
