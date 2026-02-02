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
          primary: '#1E3A5F',
          secondary: '#152A45',
          accent: '#FF6B6B',
          background: '#E8EDF2',
          surface: '#F5F7FA',
          'surface-variant': '#DDE4EB',
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
        dark: true,
        colors: {
          primary: '#3D5A80',
          secondary: '#1E3A5F',
          accent: '#FF8585',
          background: '#0D1B2A',
          surface: '#1B2838',
          'surface-variant': '#243447',
          'on-background': '#B8C5D3',
          'on-surface': '#C5D0DB',
          info: '#4fc3f7',
          success: '#4caf50',
          warning: '#ffb74d',
          error: '#ef5350',
          group1: '#29b6f6', // Gueudelot
          group2: '#66bb6a', // Guibert
          group3: '#ff8a65', // Guyomard
        },
      },
    },
  },
})
