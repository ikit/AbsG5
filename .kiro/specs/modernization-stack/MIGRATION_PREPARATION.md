# Migration Preparation - AbsG5 Modernization Stack

**Date:** 2025-11-22  
**Branch:** migration/modernization-stack  
**Status:** Preparation Phase

## Current System Configuration

### Backend (absg-core)

#### Core Dependencies
- **Node.js:** 14.x-16.x (to be verified in production)
- **TypeScript:** 4.5.5
- **Express:** 4.17.2
- **TypeORM:** 0.2.41
- **PostgreSQL Driver (pg):** 8.7.3

#### Security-Critical Dependencies
- **bcrypt:** 5.0.1
- **jsonwebtoken:** 8.5.1 ⚠️ VULNERABLE (CVE-2022-23529)
- **express-fileupload:** 1.3.1

#### Other Key Dependencies
- **winston:** 3.5.1
- **ws:** 8.4.2
- **date-fns:** 2.28.0
- **axios:** Not in backend package.json

#### TypeScript Configuration
```json
{
  "target": "es5",
  "module": "commonjs",
  "lib": ["es5", "es6"],
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```

### Frontend (absg-client)

#### Core Dependencies
- **Vue.js:** 2.6.14
- **Vuetify:** 2.6.3
- **Vuex:** 3.6.2
- **Vue Router:** 2.0.0
- **Vue CLI:** 4.5.15 (build tool)

#### Security-Critical Dependencies
- **axios:** 0.21.4 ⚠️ VULNERABLE (Multiple CVEs)

#### UI Libraries
- **highcharts:** 9.3.3
- **highcharts-vue:** 1.4.0
- **leaflet:** 1.7.1
- **vue2-leaflet:** 2.7.1
- **vuedraggable:** 2.24.3
- **tiptap-vuetify:** 2.24.0
- **cropperjs:** 1.5.12

#### Other Dependencies
- **date-fns:** 2.28.0
- **vue-native-websocket:** 2.0.15

### Database

#### Current Configuration (from ormconfig.js)
- **Type:** PostgreSQL
- **Version:** To be verified (likely 9.7-13.x based on pg_dump path)
- **PostGIS:** Version to be verified
- **Synchronize:** true (⚠️ should be false in production)
- **Logging:** false

## Target System Configuration

### Backend (absg-core)
- **Node.js:** 20.x LTS
- **TypeScript:** 5.x
- **Express:** 4.19.x
- **TypeORM:** 0.3.x
- **PostgreSQL Driver (pg):** 8.12.x
- **bcrypt:** 5.1.x
- **jsonwebtoken:** 9.0.x
- **ws:** 8.18.x
- **date-fns:** 3.x
- **winston:** 3.11.x

### Frontend (absg-client)
- **Vue.js:** 3.4.x
- **Vuetify:** 3.5.x
- **Pinia:** 2.x (replaces Vuex)
- **Vue Router:** 4.x
- **Vite:** 5.x (replaces Vue CLI)
- **axios:** 1.7.x
- **highcharts:** 11.x
- **date-fns:** 3.x

### Database
- **PostgreSQL:** 16.x
- **PostGIS:** 3.4.x

## Pre-Migration Checklist

- [x] Create migration branch: `migration/modernization-stack`
- [ ] Document current Node.js version in production
- [ ] Document current PostgreSQL version in production
- [ ] Create full database backup
- [ ] Test database backup restoration
- [ ] Document all environment variables
- [ ] Create rollback procedures
- [ ] Set up staging environment for testing

## Database Backup Procedures

### 1. Full Database Backup

