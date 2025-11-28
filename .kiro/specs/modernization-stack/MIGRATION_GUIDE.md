# AbsG5 Migration Guide - Vue 2 to Vue 3 Stack Modernization

## Overview

This guide documents the complete migration of AbsG5 from legacy stack to modern technologies. Use this as a reference for understanding changes, troubleshooting issues, and maintaining the application.

## Migration Summary

### Technology Stack Changes

#### Backend
| Component | Before | After | Reason |
|-----------|--------|-------|--------|
| Node.js | 14.x | 20.x LTS | Security, performance, modern features |
| TypeScript | 4.x | 5.x | Better type inference, performance |
| TypeORM | 0.2.x | 0.3.x | DataSource API, better async support |
| PostgreSQL | 12.x | 16.x | Performance, new features |
| PostGIS | 2.x | 3.4.x | Spatial query improvements |
| Express | 4.17.x | 4.19.x | Security patches |
| bcrypt | 3.x | 5.1.x | Stronger hashing |
| jsonwebtoken | 8.x | 9.0.x | Security updates |
| axios | 0.x | 1.7.x | Security, stability |
| ws | 7.x | 8.18.x | WebSocket improvements |

#### Frontend
| Component | Before | After | Reason |
|-----------|--------|-------|--------|
| Vue | 2.7.x | 3.4.x | Composition API, performance |
| Vue Router | 3.x | 4.x | Vue 3 compatibility |
| Vuex | 4.x | Pinia 2.x | Modern, lightweight, TypeScript |
| Vuetify | 2.x | 3.5.x | Vue 3 support, modern design |
| Build Tool | Vue CLI | Vite 5.x | Faster builds, HMR |
| Test Framework | Jest | Vitest 4.x | Native Vite integration |

## Breaking Changes

### Backend

#### 1. TypeORM DataSource API

**Before (0.2.x)**:
```typescript
import { createConnection } from 'typeorm'

const connection = await createConnection({
  type: 'postgres',
  // ...config
})

const userRepo = connection.getRepository(User)
```

**After (0.3.x)**:
```typescript
import { DataSource } from 'typeorm'

export const AppDataSource = new DataSource({
  type: 'postgres',
  // ...config
})

await AppDataSource.initialize()

const userRepo = AppDataSource.getRepository(User)
```

**Migration Steps**:
1. Replace `createConnection` with `DataSource`
2. Update all `getRepository()` calls to use `AppDataSource.getRepository()`
3. Update entity decorators if needed
4. Test all database operations

#### 2. Entity Column Types

**Before**:
```typescript
@Column()
name: string
```

**After**:
```typescript
@Column({ type: 'varchar' })
name: string
```

**Action**: Add explicit column types to all entity properties

### Frontend

#### 1. Vue 3 Composition API

**Before (Options API)**:
```vue
<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>
```

**After (Composition API - optional)**:
```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++
</script>
```

**Note**: Options API still works in Vue 3. Migration to Composition API is optional.

#### 2. Vuex to Pinia

**Before (Vuex)**:
```javascript
// store/index.js
export default new Vuex.Store({
  state: { user: null },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    }
  },
  actions: {
    login({ commit }, credentials) {
      // ...
      commit('SET_USER', user)
    }
  }
})

// Component
this.$store.dispatch('login', credentials)
this.$store.state.user
```

**After (Pinia)**:
```javascript
// stores/user.js
export const useUserStore = defineStore('user', {
  state: () => ({ user: null }),
  actions: {
    async login(credentials) {
      // ...
      this.user = user
    }
  }
})

// Component
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
userStore.login(credentials)
userStore.user
```

**Backward Compatibility**: We provide `stores/helpers.js` for gradual migration:
```javascript
// Old code still works
import { mapState, mapActions } from '@/stores/helpers'
```

#### 3. Vue Router 4

**Before**:
```javascript
const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '*', component: NotFound }
  ]
})
```

**After**:
```javascript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/:pathMatch(.*)*', component: NotFound }
  ]
})
```

**Changes**:
- `mode: 'history'` → `history: createWebHistory()`
- Catch-all route: `*` → `/:pathMatch(.*)*`
- `router.push()` now returns a Promise

