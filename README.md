# AbsG5

5ème version du site web familial Absolument G. Cette version se base côté serveur sur [Node.js 20 LTS](https://nodejs.org/) avec [Express](https://expressjs.com/fr/) et [TypeORM](https://typeorm.io/), une base de données [PostgreSQL 16](https://www.postgresql.org/) avec [PostGIS 3.4](https://postgis.net/), et un client web [PWA](https://progressive-web-apps.fr/definition-progressive-web-apps-pwa) utilisant [Vue 3](https://vuejs.org/), [Pinia](https://pinia.vuejs.org/), [Vuetify 3](https://vuetifyjs.com/) et [Vite](https://vitejs.dev/).

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/6206e134936040318fee348b18de3486)](https://www.codacy.com/app/Ikit/AbsG5?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ikit/AbsG5&amp;utm_campaign=Badge_Grade) [![Build Status](https://travis-ci.org/ikit/AbsG5.svg?branch=master)](https://travis-ci.org/ikit/AbsG5)

## 🎉 Migration Complète vers Stack Moderne (2025)

Le projet a été entièrement migré vers des technologies modernes :
- ✅ **Backend**: Node.js 20 LTS, TypeScript 5, TypeORM 0.3, PostgreSQL 16
- ✅ **Frontend**: Vue 3, Pinia, Vuetify 3, Vite
- ✅ **Tests**: Vitest avec 63 tests unitaires
- ✅ **Sécurité**: Audit complet, 0 vulnérabilités critiques/high
- ✅ **Performance**: Build 10x plus rapide avec Vite

Voir [MIGRATION_GUIDE.md](.kiro/specs/modernization-stack/MIGRATION_GUIDE.md) pour les détails.

## Présentation

AbsG5 est une plateforme web familiale complète offrant :
- 👥 Gestion des utilisateurs et authentification sécurisée
- 📸 Galerie photos avec albums et métadonnées
- 💬 Forum de discussion
- 🏆 AGPA (concours photo annuel)
- 📅 Agenda et événements
- 📚 Bibliothèque (GThèque)
- 💭 Citations
- 🔔 Notifications en temps réel (WebSocket)

## Stack Technique

### Backend (absg-core)
- **Runtime**: Node.js 20.x LTS
- **Language**: TypeScript 5.x
- **Framework**: Express 4.19.x
- **ORM**: TypeORM 0.3.x
- **Database**: PostgreSQL 16.x + PostGIS 3.4.x
- **Authentication**: JWT (jsonwebtoken 9.x) + bcrypt 5.x
- **Security**: helmet, rate-limit, CORS
- **WebSocket**: ws 8.18.x
- **Testing**: Vitest 4.x

### Frontend (absg-client)
- **Framework**: Vue 3.4.x
- **State Management**: Pinia 2.x
- **Router**: Vue Router 4.x
- **UI Framework**: Vuetify 3.5.x
- **Build Tool**: Vite 5.x
- **HTTP Client**: axios 1.7.x
- **Rich Text**: TipTap (Vue 3)
- **Charts**: Highcharts
- **Testing**: Vitest 4.x + Vue Test Utils

## Installation

### Prérequis
- Node.js 20.x LTS
- PostgreSQL 16.x avec PostGIS 3.4.x
- npm ou yarn
- Git

### 1. Cloner le projet
```bash
git clone https://github.com/ikit/AbsG5.git
cd AbsG5
```

### 2. Backend Setup

```bash
cd absg-core

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Créer la base de données
createdb -U postgres absg5
psql -U postgres -d absg5 -c "CREATE EXTENSION postgis;"

# Lancer les migrations
npm run migration:run

# Démarrer le serveur
npm run dev  # Développement
npm start    # Production
```

### 3. Frontend Setup

```bash
cd absg-client

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Démarrer le serveur de développement
npm run dev

# Build pour production
npm run build
```

### 4. Tests

```bash
# Backend
cd absg-core
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # Avec coverage

# Frontend
cd absg-client
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # Avec coverage
```

## Configuration

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
JWT_SECRET=your_jwt_secret_here
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

## Déploiement

### Docker (Recommandé)

```bash
# Build images
docker-compose build

# Démarrer les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

### PM2 (Production)

```bash
# Backend
cd absg-core
pm2 start npm --name "absg-api" -- start

# Frontend (après build)
cd absg-client
npm run build
# Servir avec nginx ou autre serveur web
```

### Nginx Configuration

```nginx
# Frontend
server {
    listen 80;
    server_name absolumentg.fr;
    
    root /var/www/absg5/client/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Scripts Disponibles

### Backend
- `npm run dev` - Serveur de développement avec hot-reload
- `npm start` - Serveur de production
- `npm test` - Tests en mode watch
- `npm run test:run` - Tests en mode single run
- `npm run build` - Compile TypeScript
- `npm run migration:generate` - Génère une migration
- `npm run migration:run` - Exécute les migrations

### Frontend
- `npm run dev` - Serveur de développement Vite
- `npm run build` - Build de production
- `npm run preview` - Preview du build
- `npm test` - Tests en mode watch
- `npm run test:run` - Tests en mode single run
- `npm run lint` - Lint du code

## Documentation

- [Guide de Migration](.kiro/specs/modernization-stack/MIGRATION_GUIDE.md) - Migration Vue 2 → Vue 3
- [Audit de Sécurité](.kiro/specs/modernization-stack/SECURITY_AUDIT.md) - Rapport de sécurité
- [Tests de Performance](.kiro/specs/modernization-stack/PERFORMANCE_TESTING.md) - Guide de performance
- [Checklist de Tests](.kiro/specs/modernization-stack/MANUAL_TESTING_CHECKLIST.md) - Tests manuels
- [Backend README](absg-core/README.md) - Documentation backend
- [Frontend README](absg-client/README.md) - Documentation frontend

## Architecture

```
AbsG5/
├── absg-core/          # Backend Node.js + TypeScript
│   ├── src/
│   │   ├── controllers/  # API endpoints
│   │   ├── entities/     # TypeORM entities
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   └── api.ts        # Main entry point
│   └── test/            # Tests backend
│
├── absg-client/        # Frontend Vue 3 + Vite
│   ├── src/
│   │   ├── views/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── stores/       # Pinia stores
│   │   ├── router/       # Vue Router
│   │   └── main.js       # Main entry point
│   └── test/            # Tests frontend
│
├── docs/               # Documentation
├── install/            # Scripts d'installation
└── scripts/            # Scripts utilitaires
```

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

### Standards de Code

- **Backend**: TypeScript strict mode, ESLint
- **Frontend**: Vue 3 Composition API (optionnel), ESLint
- **Tests**: Vitest, minimum 80% coverage pour nouveau code
- **Commits**: Conventional Commits (feat:, fix:, docs:, etc.)

## Sécurité

- ✅ Authentification JWT sécurisée
- ✅ Mots de passe hashés avec bcrypt (rounds: 10)
- ✅ Headers de sécurité (helmet)
- ✅ Rate limiting (100 req/15min)
- ✅ CORS configuré
- ✅ Validation des entrées
- ✅ Protection CSRF
- ✅ Audit régulier des dépendances

Voir [SECURITY_AUDIT.md](.kiro/specs/modernization-stack/SECURITY_AUDIT.md) pour plus de détails.

## Performance

- ⚡ Vite: Build 10x plus rapide que Webpack
- ⚡ Vue 3: Rendu 2x plus rapide que Vue 2
- ⚡ Pinia: Plus léger que Vuex
- ⚡ PostgreSQL 16: Améliorations de performance
- ⚡ Node.js 20: V8 engine optimisé

## Licence

Ce projet est sous licence privée - voir le fichier LICENSE pour plus de détails.

## Auteurs

- **Olivier Gueudelot** - *Développeur principal* - [ikit](https://github.com/ikit)

## Remerciements

- La famille Absolument G pour le soutien et les tests
- La communauté Vue.js pour les excellents outils
- Tous les contributeurs open-source

---

**Version**: 5.2.0  
**Dernière mise à jour**: Novembre 2025  
**Status**: ✅ Production Ready
