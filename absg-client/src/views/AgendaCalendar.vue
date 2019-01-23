<template>
  <div class="home" style="margin-top: 50px;">
    <h1>Calendrier Absolument G</h1>

    
    <v-card style="margin: 14px;">
      <ds-calendar-app :calendar="calendar"></ds-calendar-app>
      </v-card>
  </div>
</template>



<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Calendar } from 'dayspan';

@Component({})
export default class AgendaCalendar extends Vue {
  calendar = Calendar.months();


}
</script>

<style lang="scss" scoped>
  @import '../assets/fonts.css';
  @import '../assets/global.scss';
  h1 {
    display: block;
    font-size: 2em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
    font-weight: bold;

    text-align: center;
    color: $primary;
    text-shadow: 0 -1px #000;
    text-shadow: 0 1px #aaa;
    font-size: 40px;
    font-family: "AbsgFont", sans-serif;
    margin: 20px 0 60px 0;
  }
</style>