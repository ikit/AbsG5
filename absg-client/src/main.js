// import 'babel-polyfill';
import Vue from 'vue';
import vuetify from '@/plugins/vuetify';
import App from './App.vue';
import { router } from './router';
import store from './store';
import './registerServiceWorker';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@fortawesome/fontawesome-free/css/all.css';
import 'vue-orgchart/dist/style.min.css';
import VueNativeSock from 'vue-native-websocket';

// import plugin
import { TiptapVuetifyPlugin } from 'tiptap-vuetify'
import 'tiptap-vuetify/dist/main.css'
import 'vuetify/dist/vuetify.min.css'

Vue.config.productionTip = false;

// On supprime le warning du Calendar Vuetify
const ignoreWarnMessage = 'The .native modifier for v-on is only valid on components but it was used on <div>.';
Vue.config.warnHandler = function (msg, vm, trace) {
  // `trace` is the component hierarchy trace
  if (msg === ignoreWarnMessage) {
    msg = null;
    vm = null;
    trace = null;
  }
}

new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
}).$mount('#app');


// On charge le plugin pour gérer les Websocket
const host = process.env.NODE_ENV === "production" ? `wss://${window.location.hostname}/ws` : `ws://localhost:5011`;
Vue.use(VueNativeSock, host, {
    store: store,
    format: 'json',
    reconnection: true,
    // reconnectionAttempts: 5,
    reconnectionDelay: 3000, // (Number) how long to initially wait before attempting a new (1000)
})

// On charge le plugin pour l'éditeur de texte avancé
Vue.use(TiptapVuetifyPlugin, {
    vuetify,
    iconsGroup: 'fa'
  })