#### 4. Vuetify 3 Components

**Common Changes**:

| Vuetify 2 | Vuetify 3 | Notes |
|-----------|-----------|-------|
| `v-simple-table` | `v-table` | Simplified API |
| `dense` prop | `density="compact"` | New prop name |
| `v-expansion-panel-header` | `v-expansion-panel-title` | Renamed |
| `v-expansion-panel-content` | `v-expansion-panel-text` | Renamed |
| `text` button | `variant="text"` | New variant system |
| `depressed` button | (default) | No longer needed |
| `small` prop | `size="small"` | New sizing system |
| `left` icon | `start` | Renamed for i18n |
| `right` icon | `end` | Renamed for i18n |

**Tooltip Changes**:
```vue
<!-- Before -->
<v-tooltip bottom>
  <template #activator="{ on }">
    <v-btn v-on="on">Button</v-btn>
  </template>
  <span>Tooltip</span>
</v-tooltip>

<!-- After -->
<v-tooltip bottom>
  <template #activator="{ props }">
    <v-btn v-bind="props">Button</v-btn>
  </template>
  <span>Tooltip</span>
</v-tooltip>
```

#### 5. Build System (Vue CLI → Vite)

**Before (vue.config.js)**:
```javascript
module.exports = {
  devServer: {
    proxy: 'http://localhost:3000'
  }
}
```

**After (vite.config.js)**:
```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

**Changes**:
- `index.html` moved to project root
- `process.env.VUE_APP_*` → `import.meta.env.VITE_*`
- Faster dev server and builds
- Native ES modules

## Code Migration Patterns

### 1. Store Access

**Old Pattern (Vuex)**:
```vue
<script>
export default {
  computed: {
    ...mapState(['user', 'notifications']),
    ...mapGetters(['isLoggedIn'])
  },
  methods: {
    ...mapActions(['login', 'logout'])
  }
}
</script>
```

**New Pattern (Pinia)**:
```vue
<script>
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'

export default {
  setup() {
    const userStore = useUserStore()
    const notifStore = useNotificationStore()
    
    return {
      user: computed(() => userStore.currentUser),
      isLoggedIn: computed(() => userStore.isLoggedIn),
      login: userStore.login,
      logout: userStore.logout
    }
  }
}
</script>
```

**Backward Compatible (using helpers)**:
```vue
<script>
import { mapState, mapActions } from '@/stores/helpers'

export default {
  computed: {
    ...mapState('user', ['currentUser', 'isLoggedIn'])
  },
  methods: {
    ...mapActions('user', ['login', 'logout'])
  }
}
</script>
```

### 2. Async/Await in Actions

**Old (Vuex)**:
```javascript
actions: {
  async fetchData({ commit }) {
    const data = await api.get('/data')
    commit('SET_DATA', data)
  }
}
```

**New (Pinia)**:
```javascript
actions: {
  async fetchData() {
    this.data = await api.get('/data')
  }
}
```

### 3. WebSocket Integration

**Old (vue-native-websocket)**:
```javascript
Vue.use(VueNativeSock, 'ws://localhost:3000', {
  store,
  format: 'json'
})
```

**New (Custom Plugin)**:
```javascript
// plugins/websocket.js
export default {
  install(app) {
    const socket = new WebSocket('ws://localhost:3000')
    const wsStore = useWebSocketStore()
    
    socket.onopen = () => wsStore.onOpen()
    socket.onclose = () => wsStore.onClose()
    socket.onmessage = (e) => wsStore.onMessage(JSON.parse(e.data))
    
    app.config.globalProperties.$socket = socket
  }
}
```

## Database Migration

### PostgreSQL Upgrade (12.x → 16.x)

**Steps**:
1. Backup current database:
   ```bash
   pg_dump -U postgres absg5 > backup.sql
   ```

2. Install PostgreSQL 16.x and PostGIS 3.4.x

3. Create new database:
   ```bash
   createdb -U postgres absg5
   psql -U postgres -d absg5 -c "CREATE EXTENSION postgis;"
   ```

4. Restore data:
   ```bash
   psql -U postgres absg5 < backup.sql
   ```

5. Update connection string in `.env`

### TypeORM Migrations

All existing migrations work with TypeORM 0.3.x. No changes needed.

## Environment Variables

### Backend (.env)

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=absg5

# Server
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:5173

# Files
PATH_FILES=./data/files
```

