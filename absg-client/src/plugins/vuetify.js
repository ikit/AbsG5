import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import 'vuetify/src/stylus/app.styl';
import fr from 'vuetify/es5/locale/fr';

Vue.use(Vuetify, {
    theme: {
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
    customProperties: true,
    iconfont: 'fa',
    lang: {
        locales: { fr },
        current: 'fr'
    },
})
