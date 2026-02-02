<template>
  <v-card class="widget-card citation-widget">
    <v-card-title class="widget-title">
      <v-icon start color="accent">fas fa-quote-left</v-icon>
      Citation du jour
    </v-card-title>
    <v-card-text v-if="citation" class="citation-content">
      <div class="citation-body">
        <div class="quote-mark start">"</div>
        <p class="citation-text" v-html="citation.citation"></p>
        <div class="quote-mark end">"</div>
      </div>
      <div class="citation-author">
        <v-avatar
          v-if="citation.author && citation.author.thumb"
          size="36"
          class="author-avatar"
        >
          <img :src="citation.author.thumb" :alt="citation.author.fullname" @error="handleImageError">
        </v-avatar>
        <v-avatar
          v-else
          size="36"
          color="primary"
          class="author-avatar"
        >
          <v-icon color="white" size="small">fas fa-user</v-icon>
        </v-avatar>
        <div class="author-info">
          <span class="author-name">{{ citation.author?.fullname || 'Anonyme' }}</span>
          <span v-if="citation.year" class="citation-year">{{ citation.year }}</span>
        </div>
      </div>
    </v-card-text>
    <v-card-text v-else class="no-citation text-center pa-6">
      <v-icon size="48" color="grey-lighten-1">fas fa-quote-right</v-icon>
      <p class="mt-2 text-grey">Aucune citation disponible</p>
    </v-card-text>
    <v-card-actions v-if="citation" class="citation-actions">
      <v-btn
        variant="text"
        size="small"
        color="primary"
        to="/citations"
      >
        <v-icon start size="small">fas fa-book-open</v-icon>
        Voir toutes les citations
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "CitationWidget",
  props: {
    citation: {
      type: Object,
      default: null
    }
  },
  methods: {
    handleImageError(e) {
      e.target.style.display = "none";
    }
  }
};
</script>

<style lang="scss" scoped>
.widget-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.widget-title {
  font-family: "Comfortaa", sans-serif;
  font-size: 1.1em;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.citation-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.citation-body {
  position: relative;
  padding: 16px 24px;
}

.quote-mark {
  font-family: Georgia, serif;
  font-size: 3em;
  color: rgb(var(--v-theme-accent));
  opacity: 0.3;
  line-height: 1;
  position: absolute;

  &.start {
    top: 0;
    left: 8px;
  }

  &.end {
    bottom: 0;
    right: 8px;
  }
}

.citation-text {
  font-style: italic;
  font-size: 1.1em;
  line-height: 1.5;
  text-align: center;
  margin: 0;
  padding: 0 16px;
}

.citation-author {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 8px;
  margin: 0 16px 8px;
}

.author-avatar {
  border: 2px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.citation-year {
  font-size: 0.85em;
  opacity: 0.6;
}

.citation-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  justify-content: center;
}

.no-citation {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
}
</style>
