# Quick Start - Migration Preparation

This guide provides quick commands to prepare for the AbsG5 modernization migration.

## ✅ Completed Steps

- [x] Created migration branch: `migration/modernization-stack`
- [x] Documented current system configuration
- [x] Created backup scripts
- [x] Created restore scripts
- [x] Created rollback scripts
- [x] Updated .gitignore for backups

## 📋 Pre-Migration Checklist

Before proceeding with the migration, complete these steps:

### 1. Verify Environment

```powershell
# Check Node.js version
node --version

# Check npm version
npm --version

# Check PostgreSQL version
psql --version

# Check Git status
git status
git branch  # Should show: migration/modernization-stack
```

### 2. Configure Environment Variables

Ensure `.env` file exists with database credentials:

```env
DB_TYPE_DEFAULT=postgres
DB_HOST_DEFAULT=localhost
DB_PORT_DEFAULT=5432
DB_USER_DEFAULT=your_db_user
DB_PASSWORD_DEFAULT=your_db_password
DB_NAME_DEFAULT=absg5
```

### 3. Create Database Backup

```powershell
# Create backup (REQUIRED before migration)
.\scripts\backup-database.ps1

# Note the backup path from output
# Example: backups/pre-migration-20251122-143022
```

### 4. Verify Backup

```powershell
# Check backup files exist
Get-ChildItem backups\pre-migration-* -Recurse

# Review backup manifest
Get-Content backups\pre-migration-*\BACKUP_MANIFEST.txt
```

### 5. Test Backup Restoration (Recommended)

```powershell
# Test in staging environment or test database
# See scripts/README.md for detailed instructions
```

## 🚀 Ready to Migrate

Once all checklist items are complete:

1. **Review the migration plan:**
   - Read: `.kiro/specs/modernization-stack/requirements.md`
   - Read: `.kiro/specs/modernization-stack/design.md`
   - Read: `.kiro/specs/modernization-stack/tasks.md`

2. **Start with Task 2:**
   ```
   Task 2: Update Node.js and TypeScript configuration
   ```

3. **Keep backup path handy for rollback:**
   ```
   Backup: backups/pre-migration-YYYYMMDD-HHMMSS
   ```

## 🔄 If Rollback Needed

```powershell
# Full rollback (code + database)
.\scripts\rollback-migration.ps1 -BackupPath "backups\pre-migration-YYYYMMDD-HHMMSS" -Force
```

## 📚 Documentation

- **Full preparation guide:** `.kiro/specs/modernization-stack/MIGRATION_PREPARATION.md`
- **Script documentation:** `scripts/README.md`
- **Requirements:** `.kiro/specs/modernization-stack/requirements.md`
- **Design:** `.kiro/specs/modernization-stack/design.md`
- **Tasks:** `.kiro/specs/modernization-stack/tasks.md`

## ⚠️ Important Notes

1. **Backup is mandatory** - Do not skip this step
2. **Test in staging first** if possible
3. **Keep backup for 30+ days** after successful migration
4. **Document any issues** encountered during migration
5. **Have rollback plan ready** before starting

## 🆘 Emergency Contacts

If you encounter critical issues during migration:

1. Stop the migration immediately
2. Run rollback script
3. Document the issue
4. Contact migration team

---

**Status:** Preparation Complete ✅  
**Next Step:** Task 2 - Update Node.js and TypeScript configuration  
**Date:** 2025-11-22