### Frontend (.env)

```bash
# API
VITE_API_URL=http://localhost:3000

# WebSocket
VITE_WS_URL=ws://localhost:3000
```

**Note**: Changed from `VUE_APP_*` to `VITE_*`

## Testing

### Running Tests

**Backend**:
```bash
cd absg-core
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
```

**Frontend**:
```bash
cd absg-client
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
```

### Test Structure

```
absg-core/test/
├── setup.ts              # Test setup
├── example.test.ts       # Example tests
├── integration/          # Integration tests
│   └── auth.test.ts
└── helpers/              # Test helpers
    └── testApp.ts

absg-client/test/
├── setup.js              # Test setup
├── example.test.js       # Example tests
└── stores/               # Store tests
    ├── user.test.js
    ├── notification.test.js
    ├── photoGallery.test.js
    ├── agpa.test.js
    └── websocket.test.js
```

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors

**Cause**: Path aliases not configured
**Solution**: Check `vite.config.js` has correct aliases:
```javascript
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url))
  }
}
```

#### 2. Vuetify components not rendering

**Cause**: Vuetify 3 not properly configured
**Solution**: Check `main.js` has Vuetify plugin:
```javascript
import { createVuetify } from 'vuetify'
import 'vuetify/styles'

const vuetify = createVuetify()
app.use(vuetify)
```

#### 3. Store not working

**Cause**: Pinia not initialized
**Solution**: Check `main.js` has Pinia before router:
```javascript
import { createPinia } from 'pinia'

const pinia = createPinia()
app.use(pinia)
app.use(router)
```

#### 4. WebSocket not connecting

**Cause**: WebSocket store not initialized
**Solution**: Check WebSocket plugin is registered and store is imported

#### 5. Database connection fails

**Cause**: DataSource not initialized
**Solution**: Check `api.ts` calls `AppDataSource.initialize()` before using repositories

### Performance Issues

#### Slow Development Server

**Solution**: Vite should be much faster. If slow:
1. Clear `node_modules/.vite` cache
2. Check for large dependencies
3. Use `npm run build` to check production bundle

#### Slow Database Queries

**Solution**:
1. Check indexes are present
2. Use `EXPLAIN ANALYZE` to profile queries
3. Consider adding caching (Redis)

## Rollback Procedure

If critical issues arise:

1. **Stop services**:
   ```bash
   pm2 stop all
   ```

2. **Restore database backup**:
   ```bash
   psql -U postgres absg5 < backup_pre_migration.sql
   ```

3. **Checkout previous version**:
   ```bash
   git checkout main
   npm install
   ```

4. **Restart services**:
   ```bash
   pm2 start all
   ```

## Post-Migration Checklist

- [ ] All tests passing
- [ ] Application loads without errors
- [ ] Authentication works
- [ ] Photo upload/viewing works
- [ ] Forum posting works
- [ ] AGPA functionality works
- [ ] WebSocket connects
- [ ] Admin functions work
- [ ] Performance acceptable
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Cross-browser tested

## Support & Resources

### Documentation
- Vue 3: https://vuejs.org/
- Pinia: https://pinia.vuejs.org/
- Vue Router 4: https://router.vuejs.org/
- Vuetify 3: https://vuetifyjs.com/
- Vite: https://vitejs.dev/
- TypeORM 0.3: https://typeorm.io/

### Internal Documentation
- `README.md` - Project overview
- `SECURITY_AUDIT.md` - Security status
- `PERFORMANCE_TESTING.md` - Performance guide
- `MANUAL_TESTING_CHECKLIST.md` - Testing checklist

## Conclusion

This migration brings AbsG5 to modern standards with improved:
- **Performance**: Faster builds, better runtime performance
- **Security**: Updated dependencies, security headers, rate limiting
- **Developer Experience**: Better tooling, faster HMR, better TypeScript support
- **Maintainability**: Modern patterns, better testing, clearer code

The application is now ready for continued development and deployment.
