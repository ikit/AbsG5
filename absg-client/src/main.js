import Vue from 'vue';
import './plugins/vuetify';
import DaySpanVuetify from 'dayspan-vuetify';
import App from './App.vue';
import router from './router';
import './registerServiceWorker';

import 'vuetify/dist/vuetify.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'dayspan-vuetify/dist/lib/dayspan-vuetify.min.css'

Vue.config.productionTip = false;

Vue.use(DaySpanVuetify, {
  methods: {
    getDefaultEventColor: () => '#1976d2'
  }
});

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
