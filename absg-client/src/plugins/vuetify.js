import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'
import fr from 'vuetify/es5/locale/fr'

Vue.use(Vuetify, {
  theme: {
    primary: '#0277bd',
    secondary: '#263238',
    accent: '#26a69a',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
  },
  customProperties: true,
  iconfont: 'fa',
  lang: {
    locales: { fr },
    current: 'fr'
  },
})
