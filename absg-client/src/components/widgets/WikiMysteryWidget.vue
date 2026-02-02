<template>
  <v-card class="widget-card">
    <v-card-title class="widget-title">
      <v-icon start color="accent">fas fa-question-circle</v-icon>
      <span class="title-text">Mot mystère</span>
      <v-spacer />
      <v-chip
        v-if="game"
        :color="getCategoryColor(game.category)"
        size="small"
        variant="tonal"
      >
        {{ game.category }}
      </v-chip>
      <v-btn
        v-if="game"
        icon
        size="x-small"
        variant="text"
        color="accent"
        class="ml-2"
        @click="renewGame"
      >
        <v-icon size="small">fas fa-sync-alt</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text v-if="game" class="game-container">
      <!-- Texte masqué -->
      <div class="masked-text">
        {{ game.maskedText }}
      </div>

      <!-- État: Gagné -->
      <div v-if="gameState === 'won'" class="result-state won">
        <v-icon color="success" size="32">fas fa-trophy</v-icon>
        <p class="result-text">Bravo ! C'était bien <strong>{{ game.answer }}</strong></p>
        <v-btn
          size="small"
          variant="text"
          color="primary"
          :href="game.url"
          target="_blank"
        >
          <v-icon start size="small">fas fa-external-link-alt</v-icon>
          Lire l'article
        </v-btn>
      </div>

      <!-- État: Perdu -->
      <div v-else-if="gameState === 'lost'" class="result-state lost">
        <v-icon color="error" size="32">fas fa-times-circle</v-icon>
        <p class="result-text">La réponse était <strong>{{ game.answer }}</strong></p>
        <v-btn
          size="small"
          variant="text"
          color="primary"
          :href="game.url"
          target="_blank"
        >
          <v-icon start size="small">fas fa-external-link-alt</v-icon>
          Lire l'article
        </v-btn>
      </div>

      <!-- État: En cours -->
      <div v-else class="game-playing">
        <!-- Indices révélés -->
        <div v-if="revealedHints.length > 0" class="hints-section">
          <div
            v-for="(hint, index) in revealedHints"
            :key="index"
            class="hint-item"
          >
            <v-icon size="x-small" color="info">fas fa-lightbulb</v-icon>
            {{ hint }}
          </div>
        </div>

        <!-- Zone de saisie -->
        <div class="input-section">
          <v-text-field
            v-model="currentGuess"
            label="Votre réponse"
            variant="outlined"
            density="compact"
            hide-details
            @keyup.enter="submitGuess"
          />
          <v-btn
            color="accent"
            size="small"
            :disabled="!currentGuess.trim()"
            @click="submitGuess"
          >
            Valider
          </v-btn>
        </div>

        <!-- Compteur d'essais -->
        <div class="attempts-info">
          <span>Essais : {{ attempts }}/6</span>
          <v-btn
            v-if="revealedHints.length < game.hints.length"
            size="x-small"
            variant="text"
            color="info"
            @click="revealHint"
          >
            <v-icon start size="small">fas fa-lightbulb</v-icon>
            Indice
          </v-btn>
        </div>

        <!-- Feedback de la dernière réponse -->
        <div v-if="lastFeedback" class="feedback" :class="lastFeedback.type">
          {{ lastFeedback.message }}
        </div>
      </div>
    </v-card-text>
    <!-- État: Erreur -->
    <v-card-text v-else-if="error" class="error-state">
      <v-icon color="warning" size="48">fas fa-exclamation-triangle</v-icon>
      <p class="error-text">Un problème technique empêche de charger le jeu.</p>
      <v-btn
        size="small"
        variant="tonal"
        color="accent"
        @click="renewGame"
      >
        <v-icon start size="small">fas fa-sync-alt</v-icon>
        Réessayer
      </v-btn>
    </v-card-text>

    <!-- État: Chargement -->
    <v-card-text v-else class="loading-state">
      <v-progress-circular indeterminate color="accent" size="32" />
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";

