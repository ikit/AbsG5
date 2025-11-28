# ABSG-CLIENT

> Application frontend pour Absolument G - Vue 3 + Vite + Vuetify 3

## Stack Technique

- **Framework**: Vue 3.4.x (Composition API + Options API)
- **Build Tool**: Vite 5.x
- **State Management**: Pinia 2.x
- **Router**: Vue Router 4.x
- **UI Framework**: Vuetify 3.5.x
- **HTTP Client**: axios 1.7.x
- **WebSocket**: Native WebSocket API
- **Rich Text Editor**: TipTap (Vue 3)
- **Charts**: Highcharts + highcharts-vue
- **Drag & Drop**: vuedraggable 4.x
- **Date Manipulation**: date-fns 3.x
- **Testing**: Vitest 4.x + Vue Test Utils

## Prérequis

- Node.js 20.x LTS
- npm ou yarn
- Backend API running (absg-core)

## Installation

```bash
# Installer les dépendances
npm install

# Copier et configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres
```

## Configuration (.env)

```bash
# API Backend
VITE_API_URL=http://localhost:3000

# WebSocket
VITE_WS_URL=ws://localhost:3000

# Environment
VITE_ENV=development
```

## Scripts Disponibles

### Développement
```bash
npm run dev          # Serveur de développement Vite (HMR)
npm run build        # Build de production
npm run preview      # Preview du build de production
```

### Tests
```bash
npm test             # Tests en mode watch
npm run test:run     # Tests en mode single run
npm run test:ui      # Interface UI pour les tests
npm run test:coverage # Tests avec coverage
```

### Qualité du Code
```bash
npm run lint         # Lint avec ESLint
npm run lint:fix     # Fix automatique des erreurs
```

## Structure du Projet

```
absg-client/
├── src/
│   ├── views/            # Pages/Routes principales
│   │   ├── Home.vue
│   │   ├── Admin/
│   │   ├── Agpa/
│   │   ├── Forum/
│   │   ├── Photos/
│   │   ├── Agenda/
│   │   ├── Citations/
│   │   └── Gtheque/
│   ├── components/       # Composants réutilisables
│   │   ├── PhotoGallery.vue
│   │   ├── TextEditor.vue
│   │   └── ...
│   ├── stores/           # Pinia stores
│   │   ├── user.js
│   │   ├── notification.js
│   │   ├── photoGallery.js
│   │   ├── agpa.js
│   │   ├── websocket.js
│   │   └── helpers.js    # Backward compatibility
│   ├── router/           # Vue Router configuration
│   │   └── index.js
│   ├── plugins/          # Vue plugins
│   │   ├── vuetify.js
│   │   └── websocket.js
│   ├── middleware/       # Helpers & utilities
│   │   └── CommonHelper.js
│   ├── assets/           # Static assets
│   ├── App.vue           # Root component
│   └── main.js           # Entry point
├── test/
│   ├── setup.js          # Test configuration
│   ├── example.test.js   # Example tests
│   └── stores/           # Store tests
│       ├── user.test.js
│       ├── notification.test.js
│       ├── photoGallery.test.js
│       ├── agpa.test.js
│       └── websocket.test.js
├── public/               # Public assets
├── index.html            # HTML entry point
├── vite.config.js        # Vite configuration
└── package.json
```

## Stores Pinia

### user.js
Gestion de l'authentification et du profil utilisateur
```javascript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
userStore.login({ username, password })
userStore.currentUser
userStore.isLoggedIn
```

### notification.js
Gestion des notifications système et UI
```javascript
import { useNotificationStore } from '@/stores/notification'

const notifStore = useNotificationStore()
notifStore.showSnack('Success!')
notifStore.showError(error)
notifStore.notifications
```

### photoGallery.js
Gestion de la galerie photos
```javascript
import { usePhotoGalleryStore } from '@/stores/photoGallery'

const galleryStore = usePhotoGalleryStore()
galleryStore.resetGallery(photos)
galleryStore.showGallery()
galleryStore.nextPhoto()
```

### agpa.js
Gestion du concours photo AGPA
```javascript
import { useAgpaStore } from '@/stores/agpa'

const agpaStore = useAgpaStore()
await agpaStore.initialize()
agpaStore.currentPhase
agpaStore.isVotingPhase
```

### websocket.js
Gestion de la connexion WebSocket
```javascript
import { useWebSocketStore } from '@/stores/websocket'

const wsStore = useWebSocketStore()
wsStore.sendMessage({ type: 'ping' })
wsStore.isConnected
```

## Composants Principaux

### PhotoGallery
Visualiseur de photos avec navigation
```vue
<template>
  <PhotoGallery :photos="photos" />
</template>
```

