# Quick Start Guide - AbsG5 Modernization

## 🚀 Getting Started

This guide will help you begin the AbsG5 modernization migration.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js 20.x LTS** installed
  ```powershell
  node --version  # Should show v20.x.x
  ```

- [ ] **PostgreSQL 16.x** installed (for testing)
  ```powershell
  psql --version  # Should show 16.x
  ```

- [ ] **Git** configured
  ```powershell
  git --version
  ```

- [ ] **Code editor** ready (VS Code recommended)

- [ ] **Database access** credentials available

## Step 1: Prepare Your Environment

### 1.1 Create Migration Branch

```powershell
# Navigate to project root
cd C:\Users\ogueu\Documents\git\AbsG5\AbsG5

# Create and switch to migration branch
git checkout -b migration/modernization-stack

# Push to remote
git push -u origin migration/modernization-stack
```

### 1.2 Tag Current Version

```powershell
# Tag the current stable version
git tag -a v5.2.0-pre-migration -m "Stable version before modernization"

# Push tag to remote
git push origin v5.2.0-pre-migration
```

### 1.3 Create Database Backup

```powershell
# Run backup script
.\scripts\backup-database.ps1

# Verify backup was created
dir .\backups
```

**Expected output:**
```
absg5_backup_20251122_HHMMSS.sql
backup_manifest.json
```

## Step 2: Verify Current State

### 2.1 Check Backend

```powershell
cd absg-core

# Check Node.js version
node --version

# Install current dependencies
npm install

# Try to start (should work with old versions)
npm run dev
```

### 2.2 Check Frontend

```powershell
cd ..\absg-client

# Install current dependencies
npm install

# Try to start (should work with old versions)
npm run dev
```

### 2.3 Run Security Audit

```powershell
# Backend audit
cd ..\absg-core
npm audit

# Frontend audit
cd ..\absg-client
npm audit
```

**Note:** You should see multiple vulnerabilities - this is expected and will be fixed during migration.

## Step 3: Begin Phase 1 - Backend Foundation

### 3.1 Update Backend package.json

Open `absg-core/package.json` and prepare to update:

**Current versions:**
```json
{
  "devDependencies": {
    "@types/node": "^17.0.14",
    "typescript": "^4.5.5"
  },
  "dependencies": {
    "typeorm": "^0.2.41",
    "express": "^4.17.2",
    "bcrypt": "^5.0.1",
    "jsonwebtoken": "^8.5.1"
  }
}
```

**Target versions (Phase 1):**
```json
{
  "engines": {
    "node": ">=20.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  },
  "dependencies": {
    "typeorm": "^0.3.17",
    "express": "^4.19.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2"
  }
}
```

### 3.2 Follow Task List

Open `.kiro/specs/modernization-stack/tasks.md` and follow tasks in order:

1. ✅ Task 1: Prepare migration environment (you're doing this now!)
2. ⏭️ Task 2: Update Node.js and TypeScript configuration
3. ⏭️ Task 3: Migrate TypeORM from 0.2.x to 0.3.x
4. ⏭️ Task 4: Update security-critical dependencies
5. ... and so on

## Step 4: Testing Strategy

### 4.1 After Each Task

```powershell
# Backend
cd absg-core
npm run build  # Should compile without errors
npm run dev    # Should start without errors

# Frontend (later phases)
cd absg-client
npm run build  # Should build without errors
npm run dev    # Should start without errors
```

### 4.2 Run Tests

```powershell
# Backend tests
cd absg-core
npm test

# Frontend tests
cd absg-client
npm test
```

## Step 5: Rollback (If Needed)

If something goes wrong:

```powershell
# Full rollback (database + code)
.\scripts\rollback-migration.ps1

# Or database only
.\scripts\rollback-migration.ps1 -DatabaseOnly

# Or code only
.\scripts\rollback-migration.ps1 -CodeOnly
```

## Phase Completion Checklist

### Phase 1: Backend Foundation ✓
- [ ] Node.js 20.x running
- [ ] TypeScript 5.x compiling
- [ ] TypeORM 0.3.x working
- [ ] Security vulnerabilities fixed
- [ ] All backend tests passing
- [ ] Backend starts without errors

### Phase 2: Database Migration ✓
- [ ] PostgreSQL 16.x installed
- [ ] Database migrations tested
- [ ] Data integrity verified
- [ ] Backup/restore working

### Phase 3: Frontend Core ✓
- [ ] Vue 3 running
- [ ] Vite building
- [ ] Pinia stores working
- [ ] Vue Router 4 working

### Phase 4: Frontend UI ✓
- [ ] Vuetify 3 integrated
- [ ] All components migrated
- [ ] UI consistent
- [ ] All pages rendering

### Phase 5: Testing ✓
- [ ] All tests passing
- [ ] Security audit clean
- [ ] Performance acceptable
- [ ] Manual testing complete

### Phase 6: Deployment ✓
- [ ] Documentation updated
- [ ] Deployment scripts ready
- [ ] Production deployed
- [ ] Monitoring active

## Common Issues & Solutions

### Issue: "Cannot find module 'typeorm'"
**Solution:** Run `npm install` in the backend directory

### Issue: "TypeScript compilation errors"
**Solution:** Check tsconfig.json matches the design document specifications

### Issue: "Database connection failed"
**Solution:** Verify PostgreSQL is running and credentials are correct

### Issue: "npm audit shows vulnerabilities"
**Solution:** This is expected initially - they will be fixed in Phase 1, Task 4

## Getting Help

1. **Review Documentation:**
   - Requirements: `.kiro/specs/modernization-stack/requirements.md`
   - Design: `.kiro/specs/modernization-stack/design.md`
   - Tasks: `.kiro/specs/modernization-stack/tasks.md`

2. **Check Migration Preparation:**
   - `.kiro/specs/modernization-stack/MIGRATION_PREPARATION.md`

3. **Review Scripts:**
   - `scripts/README.md`

## Next Steps

You're now ready to begin! Start with:

1. ✅ Complete Step 1-2 above (environment preparation)
2. 📋 Open `.kiro/specs/modernization-stack/tasks.md`
3. 🚀 Begin Task 2: "Update Node.js and TypeScript configuration"

Good luck with the migration! 🎉

---

**Remember:**
- Take it one phase at a time
- Test thoroughly after each task
- Keep regular backups
- Don't hesitate to rollback if needed
- Document any issues or deviations

**Last Updated**: 2025-11-22
