# Current State Documentation - AbsG5

**Date**: 2025-11-22  
**Branch**: migration/modernization-stack  
**Pre-Migration Tag**: v5.2.0-pre-migration (to be created)

## Project Structure

```
AbsG5/
├── absg-client/          # Frontend Vue.js 2 application
├── absg-core/            # Backend Node.js/TypeScript API
├── absg-e2e/             # End-to-end tests (Cypress)
├── docs/                 # Project documentation
├── install/              # Installation scripts and configs
├── scripts/              # Migration scripts (NEW)
└── .kiro/specs/          # Migration specifications (NEW)
```

## Backend (absg-core)

### Current Stack
- **Node.js**: 14.x-16.x (End of Life)
- **TypeScript**: 4.5.5
- **Express**: 4.17.2
- **TypeORM**: 0.2.41
- **PostgreSQL Driver (pg)**: 8.7.3
- **Database**: PostgreSQL 9.7+ (End of Life)

### Key Dependencies
```json
{
  "dependencies": {
    "async-mutex": "^0.3.2",
    "bcrypt": "^5.0.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.13.2",
    "date-fns": "^2.28.0",
    "express": "^4.17.2",
    "express-fileupload": "^1.3.1",
    "jimp": "^0.16.1",
    "jsonwebtoken": "^8.5.1",
    "morgan": "^1.10.0",
    "nodemailer": "^6.7.2",
    "pg": "^8.7.3",
    "routing-controllers": "^0.9.0",
    "typeorm": "^0.2.41",
    "winston": "^3.5.1",
    "ws": "^8.4.2"
  }
}
```

### Security Vulnerabilities (npm audit)
- ⚠️ **jsonwebtoken 8.5.1**: CVE-2022-23529 (High)
- ⚠️ **express 4.17.2**: Multiple security patches needed
- ⚠️ Multiple transitive dependencies with known vulnerabilities