### TextEditor
Éditeur de texte riche (TipTap)
```vue
<template>
  <TextEditor v-model="content" />
</template>
```

### Highcharts
Graphiques et statistiques
```vue
<template>
  <highcharts :options="chartOptions" />
</template>
```

## Routing

Routes principales définies dans `src/router/index.js`:
- `/` - Home
- `/login` - Login
- `/admin/*` - Administration
- `/photos/*` - Galerie photos
- `/forum/*` - Forum
- `/agpa/*` - Concours AGPA
- `/agenda/*` - Agenda et événements
- `/citations` - Citations
- `/gtheque/*` - Bibliothèque

## Tests

### Structure des Tests
```
test/
├── setup.js              # Configuration Vitest + Vue Test Utils
├── example.test.js       # Tests d'exemple
└── stores/               # Tests des stores
    ├── user.test.js      # 9 tests
    ├── notification.test.js  # 10 tests
    ├── photoGallery.test.js  # 16 tests
    ├── agpa.test.js      # 12 tests
    └── websocket.test.js # 14 tests
```

### Écrire des Tests
```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should login user', () => {
    const store = useUserStore()
    store.setCurrentUser({ id: 1, username: 'test' })
    expect(store.isLoggedIn).toBe(true)
  })
})
```

### Lancer les Tests
```bash
npm test              # Watch mode
npm run test:run      # Single run (63 tests)
npm run test:coverage # Avec coverage
```

## Build & Déploiement

### Build de Production
```bash
npm run build
```

Les fichiers sont générés dans `dist/`:
- `dist/index.html` - HTML entry
- `dist/assets/` - JS, CSS, images optimisés

### Preview du Build
```bash
npm run preview
```

### Déploiement avec Nginx
```nginx
server {
    listen 80;
    server_name absolumentg.fr;
    
    root /var/www/absg5/client/dist;
    index index.html;
    
    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket proxy
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker
```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Migration Vue 2 → Vue 3

### Changements Principaux

#### Vuex → Pinia
```javascript
// Avant (Vuex)
this.$store.dispatch('login', credentials)
this.$store.state.user

// Après (Pinia)
const userStore = useUserStore()
userStore.login(credentials)
userStore.currentUser
```

#### Vuetify 2 → Vuetify 3
```vue
<!-- Avant -->
<v-simple-table dense>
  <template #default>
    <tbody>...</tbody>
  </template>
</v-simple-table>

<!-- Après -->
<v-table density="compact">
  <tbody>...</tbody>
</v-table>
```

#### Vue CLI → Vite
```javascript
// Avant
process.env.VUE_APP_API_URL

// Après
import.meta.env.VITE_API_URL
```

Voir [MIGRATION_GUIDE.md](../.kiro/specs/modernization-stack/MIGRATION_GUIDE.md) pour plus de détails.

## Performance

### Optimisations Vite
- ⚡ HMR ultra-rapide
- ⚡ Build optimisé avec Rollup
- ⚡ Code splitting automatique
- ⚡ Tree-shaking
- ⚡ Lazy loading des routes

### Optimisations Vue 3
- ⚡ Virtual DOM optimisé
- ⚡ Composition API (optionnel)
- ⚡ Teleport pour les modals
- ⚡ Suspense pour le lazy loading

### Bundle Size
```bash
# Analyser le bundle
npm run build
npx vite-bundle-visualizer
```

## Troubleshooting

### Module Not Found
```bash
# Vérifier les alias dans vite.config.js
# Nettoyer le cache
rm -rf node_modules/.vite
npm run dev
```

### Vuetify Components Not Rendering
```bash
# Vérifier que Vuetify est bien importé dans main.js
# Vérifier les imports de styles
import 'vuetify/styles'
```

### WebSocket Not Connecting
```bash
# Vérifier que le backend est démarré
# Vérifier VITE_WS_URL dans .env
# Vérifier les logs du navigateur
```

### Tests Failing
```bash
# Nettoyer et réinstaller
rm -rf node_modules
npm install
npm test
```

## Documentation

- [Migration Guide](../.kiro/specs/modernization-stack/MIGRATION_GUIDE.md)
- [Manual Testing Checklist](../.kiro/specs/modernization-stack/MANUAL_TESTING_CHECKLIST.md)
- [Stores README](src/stores/README.md)

## Ressources

- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vuetify 3 Documentation](https://vuetifyjs.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Vue Router 4 Documentation](https://router.vuejs.org/)

## Licence

Privé - Tous droits réservés

## Auteur

Olivier Gueudelot - [ikit](https://github.com/ikit)
