# Design Document - Modernization Stack AbsG5

## Overview

Cette migration représente une refonte majeure de la stack technologique d'AbsG5. L'approche adoptée est une migration progressive par couches, en commençant par le backend (moins de Breaking-Changes), puis le frontend (migration Vue 2 → Vue 3 plus complexe). Cette stratégie permet de valider chaque étape et de minimiser les risques.

La migration sera effectuée en 4 phases principales :
1. **Phase Backend** : Node.js, TypeScript, TypeORM, dépendances backend
2. **Phase Database** : PostgreSQL 16.x et migrations
3. **Phase Frontend Core** : Vue 3, Vite, Pinia, Vue Router 4
4. **Phase Frontend UI** : Vuetify 3 et composants UI

## Architecture

### Architecture Actuelle (Before)

```
┌─────────────────────────────────────────────────────────────┐
│                     AbsG5 Current Stack                      │
├─────────────────────────────────────────────────────────────┤
│  Frontend (absg-client)                                      │
│  - Vue.js 2.6.14                                            │
│  - Vuetify 2.6.3                                            │
│  - Vuex 3.6.2                                               │
│  - Vue Router 2.0.0                                         │
│  - Vue CLI (Webpack)                                        │
│  - Axios 0.21.4 (VULNERABLE)                                │
├─────────────────────────────────────────────────────────────┤
│  Backend (absg-core)                                         │
│  - Node.js 14.x-16.x (EOL)                                  │
│  - TypeScript 4.5.5                                         │
│  - Express 4.17.2                                           │
│  - TypeORM 0.2.41                                           │
│  - jsonwebtoken 8.5.1 (VULNERABLE)                          │
├─────────────────────────────────────────────────────────────┤
│  Database                                                    │
│  - PostgreSQL 9.7+ (EOL)                                    │
│  - PostGIS                                                  │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Cible (After)

```
┌─────────────────────────────────────────────────────────────┐
│                     AbsG5 Modern Stack                       │
├─────────────────────────────────────────────────────────────┤
│  Frontend (absg-client)                                      │
│  - Vue.js 3.4.x (Composition API)                           │
│  - Vuetify 3.5.x                                            │
│  - Pinia 2.x (replaces Vuex)                                │
│  - Vue Router 4.x                                           │
│  - Vite 5.x (replaces Vue CLI)                              │
│  - Axios 1.7.x (SECURE)                                     │
├─────────────────────────────────────────────────────────────┤
│  Backend (absg-core)                                         │
│  - Node.js 20.x LTS                                         │
│  - TypeScript 5.x                                           │
│  - Express 4.19.x                                           │
│  - TypeORM 0.3.x                                            │
│  - jsonwebtoken 9.x (SECURE)                                │
├─────────────────────────────────────────────────────────────┤
│  Database                                                    │
│  - PostgreSQL 16.x                                          │
│  - PostGIS 3.4.x                                            │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Backend Migration Components

#### 1.1 TypeORM 0.3.x Migration

**Breaking Changes:**
- `createConnection()` → `DataSource` API
- Entity decorators syntax changes
- Repository pattern changes
- Migration CLI changes

**Migration Strategy:**
```typescript
// OLD (TypeORM 0.2.x)
import { createConnections } from "typeorm";
createConnections(ormconfig)

// NEW (TypeORM 0.3.x)
import { DataSource } from "typeorm";
const AppDataSource = new DataSource({
    type: "postgres",
    // ... config
});
await AppDataSource.initialize();
```

#### 1.2 Express Security Updates

**Key Updates:**
- Express 4.17.2 → 4.19.x (security patches)
- express-fileupload → multer (more maintained)
- Add helmet for security headers
- Add rate limiting

#### 1.3 Authentication Security

**Updates:**
- bcrypt 5.0.1 → 5.1.x
- jsonwebtoken 8.5.1 → 9.0.x (fixes CVE-2022-23529)
- Implement token refresh mechanism
- Add JWT secret rotation support

### 2. Frontend Migration Components

#### 2.1 Vue 3 Migration Strategy

**Approach:** Gradual migration using compatibility build

```javascript
// Phase 1: Use @vue/compat for gradual migration
import { createApp } from 'vue'
import { createCompatVue } from '@vue/compat'

// Phase 2: Migrate components one by one
// - Convert Options API to Composition API (optional)
// - Update lifecycle hooks (beforeDestroy → beforeUnmount)
// - Update v-model syntax
// - Update event emitters ($emit)
```

