import Vue from 'vue';
import DaySpanVuetify from 'dayspan-vuetify';

import 'vuetify/dist/vuetify.min.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import 'dayspan-vuetify/dist/lib/dayspan-vuetify.min.css';

Vue.config.productionTip = false;

Vue.use(DaySpanVuetify, {
  methods: {
    getDefaultEventColor: () => '#1976d2',
  },
});
