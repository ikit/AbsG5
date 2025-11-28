# Migration Scripts

This directory contains PowerShell scripts to help with the AbsG5 modernization migration.

## Scripts Overview

### 1. backup-database.ps1
Creates a complete backup of the PostgreSQL database before migration.

**Usage:**
```powershell
.\scripts\backup-database.ps1
```

**Parameters:**
- `-BackupDir` - Directory to store backups (default: `.\backups`)
- `-DbName` - Database name (default: `absg5`)
- `-DbUser` - PostgreSQL user (default: `postgres`)
- `-DbHost` - Database host (default: `localhost`)
- `-DbPort` - Database port (default: `5432`)

**Example:**
```powershell
.\scripts\backup-database.ps1 -BackupDir "C:\backups\absg5" -DbName "absg5_prod"
```

**Output:**
- Creates a timestamped SQL backup file
- Generates a JSON manifest with backup metadata
- Verifies backup file integrity

### 2. restore-database.ps1
Restores a PostgreSQL database from a backup file.

**Usage:**
```powershell
.\scripts\restore-database.ps1 -BackupFile ".\backups\absg5_backup_20251122_143000.sql"
```

**Parameters:**
- `-BackupFile` - Path to backup file (required)
- `-DbName` - Database name (default: `absg5`)
- `-DbUser` - PostgreSQL user (default: `postgres`)
- `-DbHost` - Database host (default: `localhost`)
- `-DbPort` - Database port (default: `5432`)
- `-Force` - Skip confirmation prompt

**Example:**
```powershell
# With confirmation
.\scripts\restore-database.ps1 -BackupFile ".\backups\absg5_backup_20251122_143000.sql"

# Without confirmation (use with caution!)
.\scripts\restore-database.ps1 -BackupFile ".\backups\absg5_backup_20251122_143000.sql" -Force
```

**Warning:** This script will DROP and recreate the database, destroying all current data!

### 3. rollback-migration.ps1
Rolls back the migration to the pre-migration state.

**Usage:**
```powershell
.\scripts\rollback-migration.ps1
```

**Parameters:**
- `-BackupFile` - Specific backup file to restore (optional, uses latest if not specified)
- `-GitTag` - Git tag to rollback to (default: `v5.2.0-pre-migration`)
- `-DatabaseOnly` - Only rollback database, keep code changes
- `-CodeOnly` - Only rollback code, keep database changes
- `-Force` - Skip confirmation prompt

**Examples:**
```powershell
# Full rollback (database + code)
.\scripts\rollback-migration.ps1

# Rollback database only
.\scripts\rollback-migration.ps1 -DatabaseOnly

# Rollback code only
.\scripts\rollback-migration.ps1 -CodeOnly

# Rollback to specific backup
.\scripts\rollback-migration.ps1 -BackupFile ".\backups\absg5_backup_20251122_143000.sql"
```

## Prerequisites

### PostgreSQL Client Tools
All scripts require PostgreSQL client tools (`pg_dump`, `psql`) to be installed and available in PATH.

**Installation:**
- Windows: Download from https://www.postgresql.org/download/windows/
- Or install via package manager: `choco install postgresql` (Chocolatey)

**Verify installation:**
```powershell
pg_dump --version
psql --version
```

### Git
The rollback script requires Git to be installed for code rollback functionality.

**Verify installation:**
```powershell
git --version
```

## Migration Workflow

### Before Migration

1. **Create a backup:**
   ```powershell
   .\scripts\backup-database.ps1
   ```

2. **Tag current version:**
   ```powershell
   git tag -a v5.2.0-pre-migration -m "Stable version before modernization"
   git push origin v5.2.0-pre-migration
   ```

3. **Create migration branch:**
   ```powershell
   git checkout -b migration/modernization-stack
   ```

### During Migration

- Keep regular backups at each phase completion
- Test rollback procedures in development environment
- Document any issues or deviations from plan

### If Rollback Needed

1. **Stop the application**

2. **Run rollback script:**
   ```powershell
   .\scripts\rollback-migration.ps1
   ```

3. **Verify rollback:**
   - Check database integrity
   - Test application functionality
   - Review logs

## Security Notes

### Password Handling
Scripts will prompt for PostgreSQL password if not set in environment variable `PGPASSWORD`.

**Option 1: Interactive prompt (recommended)**
```powershell
.\scripts\backup-database.ps1
# Will prompt for password
```

**Option 2: Environment variable (less secure)**
```powershell
$env:PGPASSWORD = "your_password"
.\scripts\backup-database.ps1
$env:PGPASSWORD = $null  # Clear after use
```

**Never commit passwords to version control!**

## Backup Best Practices

1. **Regular backups**: Create backups before each migration phase
2. **Verify backups**: Always verify backup files are not empty
3. **Test restores**: Periodically test restore procedures
4. **Off-site storage**: Store critical backups in a separate location
5. **Retention policy**: Keep multiple backup versions (at least 3-5)

## Troubleshooting

### "pg_dump not found"
- Install PostgreSQL client tools
- Add PostgreSQL bin directory to PATH
- Restart PowerShell after installation

### "Permission denied"
- Check PostgreSQL user permissions
- Verify database exists
- Check firewall settings

### "Database is being accessed by other users"
- Stop application servers
- Close all database connections
- Use `-Force` parameter (with caution)

### "Backup file is empty"
- Check disk space
- Verify database has data
- Check PostgreSQL logs for errors

## Support

For issues or questions:
1. Check the migration documentation in `.kiro/specs/modernization-stack/`
2. Review PostgreSQL logs
3. Consult the team lead

---

**Last Updated**: 2025-11-22
