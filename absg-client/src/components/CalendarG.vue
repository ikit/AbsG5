<template>
  <v-app id="dayspan" v-cloak>
    <ds-calendar-app :calendar="calendar"></ds-calendar-app>
  </v-app>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator';
import { Calendar } from 'dayspan';

@Component({})
export default class CalendarG extends Vue {
    name = "CalendarG";
    calendar = Calendar.months();
}
</script>

<style>
body, html, #app, #dayspan {
  font-family: Roboto, sans-serif;
  width: 100%;
  height: 100%;
}
</style>