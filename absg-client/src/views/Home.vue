<template>
  <div class="home-hero">
    <!-- Photo AGPA plein écran -->
    <img
      v-if="agpaPhoto"
      :src="agpaPhoto.url"
      :alt="agpaPhoto.title"
      class="hero-photo"
    >

    <!-- Fallback si pas de photo -->
    <div v-else class="hero-empty">
      <v-icon size="64" color="grey-darken-1">fas fa-camera-retro</v-icon>
    </div>

    <!-- Légende en bas -->
    <div v-if="agpaPhoto" class="hero-legend">
      <span class="hero-legend-title">{{ agpaPhoto.title }}</span>
      <span class="hero-legend-sep">&middot;</span>
      <span class="hero-legend-author">{{ agpaPhoto.author }}</span>
      <span class="hero-legend-sep">&middot;</span>
      <span class="hero-legend-edition">AGPA {{ agpaPhoto.year }}</span>
      <template v-if="agpaPhoto.category">
        <span class="hero-legend-sep">&middot;</span>
        <span class="hero-legend-category">{{ agpaPhoto.category }}</span>
      </template>
      <span v-if="agpaPhoto.award" class="hero-award">
        <v-icon size="small" class="mr-1">fas fa-trophy</v-icon>
        {{ awardLabel }}
      </span>
    </div>

    <!-- Navigation icônes à droite -->
    <div class="hero-nav">
      <button
        class="hero-nav-btn"
        :class="{ active: visibleWidget === 'events' }"
        @mouseenter="onIconEnter('events')"
        @mouseleave="onIconLeave()"
        @click="onIconClick('events')"
      >
        <v-icon>fas fa-calendar-alt</v-icon>
      </button>
      <button
        class="hero-nav-btn"
        :class="{ active: visibleWidget === 'citation' }"
        @mouseenter="onIconEnter('citation')"
        @mouseleave="onIconLeave()"
        @click="onIconClick('citation')"
      >
        <v-icon>fas fa-quote-left</v-icon>
      </button>
      <button
        class="hero-nav-btn"
        :class="{ active: visibleWidget === 'onThisDay' }"
        @mouseenter="onIconEnter('onThisDay')"
        @mouseleave="onIconLeave()"
        @click="onIconClick('onThisDay')"
      >
        <v-icon>fas fa-landmark</v-icon>
      </button>
    </div>

    <!-- Widget overlay -->
    <transition name="slide-right">
      <div
        v-if="visibleWidget"
        :key="visibleWidget"
        class="hero-widget-panel"
        @mouseenter="onPanelEnter()"
        @mouseleave="onPanelLeave()"
      >
        <UpcomingEventsWidget v-if="visibleWidget === 'events'" :events="upcomingEvents" />
        <CitationWidget v-if="visibleWidget === 'citation'" :citation="citation" />
        <OnThisDayWidget v-if="visibleWidget === 'onThisDay'" :events="onThisDay" />
      </div>
    </transition>

    <!-- Fond cliquable pour fermer un widget verrouillé -->
    <div
      v-if="lockedWidget"
      class="hero-backdrop"
      @click="lockedWidget = null"
    />
  </div>
</template>


<script>
import axios from 'axios';
import { parseAxiosResponse } from '../middleware/CommonHelper';
import UpcomingEventsWidget from '../components/widgets/UpcomingEventsWidget.vue';
import CitationWidget from '../components/widgets/CitationWidget.vue';
import OnThisDayWidget from '../components/widgets/OnThisDayWidget.vue';

const awardLabels = {
    diamond: "Diamant",
    gold: "Or",
    sylver: "Argent",
    bronze: "Bronze",
    nominated: "Nommé",
    honor: "Mention"
};