**Key Breaking Changes:**
- Global API changes (Vue.use → app.use)
- v-model changes (multiple v-models supported)
- Filters removed (use computed or methods)
- $listeners merged into $attrs
- Functional components syntax change

#### 2.2 Vuex → Pinia Migration

**Migration Pattern:**
```javascript
// OLD: Vuex 3
export default new Vuex.Store({
    state: { user: null },
    mutations: { setUser(state, user) { state.user = user } },
    actions: { async login({ commit }, credentials) { ... } }
})

// NEW: Pinia
export const useUserStore = defineStore('user', {
    state: () => ({ user: null }),
    actions: {
        async login(credentials) {
            // Direct state mutation in actions
            this.user = await api.login(credentials)
        }
    }
})
```

#### 2.3 Vue Router 2 → 4 Migration

**Breaking Changes:**
- `mode: 'history'` → `history: createWebHistory()`
- Navigation guards signature changes
- `router.push()` returns Promise
- Removed `*` catch-all routes (use `/:pathMatch(.*)`)

#### 2.4 Vuetify 2 → 3 Migration

**Major Changes:**
- Complete rewrite for Vue 3
- New component names and props
- SASS variables structure changed
- Icon system updated
- Grid system improvements

**Component Mapping:**
```javascript
// Examples of component changes
v-list-item-content → v-list-item-title + v-list-item-subtitle
v-list-item-avatar → v-avatar inside v-list-item
v-btn text → v-btn variant="text"
```

#### 2.5 Vue CLI → Vite Migration

**Benefits:**
- Faster cold start (ES modules)
- Faster HMR (Hot Module Replacement)
- Better tree-shaking
- Modern build output

**Configuration:**
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
    plugins: [
        vue(),
        vuetify({ autoImport: true })
    ],
    resolve: {
        alias: {
            '@': '/src'
        }
    }
})
```

### 3. Database Migration Components

#### 3.1 PostgreSQL Upgrade Path

**Strategy:**
1. Backup current database
2. Test migrations on PostgreSQL 16.x
3. Validate PostGIS 3.4.x compatibility
4. Update pg driver to 8.12.x

#### 3.2 TypeORM Migration Updates

**Changes needed:**
- Update migration files for TypeORM 0.3.x syntax
- Test all existing migrations
- Create new migrations if schema changes needed

## Data Models

### Updated Entity Decorators (TypeORM 0.3.x)

```typescript
// User.ts - Updated for TypeORM 0.3.x
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Person } from "./Person";

@Entity()
export class User {
    @PrimaryGeneratedColumn({ comment: "user_id" })
    id: number;

    @OneToOne(() => Person, { eager: true })
    @JoinColumn()
    person: Person;

    @Column({ type: "varchar", unique: true, comment: "display name" })
    username: string;

    @Column({ type: "varchar", comment: "clean name for login" })
    usernameClean: string;

    @Column({ type: "varchar", nullable: true, comment: "password hash" })
    passwordHash: string;

    @Column({ type: "varchar", nullable: true, comment: "auth token" })
    token: string;

    @Column({ type: "jsonb", nullable: true, comment: "user roles" })
    roles: string[];

    @Column({ type: "jsonb", nullable: true, comment: "forum draft" })
    draft: any;

    @Column({ type: "timestamp", nullable: true, comment: "last visit" })
    lastTime: Date;

    @Column({ type: "jsonb", nullable: true, comment: "activity data" })
    activity: any;

    @Column({ type: "varchar", nullable: true, comment: "root family" })
    rootFamily: string;

    @Column({ type: "boolean", default: true, comment: "account active" })
    isActive: boolean;
}
```

### Pinia Store Structure

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export const useUserStore = defineStore('user', () => {
    // State
    const user = ref<User | null>(null)
    const isAuthenticated = computed(() => user.value !== null)
    
    // Actions
    async function login(credentials: LoginCredentials) {
        const response = await api.post('/api/login', credentials)
        user.value = response.data
    }
    
    function logout() {
        user.value = null
    }
    
    return { user, isAuthenticated, login, logout }
})
```


## Error Handling

### 1. Migration Error Handling

**Strategy:**
- Create rollback scripts for each migration phase
- Implement comprehensive logging during migration
- Use feature flags to enable/disable new code paths
- Maintain parallel implementations during transition

### 2. Runtime Error Handling

**Backend:**
```typescript
// Enhanced error handling with Winston
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });
    res.status(500).json({ message: 'Internal server error' });
});
```