### File Structure
```
absg-core/
├── src/
│   ├── api.ts                 # Main application entry
│   ├── controllers/           # API route controllers
│   ├── entities/              # TypeORM entities
│   ├── middleware/            # Express middleware
│   └── services/              # Business logic services
├── data/                      # Data files
├── ormconfig.js              # TypeORM configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

### Key Entities
- User
- Person
- Photo
- PhotoAlbum
- Forum
- ForumTopic
- ForumMessage
- Citation
- EventG
- Place
- AgpaCategory
- AgpaPhoto
- AgpaVote

## Frontend (absg-client)

### Current Stack
- **Vue.js**: 2.6.14
- **Vuetify**: 2.6.3
- **Vuex**: 3.6.2
- **Vue Router**: 2.0.0
- **Build Tool**: Vue CLI 4.5.15 (Webpack)
- **Axios**: 0.21.4 (VULNERABLE)

### Key Dependencies
```json
{
  "dependencies": {
    "axios": "^0.21.4",
    "core-js": "^3.21.0",
    "cropperjs": "^1.5.12",
    "date-fns": "^2.28.0",
    "highcharts": "^9.3.3",
    "highcharts-vue": "^1.4.0",
    "leaflet": "^1.7.1",
    "localforage": "^1.10.0",
    "tiptap-vuetify": "^2.24.0",
    "vue": "^2.6.14",
    "vue-native-websocket": "^2.0.15",
    "vue-router": "^2.0.0",
    "vue2-leaflet": "^2.7.1",
    "vuedraggable": "^2.24.3",
    "vuetify": "^2.6.3",
    "vuex": "^3.6.2",
    "webdav": "^4.8.0"
  }
}
```

### Security Vulnerabilities
- ⚠️ **axios 0.21.4**: Multiple CVEs (High/Critical)
- ⚠️ Multiple outdated dependencies with security issues

### File Structure
```
absg-client/
├── src/
│   ├── main.js               # Application entry
│   ├── App.vue               # Root component
│   ├── router.js             # Vue Router configuration
│   ├── store.js              # Vuex store
│   ├── views/                # Page components
│   │   ├── Admin/
│   │   ├── Agenda/
│   │   ├── Agpa/
│   │   ├── Citations/
│   │   ├── Forum/
│   │   ├── Gtheque/
│   │   ├── Photos/
│   │   └── User/
│   ├── components/           # Reusable components
│   ├── middleware/           # Helper functions
│   └── plugins/              # Vue plugins
├── public/                   # Static assets
├── vue.config.js            # Vue CLI configuration
└── package.json             # Dependencies
```

### Key Features
1. **Authentication**: JWT-based with bcrypt password hashing
2. **Photo Management**: Upload, gallery, albums, metadata editing
3. **Forum**: Topics, messages, rich text editing
4. **AGPA**: Photo contest with voting system
5. **Agenda**: Events, locations, genealogy
6. **Citations**: Quote management
7. **G-Thèque**: File collections
8. **Real-time**: WebSocket connections

## Database

### Current Configuration
- **PostgreSQL**: 9.7+ (End of Life - released 2017)
- **PostGIS**: Unknown version (needs verification)
- **Connection**: Via TypeORM 0.2.41

### Schema Overview
- Users and authentication
- Photo metadata and albums
- Forum structure
- AGPA contest data
- Events and locations
- Citations
- File collections

### Migration Status
- TypeORM migrations exist in `absg-core/src/migrations/`
- Need to verify compatibility with PostgreSQL 16.x

## Development Environment

### Current Setup
- **OS**: Windows
- **Shell**: PowerShell
- **Git**: Configured
- **IDE**: VS Code (assumed)

### Required Installations for Migration
- [ ] Node.js 20.x LTS
- [ ] PostgreSQL 16.x
- [ ] PostGIS 3.4.x

## Known Issues

### Backend
1. Using EOL Node.js version (security risk)
2. TypeORM 0.2.x uses deprecated API
3. Multiple security vulnerabilities in dependencies
4. express-fileupload is less maintained (should migrate to multer)

### Frontend
1. Vue 2 is in maintenance mode (EOL Dec 2023)
2. Vue CLI is deprecated (replaced by Vite)
3. Vuex 3 is replaced by Pinia for Vue 3
4. Multiple Vue 2-specific libraries need Vue 3 alternatives
5. Critical security vulnerabilities in axios

### Database
1. PostgreSQL 9.7 is EOL (no security updates)
2. PostGIS version unknown
3. Need to test migration compatibility

## Migration Readiness

### Completed ✅
- [x] Migration branch created
- [x] Spec documents created (requirements, design, tasks)
- [x] Backup scripts created
- [x] Restore scripts created
- [x] Rollback scripts created
- [x] Documentation prepared

### Pending ⏳
- [ ] Pre-migration tag created
- [ ] Database backup created
- [ ] Node.js 20.x installed
- [ ] PostgreSQL 16.x installed
- [ ] Team notified

## Risk Assessment

### High Risk
1. **TypeORM 0.2 → 0.3**: Major breaking changes in API
2. **Vue 2 → Vue 3**: Significant component rewrites needed
3. **Vuetify 2 → 3**: Complete UI library rewrite
4. **Data Migration**: Must preserve all data integrity

### Medium Risk
1. **PostgreSQL upgrade**: Schema compatibility
2. **WebSocket migration**: Connection stability
3. **Third-party libraries**: Vue 3 compatibility

### Low Risk
1. **Node.js upgrade**: Mostly backward compatible
2. **TypeScript upgrade**: Incremental improvements
3. **Express upgrade**: Minor version bump

## Success Metrics

### Technical
- Zero high/critical security vulnerabilities
- All tests passing
- Performance equal or better than current
- All features functional

### Business
- Zero data loss
- Minimal downtime
- User experience maintained
- Team can maintain new stack

## Next Steps

1. **Immediate**:
   - Create pre-migration git tag
   - Create database backup
   - Install Node.js 20.x
   - Install PostgreSQL 16.x

2. **Phase 1** (Week 1-2):
   - Update backend to Node.js 20.x
   - Migrate TypeORM to 0.3.x
   - Fix security vulnerabilities

3. **Phase 2** (Week 2-3):
   - Upgrade PostgreSQL to 16.x
   - Test all migrations
   - Verify data integrity

4. **Phase 3** (Week 3-5):
   - Migrate to Vue 3
   - Set up Vite
   - Migrate to Pinia

5. **Phase 4** (Week 5-7):
   - Migrate to Vuetify 3
   - Update all components
   - Fix UI issues

6. **Phase 5** (Week 7-8):
   - Comprehensive testing
   - Security audit
   - Performance testing

7. **Phase 6** (Week 8-9):
   - Documentation
   - Deployment preparation
   - Production rollout

---

**Document Status**: Complete  
**Last Updated**: 2025-11-22  
**Next Review**: After Phase 1 completion