export default {
    components: {
        UpcomingEventsWidget,
        CitationWidget,
        OnThisDayWidget
    },
    data: () => ({
        upcomingEvents: [],
        citation: null,
        onThisDay: [],
        agpaPhoto: null,
        hoveredWidget: null,
        lockedWidget: null,
        closeTimer: null
    }),
    computed: {
        awardLabel() {
            return this.agpaPhoto?.award ? awardLabels[this.agpaPhoto.award] || this.agpaPhoto.award : null;
        },
        visibleWidget() {
            return this.lockedWidget || this.hoveredWidget;
        }
    },
    mounted() {
        this.getHomeData();
    },
    beforeUnmount() {
        this.clearTimer();
    },
    methods: {
        getHomeData() {
            axios.get(`/api/homepage`).then(response => {
                const data = parseAxiosResponse(response);
                if (data) {
                    if (data.upcomingEvents) this.upcomingEvents = data.upcomingEvents;
                    if (data.citation) this.citation = data.citation;
                    if (data.onThisDay) this.onThisDay = data.onThisDay;
                    if (data.agpaPhoto) this.agpaPhoto = data.agpaPhoto;
                }
            });
        },
        clearTimer() {
            if (this.closeTimer) {
                clearTimeout(this.closeTimer);
                this.closeTimer = null;
            }
        },
        onIconEnter(widget) {
            this.clearTimer();
            if (!this.lockedWidget) {
                this.hoveredWidget = widget;
            }
        },
        onIconLeave() {
            if (!this.lockedWidget) {
                this.closeTimer = setTimeout(() => {
                    this.hoveredWidget = null;
                }, 300);
            }
        },
        onIconClick(widget) {
            this.clearTimer();
            if (this.lockedWidget === widget) {
                // Clic sur le même icône verrouillé → déverrouille
                this.lockedWidget = null;
                this.hoveredWidget = null;
            } else {
                // Verrouille ce widget
                this.lockedWidget = widget;
                this.hoveredWidget = null;
            }
        },
        onPanelEnter() {
            this.clearTimer();
        },
        onPanelLeave() {
            if (!this.lockedWidget) {
                this.closeTimer = setTimeout(() => {
                    this.hoveredWidget = null;
                }, 300);
            }
        }
    }
};
</script>


<style lang="scss" scoped>
.home-hero {
  height: calc(100vh - 64px);
  background: #000;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-photo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

.hero-empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

// Légende en surimpression bas
.hero-legend {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
  padding: 32px 24px 16px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.95em;
}

.hero-legend-title {
  font-weight: 700;
  font-size: 1.1em;
}

.hero-legend-sep {
  opacity: 0.4;
}

.hero-legend-author,
.hero-legend-edition,
.hero-legend-category {
  opacity: 0.85;
}

.hero-award {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85em;
}

// Barre d'icônes à droite
.hero-nav {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 5;
}

.hero-nav-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s, transform 0.2s;
  backdrop-filter: blur(4px);

  &:hover,
  &.active {
    background: rgba(255, 255, 255, 0.25);
    color: #fff;
    transform: scale(1.1);
  }
}

// Backdrop pour fermer un widget verrouillé
.hero-backdrop {
  position: absolute;
  inset: 0;
  z-index: 4;
}

// Widget panel slide-in
.hero-widget-panel {
  position: absolute;
  top: 50%;
  right: 80px;
  transform: translateY(-50%);
  width: 420px;
  max-height: 70vh;
  overflow-y: auto;
  z-index: 10;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

// Transition slide depuis la droite
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-right-enter-from {
  transform: translateY(-50%) translateX(60px);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateY(-50%) translateX(60px);
  opacity: 0;
}

// Responsive mobile
@media (max-width: 960px) {
  .hero-nav {
    right: 8px;
    gap: 8px;
  }

  .hero-nav-btn {
    width: 40px;
    height: 40px;
  }

  .hero-widget-panel {
    right: 8px;
    left: 8px;
    width: auto;
    max-height: 60vh;
  }

  .hero-legend {
    font-size: 0.85em;
    padding: 24px 16px 12px;
  }
}
</style>