**Frontend:**
```typescript
// Vue 3 global error handler
app.config.errorHandler = (err, instance, info) => {
    console.error('Global error:', err);
    console.error('Component:', instance);
    console.error('Error info:', info);
    
    // Send to error tracking service
    errorTracker.captureException(err);
};
```

### 3. Database Migration Errors

**Rollback Strategy:**
```typescript
// TypeORM 0.3.x migration with transaction
export class Migration1234567890 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.startTransaction();
        try {
            // Migration logic
            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
    }
    
    public async down(queryRunner: QueryRunner): Promise<void> {
        // Rollback logic
    }
}
```

## Testing Strategy

### 1. Backend Testing

**Framework:** Vitest (modern, fast, ESM-native)

```typescript
// Example: User authentication test
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AppDataSource } from '../data-source';
import { UserService } from '../services/UserService';

describe('UserService', () => {
    beforeAll(async () => {
        await AppDataSource.initialize();
    });
    
    afterAll(async () => {
        await AppDataSource.destroy();
    });
    
    it('should hash password correctly', async () => {
        const service = new UserService();
        const password = 'testPassword123';
        const hash = await service.hashPassword(password);
        
        expect(hash).not.toBe(password);
        expect(await service.verifyPassword(password, hash)).toBe(true);
    });
});
```

### 2. Frontend Testing

**Framework:** Vitest + Vue Test Utils

```typescript
// Example: Component test with Pinia
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import LoginForm from '@/components/LoginForm.vue';

describe('LoginForm', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });
    
    it('should emit login event with credentials', async () => {
        const wrapper = mount(LoginForm);
        
        await wrapper.find('input[type="text"]').setValue('testuser');
        await wrapper.find('input[type="password"]').setValue('password');
        await wrapper.find('form').trigger('submit');
        
        expect(wrapper.emitted('login')).toBeTruthy();
    });
});
```

### 3. Integration Testing

**Strategy:**
- Test critical user flows end-to-end
- Use Playwright or Cypress for E2E tests
- Test API endpoints with supertest
- Validate database operations

### 4. Migration Validation Tests

**Checklist:**
- [ ] All existing API endpoints return expected responses
- [ ] Authentication flow works correctly
- [ ] File upload functionality preserved
- [ ] WebSocket connections stable
- [ ] Photo gallery displays correctly
- [ ] Forum posting and reading works
- [ ] AGPA voting system functional
- [ ] User permissions enforced correctly

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

1.1 WHEN the Backend-API starts THEN the system SHALL run on Node.js version 20.x LTS or higher
  Thoughts: This is verifiable by checking process.version at runtime. We can test this across different environments.
  Testable: yes - example

1.2 WHEN TypeScript code is compiled THEN the system SHALL use TypeScript version 5.x or higher
  Thoughts: This is a build-time check. We can verify the TypeScript version in package.json and during compilation.
  Testable: yes - example

1.3 WHEN the Backend-API uses TypeORM THEN the system SHALL use TypeORM version 0.3.x with updated syntax
  Thoughts: This requires checking that all TypeORM usage follows 0.3.x patterns (DataSource instead of createConnection, etc.)
  Testable: yes - property

1.4 WHEN Express middleware processes requests THEN the system SHALL use Express version 4.19.x or higher with security patches
  Thoughts: Version check in package.json and runtime verification
  Testable: yes - example

1.5 WHEN the Backend-API handles file uploads THEN the system SHALL use maintained alternatives to deprecated packages
  Thoughts: This is about ensuring we're not using deprecated packages. Can be verified through dependency audit.
  Testable: yes - example

2.1 WHEN the Database-Layer connects to PostgreSQL THEN the system SHALL support PostgreSQL version 16.x
  Thoughts: Can test connection to PostgreSQL 16.x and verify compatibility
  Testable: yes - example

2.3 WHEN the system performs database operations THEN the system SHALL use the pg driver version 8.12.x or higher
  Thoughts: Version check in dependencies
  Testable: yes - example

2.5 WHEN existing data is migrated THEN the system SHALL preserve all data integrity and relationships
  Thoughts: This is a critical property - for any data in the old system, after migration, all relationships and data should be intact
  Testable: yes - property

3.1 WHEN the Frontend-Client is built THEN the system SHALL use Vue.js version 3.4.x or higher
  Thoughts: Version check in package.json
  Testable: yes - example

3.2 WHEN the Frontend-Client uses a build tool THEN the system SHALL use Vite instead of Vue CLI
  Thoughts: Check build configuration and scripts
  Testable: yes - example

