# ABSG-CORE

> API backend pour l'application Absolument G - Node.js 20 + TypeScript 5 + TypeORM 0.3

## Stack Technique

- **Runtime**: Node.js 20.x LTS
- **Language**: TypeScript 5.x
- **Framework**: Express 4.19.x
- **ORM**: TypeORM 0.3.x (DataSource API)
- **Database**: PostgreSQL 16.x + PostGIS 3.4.x
- **Authentication**: JWT (jsonwebtoken 9.x) + bcrypt 5.x
- **Security**: helmet, express-rate-limit, CORS
- **WebSocket**: ws 8.18.x
- **Logging**: winston 3.x
- **Testing**: Vitest 4.x

## Prérequis

- Node.js 20.x LTS
- PostgreSQL 16.x avec extension PostGIS 3.4.x
- npm ou yarn

## Installation

```bash
# Installer les dépendances
npm install

# Copier et configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Créer la base de données
createdb -U postgres absg5
psql -U postgres -d absg5 -c "CREATE EXTENSION postgis;"

# Lancer les migrations
npm run migration:run
```

## Configuration (.env)

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
JWT_SECRET=your_jwt_secret_here
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:5173

# Files
PATH_FILES=./data/files

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

## Scripts Disponibles

### Développement
```bash
npm run dev          # Serveur avec hot-reload (nodemon)
npm run build        # Compile TypeScript
npm start            # Serveur de production
```

### Tests
```bash
npm test             # Tests en mode watch
npm run test:run     # Tests en mode single run
npm run test:ui      # Interface UI pour les tests
npm run test:coverage # Tests avec coverage
```

### Base de Données
```bash
npm run migration:generate -- -n MigrationName  # Génère une migration
npm run migration:run                           # Exécute les migrations
npm run migration:revert                        # Annule la dernière migration
```

## Structure du Projet

```
absg-core/
├── src/
│   ├── controllers/      # API endpoints (routing-controllers)
│   │   ├── AuthController.ts
│   │   ├── UserController.ts
│   │   ├── PhotoController.ts
│   │   ├── ForumController.ts
│   │   ├── AgpaController.ts
│   │   └── ...
│   ├── entities/         # TypeORM entities
│   │   ├── User.ts
│   │   ├── Photo.ts
│   │   ├── Forum.ts
│   │   └── ...
│   ├── services/         # Business logic
│   │   ├── UserService.ts
│   │   ├── PhotoService.ts
│   │   └── ...
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts
│   │   ├── logger.ts
│   │   └── ...
│   ├── data-source.ts    # TypeORM DataSource configuration
│   └── api.ts            # Main entry point
├── test/
│   ├── setup.ts          # Test configuration
│   ├── example.test.ts   # Example tests
│   ├── integration/      # Integration tests
│   └── helpers/          # Test helpers
├── data/                 # Data files (uploads, etc.)
├── .env                  # Environment variables
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/check` - Check session
- `POST /api/auth/logout` - Logout
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `PUT /api/users/profile` - Update profile
- `POST /api/users/change-pwd` - Change password

### Photos
- `GET /api/photos` - List photos
- `POST /api/photos/upload` - Upload photo
- `GET /api/photos/:id` - Get photo
- `PUT /api/photos/:id` - Update photo
- `DELETE /api/photos/:id` - Delete photo

### Forum
- `GET /api/forum/topics` - List topics
- `POST /api/forum/topics` - Create topic
- `GET /api/forum/topics/:id` - Get topic
- `POST /api/forum/topics/:id/reply` - Reply to topic

### AGPA
- `GET /api/agpa` - Get AGPA metadata
- `GET /api/agpa/edition/:year` - Get edition
- `POST /api/agpa/submit` - Submit photo
- `POST /api/agpa/vote` - Submit votes

Voir les contrôleurs pour la liste complète des endpoints.

## Sécurité

### Authentification
- JWT tokens avec expiration
- Refresh tokens
- Password hashing avec bcrypt (10 rounds)
- Session management

### Protection
- Helmet (security headers)
- Rate limiting (100 req/15min)
- CORS configuré
- Input validation
- SQL injection protection (TypeORM)
- XSS protection

### Audit
Voir [SECURITY_AUDIT.md](../.kiro/specs/modernization-stack/SECURITY_AUDIT.md)

## Tests

### Structure des Tests
```
test/
├── setup.ts              # Configuration Vitest
├── example.test.ts       # Tests d'exemple
├── integration/          # Tests d'intégration
│   └── auth.test.ts
└── helpers/              # Helpers de test
    └── testApp.ts
```

### Écrire des Tests
```typescript
import { describe, it, expect } from 'vitest'

describe('Example Test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2)
  })
})
```

### Lancer les Tests
```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # Avec coverage
```

## Déploiement

### Production avec PM2
```bash
# Build
npm run build

# Démarrer avec PM2
pm2 start npm --name "absg-api" -- start

# Logs
pm2 logs absg-api

# Monitoring
pm2 monit
```

### Docker
```bash
# Build image
docker build -t absg-core .

# Run container
docker run -p 3000:3000 --env-file .env absg-core
```

### Variables d'Environnement Production
```bash
NODE_ENV=production
PORT=3000
DB_HOST=your_db_host
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password
DB_DATABASE=absg5
JWT_SECRET=your_very_secure_jwt_secret
CORS_ORIGIN=https://absolumentg.fr
```

## Logging

Les logs sont gérés par Winston et stockés dans :
- `logs/error.log` - Erreurs uniquement
- `logs/combined.log` - Tous les logs
- Console - En développement

Configuration dans `src/middleware/logger.ts`

## Migrations TypeORM

### Créer une Migration
```bash
npm run migration:generate -- -n AddUserRole
```

### Exécuter les Migrations
```bash
npm run migration:run
```

### Annuler une Migration
```bash
npm run migration:revert
```

## Dépendances Principales

### Production
- `express` - HTTP server
- `typeorm` - ORM
- `pg` - PostgreSQL client
- `reflect-metadata` - Decorators support
- `routing-controllers` - Controller-based routing
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT authentication
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `winston` - Logging
- `axios` - HTTP client
- `date-fns` - Date manipulation
- `ws` - WebSocket

### Développement
- `typescript` - TypeScript compiler
- `vitest` - Testing framework
- `nodemon` - Auto-reload
- `eslint` - Linting

## Troubleshooting

### Database Connection Error
```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql

# Vérifier les credentials dans .env
# Vérifier que la base existe
psql -U postgres -l
```

### TypeORM Migration Error
```bash
# Synchroniser le schéma (dev only)
# Ajouter dans data-source.ts: synchronize: true

# Ou recréer la base
dropdb -U postgres absg5
createdb -U postgres absg5
psql -U postgres -d absg5 -c "CREATE EXTENSION postgis;"
npm run migration:run
```

### Port Already in Use
```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

## Documentation

- [Migration Guide](../.kiro/specs/modernization-stack/MIGRATION_GUIDE.md)
- [Security Audit](../.kiro/specs/modernization-stack/SECURITY_AUDIT.md)
- [Performance Testing](../.kiro/specs/modernization-stack/PERFORMANCE_TESTING.md)

## Licence

Privé - Tous droits réservés

## Auteur

Olivier Gueudelot - [ikit](https://github.com/ikit)
