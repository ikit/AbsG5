import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { fr } from 'vuetify/locale'
import { aliases, fa } from 'vuetify/iconsets/fa'
import { mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import '@fortawesome/fontawesome-free/css/all.css'

export default createVuetify({
  components,
  directives,
  locale: {
    locale: 'fr',
    messages: { fr },
  },
  icons: {
    defaultSet: 'fa',
    aliases,
    sets: {
      fa,
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
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
      },
      dark: {
        colors: {
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
        },
      },
    },
  },
})