3.3 WHEN the Frontend-Client manages state THEN the system SHALL use Pinia instead of Vuex 3
  Thoughts: Verify no Vuex imports and Pinia is configured
  Testable: yes - example

3.6 WHEN Vue components are written THEN the system SHALL support both Options API and Composition API syntax
  Thoughts: Test that components using both syntaxes work correctly
  Testable: yes - property

4.1 WHEN npm audit is executed THEN the system SHALL report zero high or critical Security-Vulnerabilities
  Thoughts: This is a specific check we can run
  Testable: yes - example

4.4 WHEN the Frontend-Client makes HTTP requests THEN the system SHALL use axios version 1.7.x or higher
  Thoughts: Version check
  Testable: yes - example

4.6 WHEN the system handles file uploads THEN the system SHALL validate file types and sizes to prevent attacks
  Thoughts: For any file upload, the system should reject invalid file types and oversized files
  Testable: yes - property

4.7 WHEN the system stores passwords THEN the system SHALL use strong hashing with appropriate salt rounds
  Thoughts: For any password, the stored hash should use bcrypt with sufficient rounds
  Testable: yes - property

6.1 WHEN Vue 2 components are migrated THEN the system SHALL maintain Backward-Compatibility of all features
  Thoughts: For any feature that worked in Vue 2, it should work in Vue 3
  Testable: yes - property

6.2 WHEN Vuex store is migrated to Pinia THEN the system SHALL preserve all state management logic
  Thoughts: For any state operation that worked with Vuex, it should work with Pinia
  Testable: yes - property

6.3 WHEN TypeORM entities are updated THEN the system SHALL maintain all database relationships and queries
  Thoughts: For any query that worked with TypeORM 0.2.x, it should work with 0.3.x
  Testable: yes - property

8.1 WHEN critical user flows are tested THEN the system SHALL provide automated tests covering authentication, photo upload, and forum posting
  Thoughts: This is about test coverage existing
  Testable: yes - example

8.5 WHEN the migration is complete THEN the system SHALL pass all existing functional tests
  Thoughts: All tests that passed before should pass after
  Testable: yes - property

10.3 WHEN the database is migrated THEN the system SHALL create a backup before applying migrations
  Thoughts: Before any migration, a backup should exist
  Testable: yes - property

### Property 1: TypeORM DataSource API consistency
*For any* database operation in the migrated codebase, the system should use the TypeORM 0.3.x DataSource API pattern instead of the deprecated createConnection pattern
**Validates: Requirements 1.3**

### Property 2: Data migration integrity
*For any* entity record that exists before migration, after migration the record should exist with all its relationships intact and all field values preserved
**Validates: Requirements 2.5**

### Property 3: Vue component backward compatibility
*For any* user-facing feature that was functional in the Vue 2 version, the same feature should be functional in the Vue 3 version with equivalent behavior
**Validates: Requirements 6.1**

### Property 4: State management preservation
*For any* state mutation or action that worked in Vuex, an equivalent operation should work in Pinia with the same observable effects
**Validates: Requirements 6.2**

### Property 5: Database query compatibility
*For any* TypeORM query that successfully executed with version 0.2.x, an equivalent query should execute successfully with version 0.3.x and return equivalent results
**Validates: Requirements 6.3**

### Property 6: File upload validation
*For any* file upload attempt, if the file type is not in the allowed list or the file size exceeds the limit, the system should reject the upload with an appropriate error message
**Validates: Requirements 4.6**

### Property 7: Password hashing strength
*For any* password stored in the system, the hash should be generated using bcrypt with at least 10 salt rounds
**Validates: Requirements 4.7**

### Property 8: Functional test preservation
*For any* automated test that passed before the migration, the same test should pass after the migration (or be updated to reflect intentional API changes)
**Validates: Requirements 8.5**

### Property 9: Database backup before migration
*For any* database migration operation, a complete backup of the database should be created and verified before the migration is applied
**Validates: Requirements 10.3**

## Implementation Phases

### Phase 1: Backend Foundation (Week 1-2)

**Goals:**
- Upgrade Node.js to 20.x LTS
- Update TypeScript to 5.x
- Migrate TypeORM to 0.3.x
- Update security-critical dependencies

**Deliverables:**
- Updated package.json with new versions
- Migrated TypeORM DataSource configuration
- Updated all entity files
- All backend tests passing

### Phase 2: Database Migration (Week 2-3)

