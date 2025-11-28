# Guide des Tests d'Intégration

## Vue d'Ensemble

Les tests d'intégration vérifient que les différentes parties de l'application fonctionnent correctement ensemble.

## Structure des Tests

### Backend (absg-core/test/integration/)

```
test/
├── setup.ts                    # Configuration globale
├── example.test.ts             # Tests d'exemple
└── integration/
    ├── auth.test.ts           # Tests authentification
    ├── photos.test.ts         # Tests upload photos
    ├── forum.test.ts          # Tests forum
    └── agpa.test.ts           # Tests AGPA
```

### Frontend (absg-client/test/)

```
test/
├── setup.js                    # Configuration globale
├── example.test.js             # Tests d'exemple
└── components/
    ├── App.test.js            # Tests App.vue
    ├── Home.test.js           # Tests Home.vue
    └── stores/
        ├── user.test.js       # Tests store user
        └── notification.test.js
```

## Tests Backend

### 1. Tests Authentification (auth.test.ts)

#### Scénarios à Tester
- ✅ Login avec credentials valides
- ✅ Login avec credentials invalides
- ✅ Login avec données manquantes
- ✅ Logout utilisateur authentifié
- ✅ Refresh token valide
- ✅ Refresh token expiré
- ✅ Reset password utilisateur existant
- ✅ Reset password utilisateur inexistant

#### Template
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/api'

describe('Authentication', () => {
  beforeAll(async () => {
    // Setup test database
  })

  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'test123' })
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('token')
  })
})
```

### 2. Tests Upload Photos (photos.test.ts)

#### Scénarios à Tester
- ✅ Upload fichier image valide
- ✅ Upload fichier type invalide
- ✅ Upload fichier trop volumineux
- ✅ Upload sans authentification
- ✅ Édition métadonnées photo
- ✅ Suppression photo
- ✅ Liste photos utilisateur

#### Template
```typescript
describe('Photo Upload', () => {
  it('should upload valid image', async () => {
    const response = await request(app)
      .post('/api/photos/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('photo', 'test/fixtures/test-image.jpg')
    
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
  })
})
```

### 3. Tests Forum (forum.test.ts)

#### Scénarios à Tester
- ✅ Créer nouveau topic
- ✅ Poster réponse
- ✅ Éditer post
- ✅ Supprimer post
- ✅ Lister topics
- ✅ Lire topic avec posts

### 4. Tests AGPA (agpa.test.ts)

#### Scénarios à Tester
- ✅ Soumettre photo concours
- ✅ Voter pour photo
- ✅ Consulter résultats
- ✅ Accéder archives

## Tests Frontend

### 1. Tests Composants

#### App.vue
```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from '@/App.vue'

describe('App.vue', () => {
  it('should render navigation', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()]
      }
    })
    
    expect(wrapper.find('nav').exists()).toBe(true)
  })
})
```

#### Home.vue
```javascript
describe('Home.vue', () => {
  it('should display welcome message', () => {
    const wrapper = mount(Home)
    expect(wrapper.text()).toContain('Bienvenue')
  })
})
```

### 2. Tests Stores Pinia

#### user.test.js
```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with null user', () => {
    const store = useUserStore()
    expect(store.currentUser).toBeNull()
  })

  it('should set user on login', () => {
    const store = useUserStore()
    const user = { id: 1, username: 'test' }
    
    store.setCurrentUser(user)
    expect(store.currentUser).toEqual(user)
    expect(store.isLoggedIn).toBe(true)
  })
})
```

## Configuration Tests

### Backend (vitest.config.ts)

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

### Frontend (vitest.config.js)

```javascript
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup.js'],
  },
})
```

## Fixtures et Mocks

### Créer Fixtures

```typescript
// test/fixtures/users.ts
export const testUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com'
}

export const testAdmin = {
  id: 2,
  username: 'admin',
  email: 'admin@example.com',
  roles: ['admin']
}
```

### Créer Mocks

```typescript
// test/mocks/database.ts
import { vi } from 'vitest'

export const mockDatabase = {
  query: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn()
}
```

## Commandes

### Exécuter Tests

```bash
# Backend
cd absg-core
npm test                    # Watch mode
npm run test:run           # Single run
npm run test:coverage      # With coverage

# Frontend
cd absg-client
npm test
npm run test:run
npm run test:coverage
```

### Tests Spécifiques

```bash
# Un fichier spécifique
npm test auth.test.ts

# Un pattern
npm test -- integration

# Avec UI
npm run test:ui
```

## Bonnes Pratiques

### 1. Organisation
- ✅ Un fichier de test par fonctionnalité
- ✅ Grouper tests avec `describe`
- ✅ Noms de tests descriptifs
- ✅ Setup/teardown dans beforeAll/afterAll

### 2. Isolation
- ✅ Chaque test indépendant
- ✅ Nettoyer après chaque test
- ✅ Utiliser base de données de test
- ✅ Pas d'effets de bord

### 3. Clarté
- ✅ Tests lisibles
- ✅ Un concept par test
- ✅ Arrange-Act-Assert pattern
- ✅ Messages d'erreur clairs

### 4. Performance
- ✅ Tests rapides
- ✅ Parallélisation quand possible
- ✅ Mocks pour dépendances externes
- ✅ Fixtures réutilisables

## Exemple Complet

### Backend Integration Test

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../../src/api'
import { AppDataSource } from '../../src/data-source'

describe('User Authentication Flow', () => {
  let token: string
  
  beforeAll(async () => {
    await AppDataSource.initialize()
  })

  afterAll(async () => {
    await AppDataSource.destroy()
  })

  it('should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
      })
    
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
  })

  it('should login and receive token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'newuser',
        password: 'password123'
      })
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('token')
    token = response.body.token
  })

  it('should access protected route with token', async () => {
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
    
    expect(response.status).toBe(200)
    expect(response.body.username).toBe('newuser')
  })

  it('should reject invalid token', async () => {
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', 'Bearer invalid-token')
    
    expect(response.status).toBe(401)
  })
})
```

### Frontend Component Test

```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import LoginForm from '@/components/LoginForm.vue'

describe('LoginForm.vue', () => {
  it('should render login form', () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [createPinia()]
      }
    })
    
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('should emit login event on submit', async () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [createPinia()]
      }
    })
    
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('password')
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.emitted('login')).toBeTruthy()
    expect(wrapper.emitted('login')[0]).toEqual([{
      username: 'testuser',
      password: 'password'
    }])
  })

  it('should show error for empty fields', async () => {
    const wrapper = mount(LoginForm, {
      global: {
        plugins: [createPinia()]
      }
    })
    
    await wrapper.find('form').trigger('submit')
    
    expect(wrapper.text()).toContain('requis')
  })
})
```

## Prochaines Étapes

### Immédiat
1. ✅ Implémenter tests authentification
2. ✅ Implémenter tests upload photos
3. ✅ Implémenter tests forum

### Court Terme
1. Tests stores Pinia
2. Tests composants critiques
3. Tests end-to-end

### Moyen Terme
1. Augmenter coverage
2. Tests de performance
3. Tests de charge

## Ressources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Supertest](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**Status**: Guide créé - Prêt pour implémentation
**Next**: Implémenter tests d'intégration