#### Using pg_dump (Recommended)
```bash
# Set backup directory
$BACKUP_DIR = "backups/pre-migration-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Force -Path $BACKUP_DIR

# Full database backup
pg_dump -U $env:DB_USER_DEFAULT -h $env:DB_HOST_DEFAULT -p $env:DB_PORT_DEFAULT -F c -b -v -f "$BACKUP_DIR/absg5_full.backup" $env:DB_NAME_DEFAULT

# Plain SQL format (for easier inspection)
pg_dump -U $env:DB_USER_DEFAULT -h $env:DB_HOST_DEFAULT -p $env:DB_PORT_DEFAULT -F p -b -v -f "$BACKUP_DIR/absg5_full.sql" $env:DB_NAME_DEFAULT

# Schema only backup
pg_dump -U $env:DB_USER_DEFAULT -h $env:DB_HOST_DEFAULT -p $env:DB_PORT_DEFAULT -s -f "$BACKUP_DIR/absg5_schema.sql" $env:DB_NAME_DEFAULT

# Data only backup
pg_dump -U $env:DB_USER_DEFAULT -h $env:DB_HOST_DEFAULT -p $env:DB_PORT_DEFAULT -a -f "$BACKUP_DIR/absg5_data.sql" $env:DB_NAME_DEFAULT
```

#### Verify Backup
```bash
# Check backup file size
Get-Item "$BACKUP_DIR/absg5_full.backup" | Select-Object Name, Length, LastWriteTime

# List backup contents
pg_restore -l "$BACKUP_DIR/absg5_full.backup"
```

### 2. Application Files Backup

```bash
# Backup current application code
$APP_BACKUP_DIR = "backups/app-pre-migration-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Force -Path $APP_BACKUP_DIR

# Copy application directories
Copy-Item -Recurse absg-core "$APP_BACKUP_DIR/absg-core"
Copy-Item -Recurse absg-client "$APP_BACKUP_DIR/absg-client"

# Backup configuration files
Copy-Item .env "$APP_BACKUP_DIR/.env" -ErrorAction SilentlyContinue
Copy-Item absg-core/.env "$APP_BACKUP_DIR/absg-core.env" -ErrorAction SilentlyContinue
Copy-Item absg-client/.env "$APP_BACKUP_DIR/absg-client.env" -ErrorAction SilentlyContinue

# Create backup manifest
@"
Backup Created: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Git Branch: $(git branch --show-current)
Git Commit: $(git rev-parse HEAD)
Node Version: $(node --version)
NPM Version: $(npm --version)
"@ | Out-File "$APP_BACKUP_DIR/MANIFEST.txt"
```

### 3. Docker Volumes Backup (if using Docker)

```bash
# List Docker volumes
docker volume ls

# Backup PostgreSQL data volume
docker run --rm -v absg5_postgres_data:/data -v ${PWD}/backups:/backup alpine tar czf /backup/postgres_data_$(Get-Date -Format 'yyyyMMdd-HHmmss').tar.gz -C /data .

# Backup uploaded files volume (if exists)
docker run --rm -v absg5_uploads:/data -v ${PWD}/backups:/backup alpine tar czf /backup/uploads_$(Get-Date -Format 'yyyyMMdd-HHmmss').tar.gz -C /data .
```

## Database Restoration Procedures

### 1. Restore from Custom Format Backup

```bash
# Drop existing database (CAUTION!)
dropdb -U $env:DB_USER_DEFAULT -h $env:DB_HOST_DEFAULT -p $env:DB_PORT_DEFAULT $env:DB_NAME_DEFAULT

# Create new database
createdb -U $env:DB_USER_DEFAULT -h $env:DB_HOST_DEFAULT -p $env:DB_PORT_DEFAULT $env:DB_NAME_DEFAULT

# Restore from backup
pg_restore -U $env:DB_USER_DEFAULT -h $env:DB_HOST_DEFAULT -p $env:DB_PORT_DEFAULT -d $env:DB_NAME_DEFAULT -v "$BACKUP_DIR/absg5_full.backup"
```

### 2. Restore from SQL Format Backup

