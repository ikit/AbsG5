import Vue from 'vue';
import Vuetify from 'vuetify';
import * as fr from 'vuetify/lib/locale/fr'
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

const opts = {
    lang: {
        locales: { fr },
        current: 'fr',
    },
    icons: {
        iconfont: 'fa',
    },
    theme: {
      dark: false,
      themes: {
        light: {
            primary: '#37474f',
            secondary: '#26a69a',
            accent: '#26a69a',
            info: '#4fc3f7',
            success: '#2e7d32',
            warning: '#ff8f00',
            error: '#d32f2f',
            group1: '#039be5', // Gueudelot
            group2: '#4caf50', // Guibert
            group3: '#ff7043', // Guyomard
        },
        dark: {
            primary: 'red',
            secondary: 'blue',
            accent: 'green',
            info: '#4fc3f7',
            success: '#2e7d32',
            warning: '#ff8f00',
            error: '#d32f2f',
            group1: '#039be5', // Gueudelot
            group2: '#4caf50', // Guibert
            group3: '#ff7043', // Guyomard
        }
      }
    }
  }

export default new Vuetify(opts);
