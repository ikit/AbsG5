<template>
  <v-card class="widget-card">
    <v-card-title class="widget-title">
      <v-icon start color="accent">fas fa-calendar-alt</v-icon>
      Événements à venir
    </v-card-title>
    <v-card-text class="pa-0">
      <v-list v-if="events && events.length > 0" density="compact" class="events-list">
        <v-list-item
          v-for="(event, index) in events"
          :key="index"
          class="event-item"
        >
          <template #prepend>
            <v-avatar
              v-if="event.type === 'birthday' && event.thumb"
              size="40"
              class="event-avatar"
            >
              <img :src="event.thumb" :alt="event.name" @error="handleImageError">
            </v-avatar>
            <v-avatar
              v-else
              size="40"
              :color="getEventColor(event.type)"
              class="event-avatar"
            >
              <v-icon color="white" size="small">{{ getEventIcon(event.type) }}</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="event-name">
            {{ event.name }}
          </v-list-item-title>
          <v-list-item-subtitle class="event-date">
            {{ formatEventDate(event) }}
          </v-list-item-subtitle>

          <template #append>
            <v-chip
              :color="getDaysColor(event.daysUntil)"
              size="small"
              variant="tonal"
            >
              {{ formatDaysUntil(event.daysUntil) }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>
      <div v-else class="no-events pa-4 text-center">
        <v-icon size="48" color="grey-lighten-1">fas fa-calendar-check</v-icon>
        <p class="mt-2 text-grey">Aucun événement à venir</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default {
  name: "UpcomingEventsWidget",
  props: {
    events: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    getEventIcon(type) {
      switch (type) {
        case "birthday":
          return "fas fa-birthday-cake";
        case "holiday":
          return "fas fa-flag";
        case "nameday":
          return "fas fa-star";
        default:
          return "fas fa-calendar";
      }
    },
    getEventColor(type) {
      switch (type) {
        case "birthday":
          return "accent";
        case "holiday":
          return "info";
        case "nameday":
          return "warning";
        default:
          return "primary";
      }
    },
    getDaysColor(days) {
      if (days === 0) return "success";
      if (days <= 3) return "warning";
      if (days <= 7) return "info";
      return "grey";
    },
    formatDaysUntil(days) {
      if (days === 0) return "Aujourd'hui";
      if (days === 1) return "Demain";
      return `J-${days}`;
    },
    formatEventDate(event) {
      if (!event.date) return "";
      const date = new Date(event.date);
      return format(date, "EEEE d MMMM", { locale: fr });
    },
    handleImageError(e) {
      e.target.style.display = "none";
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
}

.events-list {
  max-height: 300px;
  overflow-y: auto;
}

.event-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
  }
}

.event-avatar {
  border: 2px solid rgba(0, 0, 0, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.event-name {
  font-weight: 500;
}

.event-date {
  font-size: 0.85em;
  text-transform: capitalize;
}

.no-events {
  opacity: 0.7;
}
</style>