**Goals:**
- Test PostgreSQL 16.x compatibility
- Update PostGIS to 3.4.x
- Validate all migrations
- Create backup/restore procedures

**Deliverables:**
- PostgreSQL 16.x running
- All migrations tested
- Backup scripts
- Rollback procedures documented

### Phase 3: Frontend Core (Week 3-5)

**Goals:**
- Migrate to Vue 3 using compatibility build
- Replace Vue CLI with Vite
- Migrate Vuex to Pinia
- Update Vue Router to v4

**Deliverables:**
- Vite configuration working
- All stores migrated to Pinia
- Router updated to v4
- Core app functionality working

### Phase 4: Frontend UI (Week 5-7)

**Goals:**
- Migrate Vuetify 2 to Vuetify 3
- Update all UI components
- Fix styling issues
- Update third-party UI libraries

**Deliverables:**
- All components using Vuetify 3
- UI/UX consistent with original
- All pages rendering correctly
- Responsive design maintained

### Phase 5: Testing & Validation (Week 7-8)

**Goals:**
- Run full test suite
- Perform manual testing of critical flows
- Fix any remaining issues
- Performance testing

**Deliverables:**
- All automated tests passing
- Manual test checklist completed
- Performance benchmarks met
- Security audit clean

### Phase 6: Documentation & Deployment (Week 8-9)

**Goals:**
- Update all documentation
- Create deployment guides
- Prepare production deployment
- Train team on new stack

**Deliverables:**
- Migration guide complete
- Deployment documentation
- Rollback procedures tested
- Team training completed

## Security Considerations

### 1. Dependency Vulnerabilities

**Critical Updates:**
- axios: 0.21.4 → 1.7.x (fixes multiple CVEs)
- jsonwebtoken: 8.5.1 → 9.0.x (fixes CVE-2022-23529)
- express: 4.17.2 → 4.19.x (security patches)

### 2. Authentication Hardening

**Improvements:**
- Implement JWT refresh tokens
- Add rate limiting on auth endpoints
- Implement account lockout after failed attempts
- Add CSRF protection
- Implement secure session management

### 3. Input Validation

**Enhancements:**
- Use class-validator for all DTOs
- Implement file upload restrictions
- Add SQL injection protection (TypeORM parameterized queries)
- Sanitize user inputs
- Implement XSS protection

### 4. Security Headers

**Add Helmet.js:**
```typescript
import helmet from 'helmet';
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
```

## Performance Considerations

### 1. Build Performance

**Vite Benefits:**
- Cold start: ~2-3x faster than Webpack
- HMR: ~10x faster updates
- Production build: Similar or faster

### 2. Runtime Performance

**Vue 3 Benefits:**
- Smaller bundle size (~41% smaller)
- Faster rendering (Proxy-based reactivity)
- Better TypeScript support
- Tree-shaking improvements

### 3. Database Performance

**PostgreSQL 16.x Benefits:**
- Improved query parallelism
- Better JSON performance
- Enhanced indexing

## Rollback Strategy

### 1. Version Control

**Git Strategy:**
- Create migration branch
- Tag each phase completion
- Maintain main branch stable
- Use feature flags for gradual rollout

### 2. Database Rollback

**Procedure:**
```bash
# Backup before migration
pg_dump -U postgres absg5 > backup_pre_migration.sql

# If rollback needed
psql -U postgres absg5 < backup_pre_migration.sql
```

### 3. Application Rollback

**Docker Strategy:**
- Keep previous Docker images tagged
- Use blue-green deployment
- Implement health checks
- Automated rollback on failure

### 4. Data Migration Rollback

**TypeORM:**
```bash
# Revert last migration
npm run typeorm migration:revert

# Revert to specific migration
npm run typeorm migration:revert -- -t 1234567890
```

## Monitoring and Observability

### 1. Application Monitoring

**Tools:**
- Winston for structured logging
- PM2 for process management
- Health check endpoints
- Performance metrics

### 2. Error Tracking

**Implementation:**
- Centralized error logging
- Stack trace capture
- User context in errors
- Error rate alerting

### 3. Performance Monitoring

**Metrics:**
- API response times
- Database query performance
- Frontend load times
- WebSocket connection stability

## Conclusion

Cette migration représente une modernisation complète de la stack AbsG5. L'approche progressive par phases permet de minimiser les risques tout en assurant une transition en douceur. Les propriétés de correctness définies garantissent que toutes les fonctionnalités existantes seront préservées tout en bénéficiant des améliorations de sécurité, performance et maintenabilité des nouvelles versions.
