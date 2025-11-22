# Migration Scripts - AbsG5 Modernization

This directory contains PowerShell scripts to facilitate the migration process, including backup, restoration, and rollback procedures.

## Prerequisites

- PowerShell 5.1 or higher
- PostgreSQL client tools (pg_dump, pg_restore, psql) in PATH
- Git installed and configured
- Node.js and npm installed
- Access to the database with appropriate credentials
- `.env` file configured with database connection details

## Environment Variables

Ensure your `.env` file (or `absg-core/.env`) contains:

```env
DB_TYPE_DEFAULT=postgres
DB_HOST_DEFAULT=localhost
DB_PORT_DEFAULT=5432
DB_USER_DEFAULT=your_db_user
DB_PASSWORD_DEFAULT=your_db_password
DB_NAME_DEFAULT=absg5
```

## Scripts Overview

### 1. backup-database.ps1

Creates a comprehensive backup of the PostgreSQL database before migration.

**Usage:**
```powershell
# Basic usage (creates backup in ./backups directory)
.\scripts\backup-database.ps1

# Specify custom backup directory
.\scripts\backup-database.ps1 -BackupDir "C:\backups\absg5"

# Skip verification step (faster)
.\scripts\backup-database.ps1 -SkipVerification
```

**What it does:**
- Creates timestamped backup directory
- Generates full database backup (custom format)
- Generates SQL format backup (human-readable)
- Generates schema-only backup
- Creates backup manifest with metadata
- Verifies backup integrity (optional)

**Output:**
```
backups/
  └── pre-migration-20251122-143022/
      ├── absg5_full.backup      # Custom format (for pg_restore)
      ├── absg5_full.sql         # SQL format (for psql)
      ├── absg5_schema.sql       # Schema only
      └── BACKUP_MANIFEST.txt    # Backup metadata
```

### 2. restore-database.ps1

Restores a PostgreSQL database from a backup file.

**Usage:**
```powershell
# Restore from custom format backup
.\scripts\restore-database.ps1 -BackupFile "backups\pre-migration-20251122-143022\absg5_full.backup" -DropExisting -Force

# Restore from SQL format backup
.\scripts\restore-database.ps1 -BackupFile "backups\pre-migration-20251122-143022\absg5_full.sql" -DropExisting

# Restore without dropping existing database (merge mode)
.\scripts\restore-database.ps1 -BackupFile "backups\pre-migration-20251122-143022\absg5_full.backup"
```

**Parameters:**
- `-BackupFile` (required): Path to backup file
- `-DropExisting`: Drop and recreate database before restore
- `-Force`: Skip confirmation prompt

**Warning:** This will replace all data in the target database!

### 3. rollback-migration.ps1

Performs a complete rollback of the migration, including code and database.

**Usage:**
```powershell
# Full rollback (code + database)
.\scripts\rollback-migration.ps1 -BackupPath "backups\pre-migration-20251122-143022" -Force

# Rollback code only
.\scripts\rollback-migration.ps1 -BackupPath "backups\pre-migration-20251122-143022" -SkipDatabase -Force

# Rollback database only
.\scripts\rollback-migration.ps1 -BackupPath "backups\pre-migration-20251122-143022" -SkipCode -Force
```

**Parameters:**
- `-BackupPath` (required): Path to backup directory
- `-Force`: Skip confirmation prompt
- `-SkipDatabase`: Skip database rollback
- `-SkipCode`: Skip code rollback

**What it does:**
- Switches git branch back to master
- Restores npm dependencies
- Restores database from backup
- Verifies rollback success

## Migration Workflow

### Phase 1: Preparation

1. **Create backup:**
   ```powershell
   .\scripts\backup-database.ps1
   ```

2. **Verify backup:**
   - Check backup files exist
   - Review BACKUP_MANIFEST.txt
   - Test restoration in staging environment

3. **Document backup location:**
   ```powershell
   # Note the backup path for rollback
   # Example: backups/pre-migration-20251122-143022
   ```

### Phase 2: Migration

1. **Ensure you're on migration branch:**
   ```powershell
   git branch  # Should show: migration/modernization-stack
   ```

2. **Proceed with migration tasks** (see tasks.md)

### Phase 3: Rollback (if needed)

1. **Immediate rollback:**
   ```powershell
   .\scripts\rollback-migration.ps1 -BackupPath "backups\pre-migration-20251122-143022" -Force
   ```

2. **Verify rollback:**
   - Check git branch is master
   - Test application startup
   - Verify database data

## Testing Backup/Restore

Before migration, test the backup and restore process:

```powershell
# 1. Create a test backup
.\scripts\backup-database.ps1 -BackupDir "backups\test"

# 2. Create a test database
createdb -U postgres absg5_test

# 3. Restore to test database (modify .env temporarily)
# Change DB_NAME_DEFAULT to absg5_test in .env
.\scripts\restore-database.ps1 -BackupFile "backups\test\...\absg5_full.backup" -DropExisting -Force

# 4. Verify test database
psql -U postgres -d absg5_test -c "SELECT COUNT(*) FROM \"user\";"

# 5. Clean up
dropdb -U postgres absg5_test
```

## Troubleshooting

### "pg_dump: command not found"

**Solution:** Add PostgreSQL bin directory to PATH:
```powershell
$env:PATH += ";C:\Program Files\PostgreSQL\16\bin"
```

### "Cannot connect to database"

**Solution:** 
1. Verify PostgreSQL is running
2. Check .env file has correct credentials
3. Test connection manually:
   ```powershell
   psql -h localhost -U your_user -d absg5
   ```

### "Permission denied"

**Solution:** 
1. Run PowerShell as Administrator
2. Or adjust execution policy:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### Backup file is too large

**Solution:**
1. Use compression:
   ```powershell
   # After backup, compress the files
   Compress-Archive -Path "backups\pre-migration-*" -DestinationPath "backups\backup.zip"
   ```

2. Or use pg_dump compression:
   ```powershell
   pg_dump -Z 9 -F c -f backup.backup.gz absg5
   ```

### Restore is very slow

**Solution:**
1. Disable triggers during restore:
   ```powershell
   pg_restore --disable-triggers ...
   ```

2. Increase PostgreSQL work_mem temporarily

## Best Practices

1. **Always create a backup before migration**
2. **Test backup restoration in staging first**
3. **Keep multiple backup copies** (local + remote)
4. **Document backup locations** in migration notes
5. **Verify backup integrity** before proceeding
6. **Monitor disk space** during backup/restore
7. **Use timestamped backups** to track versions
8. **Keep backups for at least 30 days** after successful migration

## Security Notes

- Backup files contain sensitive data - store securely
- Never commit backup files to git
- Use encrypted storage for backup archives
- Restrict access to backup directories
- Clear PGPASSWORD from environment after use (scripts do this automatically)

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review migration documentation in `.kiro/specs/modernization-stack/`
3. Contact the migration team

---

**Last Updated:** 2025-11-22  
**Version:** 1.0