export default {
  name: "WikiMysteryWidget",
  props: {
    game: {
      type: Object,
      default: null
    },
    error: {
      type: Boolean,
      default: false
    }
  },
  emits: ["renew", "completed"],
  data() {
    return {
      currentGuess: "",
      attempts: 0,
      revealedHints: [],
      gameState: "playing", // playing, won, lost
      lastFeedback: null
    };
  },
  watch: {
    game: {
      immediate: true,
      handler(newGame) {
        if (newGame) {
          this.resetState();
        }
      }
    }
  },
  methods: {
    getCategoryColor(category) {
      const colors = {
        "Personnalité": "purple",
        "Lieu": "blue",
        "Animal": "green",
        "Média": "orange",
        "Entreprise": "cyan",
        "Monument": "brown",
        "Concept": "grey"
      };
      return colors[category] || "grey";
    },
    resetState() {
      this.attempts = 0;
      this.revealedHints = [];
      this.gameState = "playing";
      this.lastFeedback = null;
      this.currentGuess = "";
    },
    renewGame() {
      this.resetState();
      this.$emit("renew");
    },
    async submitGuess() {
      if (!this.currentGuess.trim() || this.gameState !== "playing") return;

      this.attempts++;

      try {
        const response = await axios.post("/api/daily-games/wiki-mystery/check", {
          guess: this.currentGuess,
          answer: this.game.answer
        });

        const result = response.data;

        if (result.correct) {
          this.gameState = "won";
          this.lastFeedback = null;
          this.$emit("completed", this.attempts, this.revealedHints.length);
        } else {
          if (this.attempts >= 6) {
            this.gameState = "lost";
            this.lastFeedback = null;
          } else {
            // Donner un feedback basé sur la similarité
            if (result.similarity >= 80) {
              this.lastFeedback = { type: "hot", message: "Très proche ! Vérifiez l'orthographe." };
            } else if (result.similarity >= 50) {
              this.lastFeedback = { type: "warm", message: "Vous vous approchez..." };
            } else {
              this.lastFeedback = { type: "cold", message: "Ce n'est pas ça." };
            }
          }
        }
      } catch {
        // Vérification locale en cas d'erreur
        const correct = this.currentGuess.toLowerCase().trim() === this.game.answer.toLowerCase().trim();
        if (correct) {
          this.gameState = "won";
          this.$emit("completed", this.attempts, this.revealedHints.length);
        } else if (this.attempts >= 6) {
          this.gameState = "lost";
        } else {
          this.lastFeedback = { type: "cold", message: "Ce n'est pas ça." };
        }
      }

      this.currentGuess = "";
    },
    revealHint() {
      if (this.revealedHints.length < this.game.hints.length) {
        this.revealedHints.push(this.game.hints[this.revealedHints.length]);
      }
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

.game-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.masked-text {
  font-style: italic;
  line-height: 1.5;
  padding: 12px;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 8px;
  font-size: 0.95em;
}

.result-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;

  &.won {
    background: rgba(var(--v-theme-success), 0.1);
  }

  &.lost {
    background: rgba(var(--v-theme-error), 0.1);
  }

  .result-text {
    margin: 0;
    text-align: center;
  }
}

.game-playing {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hints-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85em;
  color: rgb(var(--v-theme-info));
}

.input-section {
  display: flex;
  gap: 8px;
  align-items: center;
}

.attempts-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85em;
  opacity: 0.7;
}

.feedback {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.9em;
  text-align: center;

  &.hot {
    background: rgba(var(--v-theme-warning), 0.2);
    color: rgb(var(--v-theme-warning));
  }

  &.warm {
    background: rgba(var(--v-theme-info), 0.2);
    color: rgb(var(--v-theme-info));
  }

  &.cold {
    background: rgba(0, 0, 0, 0.05);
  }
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.error-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  min-height: 200px;
  text-align: center;

  .error-text {
    margin: 0;
    opacity: 0.7;
    font-size: 0.9em;
  }
}
</style>
