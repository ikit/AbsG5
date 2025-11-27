import { createApp, configureCompat } from 'vue'
import vuetify from '@/plugins/vuetify'
import websocketPlugin from '@/plugins/websocket'
import App from './App.vue'
import { router } from './router'
import pinia from './stores'
import './registerServiceWorker'
import 'roboto-fontface/css/roboto/roboto-fontface.css'

// Configure Vue 3 compatibility mode
configureCompat({
  MODE: 2, // Vue 2 mode with warnings
  INSTANCE_ATTRS_CLASS_STYLE: 'suppress-warning', // Suppress Vuetify 3 warnings
  GLOBAL_MOUNT: false,
  GLOBAL_EXTEND: false,
  GLOBAL_PROTOTYPE: false,
  GLOBAL_SET: false,
  GLOBAL_DELETE: false,
  GLOBAL_OBSERVABLE: false,
  CONFIG_OPTION_MERGE_STRATS: false,
  CONFIG_DEVTOOLS: false,
  INSTANCE_SET: false,
  INSTANCE_DELETE: false,
  INSTANCE_DESTROY: false,
  INSTANCE_EVENT_EMITTER: false,
  INSTANCE_EVENT_HOOKS: false,
  INSTANCE_CHILDREN: false,
  INSTANCE_LISTENERS: false,
  INSTANCE_SCOPED_SLOTS: false,
  COMPONENT_V_MODEL: false,
  COMPONENT_FUNCTIONAL: false,
  COMPONENT_ASYNC: false,
  RENDER_FUNCTION: false,
  FILTERS: false,
  COMPILER_IS_ON_ELEMENT: false,
  COMPILER_V_BIND_SYNC: false,
  COMPILER_V_BIND_PROP: false,
  COMPILER_V_BIND_OBJECT_ORDER: false,
  COMPILER_V_ON_NATIVE: false,
  COMPILER_V_IF_V_FOR_PRECEDENCE: false,
  COMPILER_NATIVE_TEMPLATE: false,
  COMPILER_INLINE_TEMPLATE: false,
  COMPILER_FILTERS: false,
  ATTR_FALSE_VALUE: false,
  ATTR_ENUMERATED_COERCION: false,
  TRANSITION_GROUP_ROOT: false,
  TRANSITION_CLASSES: false,
  WATCH_ARRAY: false,
  OPTIONS_DATA_FN: false,
  OPTIONS_DATA_MERGE: false,
  OPTIONS_BEFORE_DESTROY: false,
  OPTIONS_DESTROYED: false,
  PRIVATE_APIS: false,
  V_ON_KEYCODE_MODIFIER: false,
  CUSTOM_DIR: false,
})

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
