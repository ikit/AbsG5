<template>
  <v-card class="widget-card">
    <v-card-title class="widget-title">
      <v-icon start color="accent">fas fa-history</v-icon>
      <span class="title-text">Culture G</span>
      <v-spacer />
      <span class="date-text">{{ formattedDate }}</span>
    </v-card-title>
    <v-card-text class="pa-0">
      <v-list v-if="events && events.length > 0" density="compact" class="events-list">
        <v-list-item
          v-for="(event, index) in events"
          :key="index"
          class="history-item"
        >
          <template #prepend>
            <v-chip
              :color="getEventTypeColor(event.type)"
              size="small"
              variant="flat"
              class="year-chip"
            >
              {{ event.year }}
            </v-chip>
          </template>

          <v-list-item-title class="event-text">
            {{ event.text }}
          </v-list-item-title>

          <template #append>
            <a
              v-if="event.url"
              :href="event.url"
              target="_blank"
              rel="noopener noreferrer"
              class="wiki-link"
              title="Voir sur Wikipedia"
            >
              <v-icon
                color="accent"
                size="small"
              >
                {{ getEventTypeIcon(event.type) }}
              </v-icon>
            </a>
            <v-icon
              v-else
              :color="getEventTypeColor(event.type)"
              size="small"
            >
              {{ getEventTypeIcon(event.type) }}
            </v-icon>
          </template>
        </v-list-item>
      </v-list>
      <div v-else class="no-events pa-4 text-center">
        <v-icon size="48" color="grey-lighten-1">fas fa-book</v-icon>
        <p class="mt-2 text-grey">Aucun événement historique disponible</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default {
  name: "OnThisDayWidget",
  props: {
    events: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    formattedDate() {
      return format(new Date(), "EEEE d MMMM yyyy", { locale: fr });
    }
  },
  methods: {
    getEventTypeIcon(type) {
      switch (type) {
        case "birth":
          return "fas fa-baby";
        case "death":
          return "fas fa-cross";
        default:
          return "fas fa-landmark";
      }
    },
    getEventTypeColor(type) {
      switch (type) {
        case "birth":
          return "success";
        case "death":
          return "grey";
        default:
          return "primary";
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

.date-text {
  font-size: 0.8em;
  opacity: 0.7;
  text-transform: capitalize;
}

.events-list {
  max-height: 280px;
  overflow-y: auto;
}

.history-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 12px 16px 12px 8px;

  &:last-child {
    border-bottom: none;
  }
}

.year-chip {
  font-weight: bold;
  min-width: 55px;
  justify-content: center;
  margin-right: 12px;
}

.event-text {
  font-size: 0.95em;
  line-height: 1.4;
  white-space: normal;
}

.no-events {
  opacity: 0.7;
}

.wiki-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(var(--v-theme-accent), 0.1);
  }
}
</style>