```bash
# Drop and recreate database
dropdb -U $env:DB_USER_DEFAULT -h $env:DB_HOST_DEFAULT -p $env:DB_PORT_DEFAULT $env:DB_NAME_DEFAULT
createdb -U $env:DB_USER_DEFAULT -h $env:DB_HOST_DEFAULT -p $env:DB_PORT_DEFAULT $env:DB_NAME_DEFAULT

# Restore from SQL file
psql -U $env:DB_USER_DEFAULT -h $env:DB_HOST_DEFAULT -p $env:DB_PORT_DEFAULT -d $env:DB_NAME_DEFAULT -f "$BACKUP_DIR/absg5_full.sql"
```

### 3. Verify Restoration

```bash
# Connect to database and verify
psql -U $env:DB_USER_DEFAULT -h $env:DB_HOST_DEFAULT -p $env:DB_PORT_DEFAULT -d $env:DB_NAME_DEFAULT

# Run verification queries
SELECT COUNT(*) FROM "user";
SELECT COUNT(*) FROM photo;
SELECT COUNT(*) FROM forum_topic;
# ... add more verification queries as needed
```

## Application Rollback Procedures

### 1. Git Rollback

```bash
# View current branch
git branch

# Return to main/master branch
git checkout master

# If changes were merged, revert the merge commit
git revert -m 1 <merge-commit-hash>

# Or reset to before migration (DESTRUCTIVE)
git reset --hard <commit-before-migration>
```

### 2. Dependency Rollback

```bash
# Backend rollback
cd absg-core
git checkout master -- package.json package-lock.json
npm ci

# Frontend rollback
cd ../absg-client
git checkout master -- package.json package-lock.json
npm ci
```

### 3. Database Rollback

```bash
# Restore from pre-migration backup
# See "Database Restoration Procedures" above
```

### 4. Docker Rollback (if using Docker)

```bash
# Stop current containers
docker-compose down

# Checkout previous docker-compose configuration
git checkout master -- docker-compose.yml install/docker-compose-base.yml

# Pull previous images
docker-compose pull

# Start with previous configuration
docker-compose up -d
```

## Migration Risk Assessment

### High Risk Areas
1. **TypeORM 0.2.x → 0.3.x**: Major breaking changes in API
2. **Vue 2 → Vue 3**: Significant component API changes
3. **Vuex → Pinia**: Complete state management rewrite
4. **PostgreSQL upgrade**: Potential data migration issues

### Medium Risk Areas
1. **Node.js 14/16 → 20**: Generally backward compatible
2. **Express 4.17 → 4.19**: Minor version, mostly security patches
3. **Vuetify 2 → 3**: UI component changes

### Low Risk Areas
1. **TypeScript 4.5 → 5.x**: Good backward compatibility
2. **Vue Router 2 → 4**: Well-documented migration path
3. **Dependency updates**: Most are minor/patch versions

## Rollback Decision Criteria

### Immediate Rollback Triggers
- Database corruption or data loss
- Authentication system failure
- Critical functionality completely broken
- Security vulnerability introduced
- Performance degradation > 50%

### Acceptable Issues (Fix Forward)
- Minor UI inconsistencies
- Non-critical feature bugs
- Performance degradation < 20%
- Deprecation warnings
- Test failures in non-critical paths

## Communication Plan

### Before Migration
- [ ] Notify all stakeholders of migration timeline
- [ ] Schedule maintenance window
- [ ] Prepare status page updates

### During Migration
- [ ] Post status updates every hour
- [ ] Document any issues encountered
- [ ] Keep rollback option ready

### After Migration
- [ ] Verify all critical functionality
- [ ] Monitor error logs for 24 hours
- [ ] Collect user feedback
- [ ] Document lessons learned

## Emergency Contacts

- **Database Administrator:** [To be filled]
- **DevOps Lead:** [To be filled]
- **Project Manager:** [To be filled]
- **On-Call Developer:** [To be filled]

## Next Steps

1. Execute database backup procedures
2. Test backup restoration in staging environment
3. Document production environment details
4. Begin Phase 1: Backend Foundation migration
5. Set up continuous monitoring during migration

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-22  
**Maintained By:** Migration Team
