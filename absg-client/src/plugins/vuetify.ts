import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import 'vuetify/src/stylus/app.styl';
import fr from 'vuetify/src/locale/fr';

Vue.use(Vuetify, {
  theme: {
    primary: '#64b5f6',
    secondary: '#455a64',
    accent: '#26a69a',
    // error: '#FF5252',
    // info: '#2196F3',
    // success: '#4CAF50',
    // warning: '#FFC107',
  },
  customProperties: true,
  iconfont: 'fa',
  lang: {
    locales: { fr },
    current: 'fr',
  },
});
