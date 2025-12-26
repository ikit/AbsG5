import { createApp } from 'vue'
import vuetify from '@/plugins/vuetify'
import websocketPlugin from '@/plugins/websocket'
import App from './App.vue'
import { router } from './router'
import pinia from './stores'
import './registerServiceWorker'
import 'roboto-fontface/css/roboto/roboto-fontface.css'

const app = createApp(App)

// Use plugins
app.use(pinia)
app.use(router)
app.use(vuetify)

// Add $store to global properties for Vuex compatibility
import store from './store'
app.config.globalProperties.$store = store

// Initialize $socket to null (will be set by WebSocket plugin)
app.config.globalProperties.$socket = null

// Configure WebSocket
const wsHost = import.meta.env.PROD 
  ? `wss://${window.location.hostname}/ws` 
  : `ws://localhost:5011`

app.use(websocketPlugin, {
  url: wsHost,
  format: 'json',
  reconnection: true,
  reconnectionDelay: 3000,
})

// Mount app
app.mount('#app')
