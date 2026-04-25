<template>
  <div class="pcloud-datenav">
    <div class="pcloud-datenav__years d-flex align-center ga-1 flex-wrap">
      <v-btn
        v-for="year in store.availableYears"
        :key="year"
        :variant="expandedYear === year ? 'flat' : 'tonal'"
        :color="expandedYear === year ? 'primary' : undefined"
        size="small"
        rounded
        @click="toggleYear(year)"
      >
        {{ year }}
      </v-btn>
    </div>

    <div v-if="expandedYear && months.length" class="pcloud-datenav__months d-flex align-center ga-1 flex-wrap mt-1">
      <v-icon size="small" class="mr-1" color="grey">fas fa-angle-right</v-icon>
      <v-btn
        v-for="ym in months"
        :key="ym"
        variant="text"
        size="x-small"
        rounded
        @click="$emit('scroll-to', ym)"
      >
        {{ monthLabel(ym) }}
      </v-btn>
    </div>
  </div>
</template>

<script>
import { usePCloudStore } from '../../../stores/pcloud';

const MONTH_SHORT = [
  '', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
];

export default {
  emits: ['scroll-to'],
  setup() {
    const store = usePCloudStore();
    return { store };
  },
  data: () => ({
    expandedYear: null
  }),
  computed: {
    months() {
      if (!this.expandedYear) return [];
      return this.store.availableMonths[this.expandedYear] || [];
    }
  },
  watch: {
    'store.availableYears': {
      handler(years) {
        if (years.length && !this.expandedYear) {
          this.expandedYear = years[years.length - 1];
        }
      },
      immediate: true
    }
  },
  methods: {
    toggleYear(year) {
      if (this.expandedYear === year) {
        this.expandedYear = null;
      } else {
        this.expandedYear = year;
        // Scroll vers le premier mois de l'année
        const months = this.store.availableMonths[year];
        if (months && months.length) {
          this.$emit('scroll-to', months[0]);
        }
      }
    },
    monthLabel(yearMonth) {
      const month = parseInt(yearMonth.split('-')[1], 10);
      return MONTH_SHORT[month] || yearMonth;
    }
  }
};
</script>

<style lang="scss" scoped>
.pcloud-datenav {
  padding: 8px 16px;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  position: sticky;
  top: 56px;
  z-index: 19;
}
</style>
